-- 1. Add tracking columns to event_registrations
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS confirmation_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_error text;

-- 2. Trigger: when admin confirms a registration (from pending/waitlisted),
--    send a dedicated in-app notification and reset email-sent flag so the
--    confirmation email can be (re)dispatched.
CREATE OR REPLACE FUNCTION public.notify_registration_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_event events%ROWTYPE;
BEGIN
  IF NEW.status = 'confirmed'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND OLD.status IN ('pending','waitlisted') THEN
    SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
    PERFORM public.create_notification(
      NEW.user_id,
      'registration_confirmed',
      'You''re confirmed for ' || COALESCE(v_event.title, 'your trip'),
      'Your spot is confirmed. Check the trip details, carpool status, checklist and check-in instructions.',
      NEW.event_id
    );
    -- Reset email flag so confirmation email will be sent
    NEW.confirmation_email_sent := false;
    NEW.confirmation_email_sent_at := NULL;
    NEW.confirmation_email_error := NULL;
  END IF;

  -- If status leaves confirmed, clear flag so a future re-confirm re-sends
  IF OLD.status = 'confirmed' AND NEW.status <> 'confirmed' THEN
    NEW.confirmation_email_sent := false;
    NEW.confirmation_email_sent_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_registration_confirmed ON public.event_registrations;
CREATE TRIGGER trg_notify_registration_confirmed
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.notify_registration_confirmed();