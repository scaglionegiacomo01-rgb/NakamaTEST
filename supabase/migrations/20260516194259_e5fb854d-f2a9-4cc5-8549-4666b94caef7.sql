
-- Enum for media status
DO $$ BEGIN
  CREATE TYPE public.media_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table
CREATE TABLE IF NOT EXISTS public.trip_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  storage_path text,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  caption text,
  status public.media_status NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  is_trip_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_media_event ON public.trip_media(event_id);
CREATE INDEX IF NOT EXISTS idx_trip_media_user ON public.trip_media(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_media_status ON public.trip_media(status);

ALTER TABLE public.trip_media ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
DROP TRIGGER IF EXISTS trip_media_set_updated_at ON public.trip_media;
CREATE TRIGGER trip_media_set_updated_at
  BEFORE UPDATE ON public.trip_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS policies
DROP POLICY IF EXISTS "Read approved or own or admin" ON public.trip_media;
CREATE POLICY "Read approved or own or admin" ON public.trip_media
  FOR SELECT TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Participants insert media" ON public.trip_media;
CREATE POLICY "Participants insert media" ON public.trip_media
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      has_role(auth.uid(),'admin'::app_role) OR EXISTS (
        SELECT 1 FROM public.event_registrations r
        WHERE r.event_id = trip_media.event_id
          AND r.user_id = auth.uid()
          AND r.status = 'confirmed'
      )
    )
  );

DROP POLICY IF EXISTS "Owner update own pending or admin" ON public.trip_media;
CREATE POLICY "Owner update own pending or admin" ON public.trip_media
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR (auth.uid() = user_id AND status = 'pending')
  )
  WITH CHECK (
    has_role(auth.uid(),'admin'::app_role)
    OR (auth.uid() = user_id AND status = 'pending')
  );

DROP POLICY IF EXISTS "Owner delete own pending or admin" ON public.trip_media;
CREATE POLICY "Owner delete own pending or admin" ON public.trip_media
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR (auth.uid() = user_id AND status = 'pending')
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-media','trip-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read trip-media" ON storage.objects;
CREATE POLICY "Public read trip-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-media');

DROP POLICY IF EXISTS "Confirmed participants upload trip-media" ON storage.objects;
CREATE POLICY "Confirmed participants upload trip-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trip-media'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND (
      has_role(auth.uid(),'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.event_registrations r
        WHERE r.event_id::text = (storage.foldername(name))[1]
          AND r.user_id = auth.uid()
          AND r.status = 'confirmed'
      )
    )
  );

DROP POLICY IF EXISTS "Owner delete trip-media" ON storage.objects;
CREATE POLICY "Owner delete trip-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'trip-media'
    AND (
      has_role(auth.uid(),'admin'::app_role)
      OR (storage.foldername(name))[2] = auth.uid()::text
    )
  );

-- Notification triggers
CREATE OR REPLACE FUNCTION public.notify_trip_media_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_event events%ROWTYPE; v_admin uuid;
BEGIN
  SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
  INSERT INTO public.admin_notifications (type, event_id, actor_user_id, payload)
  VALUES (
    'media_upload', NEW.event_id, NEW.user_id,
    jsonb_build_object('trip_title', v_event.title, 'media_type', NEW.media_type)
  );
  FOR v_admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    PERFORM public.create_notification(
      v_admin, 'media_pending',
      'New gallery upload',
      'New ' || NEW.media_type || ' waiting for moderation on ' || COALESCE(v_event.title,'a trip'),
      NEW.event_id
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_trip_media_created ON public.trip_media;
CREATE TRIGGER trg_notify_trip_media_created
  AFTER INSERT ON public.trip_media
  FOR EACH ROW EXECUTE FUNCTION public.notify_trip_media_created();

CREATE OR REPLACE FUNCTION public.notify_trip_media_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_event events%ROWTYPE; v_user uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
    IF NEW.status = 'approved' THEN
      PERFORM public.create_notification(
        NEW.user_id, 'media_approved',
        'Your photo was approved',
        'Your ' || NEW.media_type || ' from ' || COALESCE(v_event.title,'a trip') || ' was approved.',
        NEW.event_id
      );
      -- Notify other confirmed participants
      FOR v_user IN
        SELECT user_id FROM public.event_registrations
        WHERE event_id = NEW.event_id AND status = 'confirmed' AND user_id <> NEW.user_id
      LOOP
        PERFORM public.create_notification(
          v_user, 'media_added',
          'New memories added',
          'New memories were added to ' || COALESCE(v_event.title,'a trip you joined') || '.',
          NEW.event_id
        );
      END LOOP;
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.user_id, 'media_rejected',
        'Your upload was not approved',
        'Your ' || NEW.media_type || ' from ' || COALESCE(v_event.title,'a trip') || ' was rejected.',
        NEW.event_id
      );
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_trip_media_status ON public.trip_media;
CREATE TRIGGER trg_notify_trip_media_status
  AFTER UPDATE ON public.trip_media
  FOR EACH ROW EXECUTE FUNCTION public.notify_trip_media_status();
