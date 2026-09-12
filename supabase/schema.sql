-- =====================================================================
-- HUDDLE — database schema
-- Run this once in Supabase SQL editor (Project -> SQL Editor -> New query)
-- =====================================================================

-- ---------- ENUMS ----------
create type project_status as enum ('open', 'closed');
create type request_status as enum ('pending', 'accepted', 'rejected');

-- ---------- TABLES ----------

-- One row per user, created automatically on signup (see trigger below)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- A "looking for a partner" post
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  skills_needed text[] not null default '{}',
  status project_status not null default 'open',
  created_at timestamptz not null default now()
);

-- A student asking to join a project
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (project_id, requester_id)
);

create index projects_owner_idx on public.projects (owner_id);
create index projects_status_idx on public.projects (status);
create index join_requests_project_idx on public.join_requests (project_id);
create index join_requests_requester_idx on public.join_requests (requester_id);

-- ---------- AUTO-CREATE PROFILE ON SIGNUP ----------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.join_requests enable row level security;

-- profiles: anyone signed in can view profiles; a user can only edit their own
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- projects: anyone signed in can view; only the owner can write/change/delete
create policy "projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "owners can update their own projects"
  on public.projects for update
  using (auth.uid() = owner_id);

create policy "owners can delete their own projects"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- join_requests: visible to the requester AND the project owner only
create policy "requests are viewable by requester or project owner"
  on public.join_requests for select
  using (
    auth.uid() = requester_id
    or auth.uid() = (select owner_id from public.projects where id = project_id)
  );

create policy "a user can request to join as themself"
  on public.join_requests for insert
  with check (auth.uid() = requester_id);

-- only the project owner can accept/reject a request
create policy "owners can update request status"
  on public.join_requests for update
  using (auth.uid() = (select owner_id from public.projects where id = project_id));

-- a requester can withdraw their own still-pending request
create policy "requester can withdraw a pending request"
  on public.join_requests for delete
  using (auth.uid() = requester_id and status = 'pending');

-- ---------- STORAGE (avatar uploads) ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- REALTIME ----------
-- lets the app subscribe to live changes on join_requests (for notifications)
alter publication supabase_realtime add table public.join_requests;
