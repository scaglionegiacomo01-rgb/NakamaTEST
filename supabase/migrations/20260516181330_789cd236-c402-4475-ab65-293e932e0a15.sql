
-- 1. Profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS favorite_brands text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');

-- 2. Community messages
CREATE TABLE IF NOT EXISTS public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;

CREATE POLICY "Authenticated read messages" ON public.community_messages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own messages" ON public.community_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages or admin" ON public.community_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

CREATE INDEX IF NOT EXISTS community_messages_created_at_idx
  ON public.community_messages (created_at DESC);

-- 3. Admin notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  event_id uuid,
  actor_user_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read notifications" ON public.admin_notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete notifications" ON public.admin_notifications
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx
  ON public.admin_notifications (created_at DESC);

-- 4. Trigger: registration -> admin notification
CREATE OR REPLACE FUNCTION public.notify_admins_on_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event events%ROWTYPE;
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.admin_notifications (type, event_id, actor_user_id, payload)
  VALUES (
    'trip_join',
    NEW.event_id,
    NEW.user_id,
    jsonb_build_object(
      'user_name', COALESCE(v_profile.full_name, v_profile.username, v_profile.email, 'Member'),
      'username', v_profile.username,
      'trip_title', v_event.title,
      'destination', v_event.destination,
      'date', v_event.date,
      'needs_ride', NEW.needs_ride,
      'offers_car_seats', NEW.offers_car_seats,
      'available_car_seats', NEW.available_car_seats,
      'needs_rental', NEW.needs_rental,
      'has_equipment', NEW.has_equipment,
      'notes', NEW.notes
    )
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_registration ON public.event_registrations;
CREATE TRIGGER trg_notify_admins_on_registration
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_registration();

-- 5. Public profile function
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  username text,
  bio text,
  snowboard_level snowboard_level,
  favorite_brands text[],
  profile_picture_url text,
  created_at timestamptz,
  completed_trips bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id, p.full_name, p.username, p.bio, p.snowboard_level,
    p.favorite_brands, p.profile_picture_url, p.created_at,
    (SELECT count(*) FROM public.event_registrations r
       JOIN public.events e ON e.id = r.event_id
      WHERE r.user_id = p.user_id AND r.status = 'confirmed' AND e.status = 'completed')
  FROM public.profiles p WHERE p.user_id = _user_id
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;

-- 6. Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars','avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
