-- user_profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);
alter table public.user_profiles enable row level security;
create policy "Auth users can read all profiles" on public.user_profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.user_profiles for update to authenticated using (auth.uid() = id);
create policy "Admin can insert profiles" on public.user_profiles for insert to authenticated with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin can delete profiles" on public.user_profiles for delete to authenticated using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- plots
create table if not exists public.plots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  cadastral_number text,
  lv_number text,
  area_m2 numeric,
  gps_lat numeric,
  gps_lng numeric,
  notes text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.plots enable row level security;
create policy "Auth read plots" on public.plots for select to authenticated using (true);
create policy "Auth insert plots" on public.plots for insert to authenticated with check (true);
create policy "Auth update plots" on public.plots for update to authenticated using (true);
create policy "Admin or creator delete plots" on public.plots for delete to authenticated using (
  created_by = auth.uid() or exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- plot_photos
create table if not exists public.plot_photos (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  url text not null,
  caption text,
  uploaded_by uuid references public.user_profiles(id),
  created_at timestamptz default now()
);
alter table public.plot_photos enable row level security;
create policy "Auth read photos" on public.plot_photos for select to authenticated using (true);
create policy "Auth insert photos" on public.plot_photos for insert to authenticated with check (true);
create policy "Auth delete own or admin" on public.plot_photos for delete to authenticated using (
  uploaded_by = auth.uid() or exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'done')),
  assigned_to uuid references public.user_profiles(id),
  deadline date,
  completed_at timestamptz,
  reminder_date date,
  reminder_sent boolean default false,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Auth read tasks" on public.tasks for select to authenticated using (true);
create policy "Auth insert tasks" on public.tasks for insert to authenticated with check (true);
create policy "Auth update tasks" on public.tasks for update to authenticated using (true);
create policy "Admin or creator delete tasks" on public.tasks for delete to authenticated using (
  created_by = auth.uid() or exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- Storage bucket for plot photos
insert into storage.buckets (id, name, public) values ('plot-photos', 'plot-photos', true)
on conflict (id) do nothing;
create policy "Auth upload plot photos" on storage.objects for insert to authenticated with check (bucket_id = 'plot-photos');
create policy "Public read plot photos" on storage.objects for select using (bucket_id = 'plot-photos');
create policy "Auth delete plot photos" on storage.objects for delete to authenticated using (bucket_id = 'plot-photos');
