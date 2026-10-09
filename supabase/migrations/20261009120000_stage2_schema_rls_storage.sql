-- DrainGuard Stage 2: schema, Row Level Security, and Storage.
-- Apply in the Supabase SQL Editor (or via the CLI). Safe to re-run.
-- The frontend still uses demo login and in-memory complaints until Stages 3–4.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('citizen', 'worker', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.hazard_type as enum ('open-drain', 'overflowing-drain', 'pothole');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.case_status as enum ('submitted', 'pending', 'in-progress', 'solved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.satisfaction as enum (
    'not-yet-resolved',
    'awaiting-confirmation',
    'satisfied',
    'not-applicable',
    'not-satisfied'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.attention_level as enum ('high', 'moderate', 'low');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.photo_kind as enum ('geotagged', 'normal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.attachment_kind as enum ('photo', 'audio');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables (functions that read these tables are created next)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'citizen',
  display_name text not null default 'Citizen',
  contact text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.regions (
  id text primary key,
  name text not null,
  pin text
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  citizen_id uuid not null references public.profiles (id) on delete restrict,
  hazard public.hazard_type not null,
  locality text not null,
  pin text,
  status public.case_status not null default 'submitted',
  satisfaction public.satisfaction not null default 'not-yet-resolved',
  attention public.attention_level not null default 'high',
  description text not null default '',
  photo_kind public.photo_kind not null default 'normal',
  site text not null default '',
  coords text not null default '',
  drain_id text,
  cover_id text,
  pothole_id text,
  worker_assigned text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaint_attachments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  kind public.attachment_kind not null,
  storage_bucket text not null,
  storage_path text not null,
  file_name text not null,
  mime text not null default 'application/octet-stream',
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create index if not exists complaints_citizen_id_idx on public.complaints (citizen_id);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaint_attachments_complaint_id_idx on public.complaint_attachments (complaint_id);

-- Helper functions (security definer so RLS on profiles does not recurse)
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('worker', 'admin'), false)
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

-- New auth users get a citizen profile. Staff roles are assigned only by an admin (Stage 3).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, contact)
  values (
    new.id,
    'citizen',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Citizen'),
    coalesce(new.email, new.phone, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Citizens may change only satisfaction on their own complaints.
-- Workers/admins may change operational fields, not ownership.
create or replace function public.enforce_complaint_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.app_role;
begin
  r := public.current_app_role();

  if r is null then
    raise exception 'Not allowed';
  end if;

  if r = 'citizen' then
    if new.id is distinct from old.id
      or new.public_id is distinct from old.public_id
      or new.citizen_id is distinct from old.citizen_id
      or new.hazard is distinct from old.hazard
      or new.locality is distinct from old.locality
      or new.pin is distinct from old.pin
      or new.status is distinct from old.status
      or new.attention is distinct from old.attention
      or new.description is distinct from old.description
      or new.photo_kind is distinct from old.photo_kind
      or new.site is distinct from old.site
      or new.coords is distinct from old.coords
      or new.drain_id is distinct from old.drain_id
      or new.cover_id is distinct from old.cover_id
      or new.pothole_id is distinct from old.pothole_id
      or new.worker_assigned is distinct from old.worker_assigned
      or new.rejection_reason is distinct from old.rejection_reason
    then
      raise exception 'Citizens can only update satisfaction on their own complaints';
    end if;
    return new;
  end if;

  new.id := old.id;
  new.public_id := old.public_id;
  new.citizen_id := old.citizen_id;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.enforce_complaint_update() from public, anon, authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
  before update on public.complaints
  for each row execute function public.set_updated_at();

drop trigger if exists complaints_enforce_update on public.complaints;
create trigger complaints_enforce_update
  before update on public.complaints
  for each row execute function public.enforce_complaint_update();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sample Pune localities (matches the prototype). Does not overwrite existing rows.
insert into public.regions (id, name, pin) values
  ('hadapsar', 'Hadapsar', '411028'),
  ('yerwada', 'Yerwada', '411006'),
  ('chandan-nagar', 'Chandan Nagar', null),
  ('vanaz', 'Vanaz', null),
  ('ramwadi', 'Ramwadi', null),
  ('sadashiv-peth', 'Sadashiv Peth', '411030'),
  ('shaniwar-peth', 'Shaniwar Peth', null),
  ('narayan-peth', 'Narayan Peth', null),
  ('kasba-peth', 'Kasba Peth', null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Grants: authenticated users only. anon has no table access.
-- ---------------------------------------------------------------------------
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.regions from anon, authenticated;
revoke all on table public.complaints from anon, authenticated;
revoke all on table public.complaint_attachments from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.regions to authenticated;
grant select, insert, update on table public.complaints to authenticated;
grant select, insert, delete on table public.complaint_attachments to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.regions enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_attachments enable row level security;

drop policy if exists "profiles_select_self_or_staff" on public.profiles;
create policy "profiles_select_self_or_staff"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_app_role());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "regions_select_authenticated" on public.regions;
create policy "regions_select_authenticated"
  on public.regions for select to authenticated
  using (true);

drop policy if exists "regions_admin_write" on public.regions;
create policy "regions_admin_write"
  on public.regions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "complaints_select_own_or_staff" on public.complaints;
create policy "complaints_select_own_or_staff"
  on public.complaints for select to authenticated
  using (citizen_id = auth.uid() or public.is_staff());

drop policy if exists "complaints_insert_own" on public.complaints;
create policy "complaints_insert_own"
  on public.complaints for insert to authenticated
  with check (citizen_id = auth.uid() and public.current_app_role() = 'citizen');

drop policy if exists "complaints_update_own_or_staff" on public.complaints;
create policy "complaints_update_own_or_staff"
  on public.complaints for update to authenticated
  using (citizen_id = auth.uid() or public.is_staff())
  with check (citizen_id = auth.uid() or public.is_staff());

drop policy if exists "attachments_select_own_or_staff" on public.complaint_attachments;
create policy "attachments_select_own_or_staff"
  on public.complaint_attachments for select to authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.citizen_id = auth.uid()
    )
  );

drop policy if exists "attachments_insert_own" on public.complaint_attachments;
create policy "attachments_insert_own"
  on public.complaint_attachments for insert to authenticated
  with check (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.citizen_id = auth.uid()
    )
  );

drop policy if exists "attachments_delete_own_or_admin" on public.complaint_attachments;
create policy "attachments_delete_own_or_admin"
  on public.complaint_attachments for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.citizen_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage buckets (private). Path convention: {user_id}/{complaint_id}/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-photos',
  'complaint-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-audio',
  'complaint-audio',
  false,
  10485760,
  array[
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/x-m4a',
    'audio/opus'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_insert_own_folder" on storage.objects;
create policy "photos_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'complaint-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_select_own_or_staff" on storage.objects;
create policy "photos_select_own_or_staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'complaint-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );

drop policy if exists "photos_delete_own_or_admin" on storage.objects;
create policy "photos_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'complaint-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "audio_insert_own_folder" on storage.objects;
create policy "audio_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'complaint-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "audio_select_own_or_staff" on storage.objects;
create policy "audio_select_own_or_staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'complaint-audio'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );

drop policy if exists "audio_delete_own_or_admin" on storage.objects;
create policy "audio_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'complaint-audio'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
