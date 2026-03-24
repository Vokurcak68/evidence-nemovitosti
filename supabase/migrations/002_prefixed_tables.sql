-- Evidence nemovitostí — prefixed tables for shared Supabase project
-- Prefix: en_ (evidence nemovitostí)

-- en_user_profiles
create table if not exists public.en_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);
alter table public.en_user_profiles enable row level security;
create policy "EN: Auth users can read all profiles" on public.en_user_profiles for select to authenticated using (true);
create policy "EN: Users can update own profile" on public.en_user_profiles for update to authenticated using (auth.uid() = id);
create policy "EN: Admin can insert profiles" on public.en_user_profiles for insert to authenticated with check (
  exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);
create policy "EN: Admin can delete profiles" on public.en_user_profiles for delete to authenticated using (
  exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);

-- en_plots
create table if not exists public.en_plots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  cadastral_number text,
  lv_number text,
  area_m2 numeric,
  gps_lat numeric,
  gps_lng numeric,
  notes text,
  created_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.en_plots enable row level security;
create policy "EN: Auth read plots" on public.en_plots for select to authenticated using (true);
create policy "EN: Auth insert plots" on public.en_plots for insert to authenticated with check (true);
create policy "EN: Auth update plots" on public.en_plots for update to authenticated using (true);
create policy "EN: Admin or creator delete plots" on public.en_plots for delete to authenticated using (
  created_by = auth.uid() or exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);

-- en_plot_photos
create table if not exists public.en_plot_photos (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.en_plots(id) on delete cascade,
  url text not null,
  caption text,
  uploaded_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now()
);
alter table public.en_plot_photos enable row level security;
create policy "EN: Auth read photos" on public.en_plot_photos for select to authenticated using (true);
create policy "EN: Auth insert photos" on public.en_plot_photos for insert to authenticated with check (true);
create policy "EN: Auth delete own or admin" on public.en_plot_photos for delete to authenticated using (
  uploaded_by = auth.uid() or exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);

-- en_tasks
create table if not exists public.en_tasks (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.en_plots(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'done')),
  assigned_to uuid references public.en_user_profiles(id),
  deadline date,
  completed_at timestamptz,
  reminder_date date,
  reminder_sent boolean default false,
  created_by uuid references public.en_user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.en_tasks enable row level security;
create policy "EN: Auth read tasks" on public.en_tasks for select to authenticated using (true);
create policy "EN: Auth insert tasks" on public.en_tasks for insert to authenticated with check (true);
create policy "EN: Auth update tasks" on public.en_tasks for update to authenticated using (true);
create policy "EN: Admin or creator delete tasks" on public.en_tasks for delete to authenticated using (
  created_by = auth.uid() or exists (select 1 from public.en_user_profiles where id = auth.uid() and role = 'admin')
);

-- Storage bucket for plot photos (prefixed)
insert into storage.buckets (id, name, public) values ('en-plot-photos', 'en-plot-photos', true)
on conflict (id) do nothing;
create policy "EN: Auth upload plot photos" on storage.objects for insert to authenticated with check (bucket_id = 'en-plot-photos');
create policy "EN: Public read plot photos" on storage.objects for select using (bucket_id = 'en-plot-photos');
create policy "EN: Auth delete plot photos" on storage.objects for delete to authenticated using (bucket_id = 'en-plot-photos');
