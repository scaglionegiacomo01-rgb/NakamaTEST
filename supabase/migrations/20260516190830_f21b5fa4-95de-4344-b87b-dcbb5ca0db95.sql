-- Extend trip_checkins with timestamps, status and admin-mark fields
DO $$ BEGIN
  CREATE TYPE public.checkin_status AS ENUM (
    'not_checked_in','arrived_meeting_point','arrived_destination','returned','absent','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.trip_checkins
  ADD COLUMN IF NOT EXISTS meeting_point_checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS destination_checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS status public.checkin_status NOT NULL DEFAULT 'not_checked_in',
  ADD COLUMN IF NOT EXISTS marked_by_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_marked_by uuid;

-- Unique per (event_id, user_id)
DO $$ BEGIN
  ALTER TABLE public.trip_checkins ADD CONSTRAINT trip_checkins_event_user_unique UNIQUE (event_id, user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- Trigger: auto-set timestamps and derive status
CREATE OR REPLACE FUNCTION public.sync_checkin_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.meeting_point_checked_in AND (OLD.meeting_point_checked_in IS DISTINCT FROM NEW.meeting_point_checked_in) THEN
    NEW.meeting_point_checked_in_at := COALESCE(NEW.meeting_point_checked_in_at, now());
  END IF;
  IF NEW.destination_checked_in AND (OLD.destination_checked_in IS DISTINCT FROM NEW.destination_checked_in) THEN
    NEW.destination_checked_in_at := COALESCE(NEW.destination_checked_in_at, now());
  END IF;
  IF NEW.return_checked_in AND (OLD.return_checked_in IS DISTINCT FROM NEW.return_checked_in) THEN
    NEW.return_checked_in_at := COALESCE(NEW.return_checked_in_at, now());
  END IF;
  -- Derive status unless an admin explicitly set absent/cancelled
  IF NEW.status NOT IN ('absent','cancelled') THEN
    IF NEW.return_checked_in THEN NEW.status := 'returned';
    ELSIF NEW.destination_checked_in THEN NEW.status := 'arrived_destination';
    ELSIF NEW.meeting_point_checked_in THEN NEW.status := 'arrived_meeting_point';
    ELSE NEW.status := 'not_checked_in';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_checkin_status ON public.trip_checkins;
CREATE TRIGGER trg_sync_checkin_status
BEFORE INSERT OR UPDATE ON public.trip_checkins
FOR EACH ROW EXECUTE FUNCTION public.sync_checkin_status();

-- Admin can insert check-in rows on behalf of any participant
DROP POLICY IF EXISTS "Admin insert checkin" ON public.trip_checkins;
CREATE POLICY "Admin insert checkin" ON public.trip_checkins
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Send check-in reminder notifications to confirmed participants who have not checked in
CREATE OR REPLACE FUNCTION public.send_checkin_reminders(_event_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_event events%ROWTYPE; v_count int := 0; v_user uuid;
BEGIN
  IF NOT has_role(auth.uid(),'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can send reminders';
  END IF;
  SELECT * INTO v_event FROM public.events WHERE id = _event_id;
  FOR v_user IN
    SELECT r.user_id FROM public.event_registrations r
    LEFT JOIN public.trip_checkins c ON c.event_id = r.event_id AND c.user_id = r.user_id
    WHERE r.event_id = _event_id AND r.status = 'confirmed'
      AND (c.id IS NULL OR c.meeting_point_checked_in = false)
      AND (c.status IS NULL OR c.status NOT IN ('absent','cancelled'))
  LOOP
    PERFORM public.create_notification(
      v_user, 'checkin_reminder',
      'Roll call open',
      'Tap "I''m here" to check in for ' || COALESCE(v_event.title,'your trip'),
      _event_id
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;