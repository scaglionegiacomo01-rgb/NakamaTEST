
-- ENUMS
CREATE TYPE public.seat_request_status AS ENUM ('pending','accepted','rejected','cancelled');
CREATE TYPE public.transport_status AS ENUM ('have_car_will_drive','have_car_no_drive','no_car_can_drive','no_car_need_seat');
CREATE TYPE public.crew_post_status AS ENUM ('open','closed');

-- EVENTS additions
ALTER TABLE public.events
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN safety_meeting_point_ok boolean NOT NULL DEFAULT false,
  ADD COLUMN safety_destination_ok boolean NOT NULL DEFAULT false,
  ADD COLUMN safety_return_ok boolean NOT NULL DEFAULT false;

-- EVENT_REGISTRATIONS additions
ALTER TABLE public.event_registrations
  ADD COLUMN transport_status public.transport_status;

-- Helper function: is the user a registered participant of an event?
CREATE OR REPLACE FUNCTION public.is_event_participant(_user_id uuid, _event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_registrations
    WHERE event_id = _event_id AND user_id = _user_id
      AND status IN ('pending','confirmed')
  )
$$;

-- TRIP CARS
CREATE TABLE public.trip_cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  driver_user_id uuid NOT NULL,
  departure_area text NOT NULL,
  meeting_point text,
  available_seats int NOT NULL DEFAULT 0 CHECK (available_seats >= 0 AND available_seats <= 8),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, driver_user_id)
);
ALTER TABLE public.trip_cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and admins read cars" ON public.trip_cars FOR SELECT TO authenticated
  USING (public.is_event_participant(auth.uid(), event_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Drivers insert own car" ON public.trip_cars FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = driver_user_id AND public.is_event_participant(auth.uid(), event_id));
CREATE POLICY "Drivers update own car" ON public.trip_cars FOR UPDATE TO authenticated
  USING (auth.uid() = driver_user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = driver_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Drivers delete own car" ON public.trip_cars FOR DELETE TO authenticated
  USING (auth.uid() = driver_user_id OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trip_cars_updated_at BEFORE UPDATE ON public.trip_cars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEAT SEEKERS
CREATE TABLE public.seat_seekers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  departure_area text NOT NULL,
  can_reach_meeting_point boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.seat_seekers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and admins read seekers" ON public.seat_seekers FOR SELECT TO authenticated
  USING (public.is_event_participant(auth.uid(), event_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own seeker" ON public.seat_seekers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_event_participant(auth.uid(), event_id));
CREATE POLICY "Users update own seeker" ON public.seat_seekers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users delete own seeker" ON public.seat_seekers FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER seat_seekers_updated_at BEFORE UPDATE ON public.seat_seekers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEAT REQUESTS
CREATE TABLE public.seat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES public.trip_cars(id) ON DELETE CASCADE,
  passenger_user_id uuid NOT NULL,
  status public.seat_request_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(car_id, passenger_user_id)
);
ALTER TABLE public.seat_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passenger driver admin read" ON public.seat_requests FOR SELECT TO authenticated
  USING (
    auth.uid() = passenger_user_id
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.trip_cars c WHERE c.id = car_id AND c.driver_user_id = auth.uid())
  );
CREATE POLICY "Passenger insert" ON public.seat_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = passenger_user_id AND public.is_event_participant(auth.uid(), event_id));
CREATE POLICY "Passenger driver admin update" ON public.seat_requests FOR UPDATE TO authenticated
  USING (
    auth.uid() = passenger_user_id
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.trip_cars c WHERE c.id = car_id AND c.driver_user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = passenger_user_id
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.trip_cars c WHERE c.id = car_id AND c.driver_user_id = auth.uid())
  );
CREATE POLICY "Passenger admin delete" ON public.seat_requests FOR DELETE TO authenticated
  USING (auth.uid() = passenger_user_id OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER seat_requests_updated_at BEFORE UPDATE ON public.seat_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TRIP CHAT
CREATE TABLE public.trip_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_chat_messages REPLICA IDENTITY FULL;

CREATE POLICY "Participants and admins read chat" ON public.trip_chat_messages FOR SELECT TO authenticated
  USING (public.is_event_participant(auth.uid(), event_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Participants insert chat" ON public.trip_chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_event_participant(auth.uid(), event_id) OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Users delete own chat or admin" ON public.trip_chat_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_chat_messages;

-- CREW POSTS
CREATE TABLE public.crew_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  destination text,
  when_text text,
  activity text NOT NULL DEFAULT 'snowboard',
  level text NOT NULL DEFAULT 'mixed',
  departure_area text,
  has_car boolean NOT NULL DEFAULT false,
  needs_car boolean NOT NULL DEFAULT false,
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  status public.crew_post_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crew_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read posts" ON public.crew_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own post" ON public.crew_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own post" ON public.crew_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users delete own post or admin" ON public.crew_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crew_posts_updated_at BEFORE UPDATE ON public.crew_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CREW POST COMMENTS
CREATE TABLE public.crew_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.crew_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crew_post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read comments" ON public.crew_post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own comment" ON public.crew_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comment or admin" ON public.crew_post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- TRIP CHECKINS
CREATE TABLE public.trip_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  meeting_point_checked_in boolean NOT NULL DEFAULT false,
  destination_checked_in boolean NOT NULL DEFAULT false,
  return_checked_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.trip_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self or admin read checkins" ON public.trip_checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Self insert checkin" ON public.trip_checkins FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id AND public.is_event_participant(auth.uid(), event_id)) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Self or admin update checkin" ON public.trip_checkins FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trip_checkins_updated_at BEFORE UPDATE ON public.trip_checkins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  related_event_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- INSERT: only via SECURITY DEFINER triggers (no policy needed)

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Helper to insert a notification (security definer)
CREATE OR REPLACE FUNCTION public.create_notification(_user_id uuid, _type text, _title text, _message text, _event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, message, related_event_id)
  VALUES (_user_id, _type, _title, _message, _event_id);
END; $$;

-- Trigger: notify driver when a seat request is created
CREATE OR REPLACE FUNCTION public.notify_seat_request_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_driver uuid;
  v_event events%ROWTYPE;
  v_passenger profiles%ROWTYPE;
BEGIN
  SELECT driver_user_id INTO v_driver FROM public.trip_cars WHERE id = NEW.car_id;
  SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
  SELECT * INTO v_passenger FROM public.profiles WHERE user_id = NEW.passenger_user_id;
  PERFORM public.create_notification(
    v_driver, 'seat_request',
    'New seat request',
    COALESCE(v_passenger.full_name, v_passenger.username, 'A member') || ' requested a seat for ' || COALESCE(v_event.title,'your trip'),
    NEW.event_id
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_seat_request_created AFTER INSERT ON public.seat_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_seat_request_created();

-- Trigger: notify passenger when status changes
CREATE OR REPLACE FUNCTION public.notify_seat_request_updated()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_event events%ROWTYPE;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
    PERFORM public.create_notification(
      NEW.passenger_user_id, 'seat_request_status',
      'Seat request ' || NEW.status,
      'Your seat request for ' || COALESCE(v_event.title,'a trip') || ' is now ' || NEW.status,
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_seat_request_updated AFTER UPDATE ON public.seat_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_seat_request_updated();

-- Trigger: notify user when registration status changes
CREATE OR REPLACE FUNCTION public.notify_registration_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_event events%ROWTYPE;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
    PERFORM public.create_notification(
      NEW.user_id, 'registration_status',
      'Trip status: ' || NEW.status,
      'Your registration for ' || COALESCE(v_event.title,'a trip') || ' is now ' || NEW.status,
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_registration_status AFTER UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_registration_status();

-- Make sure existing admin notify trigger still exists on event_registrations
DROP TRIGGER IF EXISTS trg_notify_admins_on_registration ON public.event_registrations;
CREATE TRIGGER trg_notify_admins_on_registration AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_registration();
