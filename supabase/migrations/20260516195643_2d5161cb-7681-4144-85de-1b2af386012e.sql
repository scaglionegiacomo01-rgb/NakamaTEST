
-- Beginner Assist checklist tables
CREATE TYPE public.checklist_ready_status AS ENUM ('preparing','ready');

CREATE TABLE public.trip_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  ready_status public.checklist_ready_status NOT NULL DEFAULT 'preparing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE public.trip_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.trip_checklists(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (checklist_id, item_key)
);

ALTER TABLE public.event_registrations
  ADD COLUMN dismissed_assist_prompt BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.trip_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_checklist_items ENABLE ROW LEVEL SECURITY;

-- trip_checklists policies
CREATE POLICY "Owner or admin read checklist" ON public.trip_checklists
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Owner insert checklist" ON public.trip_checklists
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_event_participant(auth.uid(), event_id));

CREATE POLICY "Owner update checklist" ON public.trip_checklists
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin delete checklist" ON public.trip_checklists
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

-- trip_checklist_items policies (via parent checklist ownership)
CREATE POLICY "Read items if owner or admin" ON public.trip_checklist_items
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.trip_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Owner insert items" ON public.trip_checklist_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.trip_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Owner update items" ON public.trip_checklist_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.trip_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.trip_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Owner or admin delete items" ON public.trip_checklist_items
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.trip_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE TRIGGER trip_checklists_updated_at
  BEFORE UPDATE ON public.trip_checklists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
