-- Evidence nemovitostí v2 — Projects model
-- Replaces plots/tasks with projects/actions/attachments

-- Drop old tables (if they exist from v1)
drop table if exists public.en_tasks cascade;
drop table if exists public.en_plot_photos cascade;
drop table if exists public.en_plots cascade;

-- en_projects
create table if not exists public.en_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  current_up_state text,
  target_up_state text,
  min_parcel_area text,
  restrictions text,
  purchase_price text,
  purchase_date date,
  notes text,
  created_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.en_projects enable row level security;
create policy "EN: Auth read projects" on public.en_projects for select to authenticated using (true);
create policy "EN: Auth insert projects" on public.en_projects for insert to authenticated with check (true);
create policy "EN: Auth update projects" on public.en_projects for update to authenticated using (true);
create policy "EN: Admin or creator delete projects" on public.en_projects for delete to authenticated using (
  created_by = auth.uid() or exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);

-- en_project_plots (parcely přiřazené k projektu)
create table if not exists public.en_project_plots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.en_projects(id) on delete cascade,
  parcel_number text not null,
  area_m2 numeric,
  notes text,
  created_at timestamptz default now()
);
alter table public.en_project_plots enable row level security;
create policy "EN: Auth read project_plots" on public.en_project_plots for select to authenticated using (true);
create policy "EN: Auth insert project_plots" on public.en_project_plots for insert to authenticated with check (true);
create policy "EN: Auth update project_plots" on public.en_project_plots for update to authenticated using (true);
create policy "EN: Auth delete project_plots" on public.en_project_plots for delete to authenticated using (true);

-- en_project_actions (chronologický log úkonů)
create table if not exists public.en_project_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.en_projects(id) on delete cascade,
  action_date date not null default current_date,
  description text not null,
  person text,
  contact text,
  created_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now()
);
alter table public.en_project_actions enable row level security;
create policy "EN: Auth read project_actions" on public.en_project_actions for select to authenticated using (true);
create policy "EN: Auth insert project_actions" on public.en_project_actions for insert to authenticated with check (true);
create policy "EN: Auth update project_actions" on public.en_project_actions for update to authenticated using (true);
create policy "EN: Auth delete project_actions" on public.en_project_actions for delete to authenticated using (true);

-- en_project_attachments (přílohy — smlouvy, dopisy, rozhodnutí)
create table if not exists public.en_project_attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.en_projects(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  category text,
  uploaded_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now()
);
alter table public.en_project_attachments enable row level security;
create policy "EN: Auth read project_attachments" on public.en_project_attachments for select to authenticated using (true);
create policy "EN: Auth insert project_attachments" on public.en_project_attachments for insert to authenticated with check (true);
create policy "EN: Auth delete project_attachments" on public.en_project_attachments for delete to authenticated using (true);

-- Storage bucket for attachments
insert into storage.buckets (id, name, public) values ('en-attachments', 'en-attachments', false)
on conflict (id) do nothing;
create policy "EN: Auth upload attachments" on storage.objects for insert to authenticated with check (bucket_id = 'en-attachments');
create policy "EN: Auth read attachments" on storage.objects for select to authenticated using (bucket_id = 'en-attachments');
create policy "EN: Auth delete attachments" on storage.objects for delete to authenticated using (bucket_id = 'en-attachments');

-- Drop old storage bucket if exists
delete from storage.objects where bucket_id = 'en-plot-photos';
delete from storage.buckets where id = 'en-plot-photos';
