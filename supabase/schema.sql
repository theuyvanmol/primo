-- PRIMO portal: database schema, row-level security and file storage.
-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run.
-- It is safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE where possible).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables

create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  contact_email text,
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'client' check (role in ('admin','staff','client')),
  client_id  uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Pre-approved sign-ups: when this email registers and confirms, it gets this role/client.
create table if not exists public.invites (
  email      text primary key,
  role       text not null default 'client' check (role in ('admin','staff','client')),
  client_id  uuid references public.clients(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 160),
  description text,
  phase       text not null default 'Discovery'
              check (phase in ('Discovery','Strategy','Design','Design review','Production','Review','Launch','Completed','On hold')),
  progress    int  not null default 0 check (progress between 0 and 100),
  due_date    date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  status      text not null default 'To do' check (status in ('To do','In progress','Review','Done')),
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date    date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.approvals (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 200),
  description    text,
  status         text not null default 'Awaiting review'
                 check (status in ('Awaiting review','Approved','Changes requested')),
  client_comment text,
  decided_by     uuid references public.profiles(id) on delete set null,
  decided_at     timestamptz,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.files (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  name              text not null,
  storage_path      text not null unique,
  size_bytes        bigint,
  mime_type         text,
  visible_to_client boolean not null default true,
  uploaded_by       uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  number      text not null unique,
  description text,
  amount      numeric(12,2) not null check (amount >= 0),
  currency    text not null default 'USD' check (char_length(currency) = 3),
  status      text not null default 'Draft' check (status in ('Draft','Sent','Paid','Overdue')),
  due_date    date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.requests (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title      text not null check (char_length(title) between 1 and 200),
  body       text,
  status     text not null default 'Open' check (status in ('Open','In progress','Resolved')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid references public.projects(id) on delete cascade,
  actor_id          uuid references public.profiles(id) on delete set null,
  text              text not null,
  visible_to_client boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists projects_client_idx   on public.projects(client_id);
create index if not exists tasks_project_idx     on public.tasks(project_id);
create index if not exists approvals_project_idx on public.approvals(project_id);
create index if not exists files_project_idx     on public.files(project_id);
create index if not exists invoices_client_idx   on public.invoices(client_id);
create index if not exists requests_client_idx   on public.requests(client_id);
create index if not exists activity_project_idx  on public.activity(project_id, created_at desc);

-- ------------------------------------------------------- helper functions
-- SECURITY DEFINER so policies can read profiles without recursion.

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role in ('admin','staff') from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

create or replace function public.my_client_id() returns uuid
language sql stable security definer set search_path = public as
$$ select client_id from public.profiles where id = auth.uid() $$;

create or replace function public.project_client(pid uuid) returns uuid
language sql stable security definer set search_path = public as
$$ select client_id from public.projects where id = pid $$;

-- ------------------------------------------------- sign-up / role handling
-- Every new auth user gets a profile (role 'client', no access until linked).
-- Once the email is CONFIRMED the role is upgraded:
--   1. a matching row in public.invites wins;
--   2. the very first confirmed user becomes admin;
--   3. emails @primo-mc.com become staff.
-- IMPORTANT: keep "Confirm email" switched ON in Supabase Auth settings.

create or replace function public.apply_confirmed_role(uid uuid, mail text)
returns void language plpgsql security definer set search_path = public as $$
declare inv public.invites%rowtype;
begin
  select * into inv from public.invites where email = lower(mail);
  if found then
    update public.profiles set role = inv.role, client_id = inv.client_id where id = uid;
    delete from public.invites where email = lower(mail);
  elsif not exists (select 1 from public.profiles where role = 'admin') then
    update public.profiles set role = 'admin' where id = uid;
  elsif lower(mail) like '%@primo-mc.com' then
    update public.profiles set role = 'staff' where id = uid and role = 'client' and client_id is null;
  end if;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  if new.email_confirmed_at is not null then
    perform public.apply_confirmed_role(new.id, new.email);
  end if;
  return new;
end $$;

create or replace function public.handle_user_confirmed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.apply_confirmed_role(new.id, new.email);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created   on auth.users;
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_created   after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_confirmed();

-- ------------------------------------------------------------ RPC helpers

-- Client decision on an approval (clients cannot update the table directly).
create or replace function public.decide_approval(p_id uuid, p_status text, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
declare a public.approvals%rowtype; cid uuid;
begin
  if p_status not in ('Approved','Changes requested') then raise exception 'Invalid status'; end if;
  select * into a from public.approvals where id = p_id;
  if not found then raise exception 'Not found'; end if;
  cid := public.project_client(a.project_id);
  if not (public.is_staff() or cid = public.my_client_id()) then raise exception 'Not allowed'; end if;
  update public.approvals
     set status = p_status, client_comment = left(p_comment, 2000),
         decided_by = auth.uid(), decided_at = now()
   where id = p_id;
  insert into public.activity (project_id, actor_id, text, visible_to_client)
  values (a.project_id, auth.uid(), a.title || ': ' || p_status, true);
end $$;

-- Users may change only their own display name.
create or replace function public.update_my_name(p_name text) returns void
language sql security definer set search_path = public as
$$ update public.profiles set full_name = left(trim(p_name), 100) where id = auth.uid() $$;

grant execute on function public.decide_approval(uuid, text, text) to authenticated;
grant execute on function public.update_my_name(text) to authenticated;

-- ---------------------------------------------------- row level security

alter table public.clients   enable row level security;
alter table public.profiles  enable row level security;
alter table public.invites   enable row level security;
alter table public.projects  enable row level security;
alter table public.tasks     enable row level security;
alter table public.approvals enable row level security;
alter table public.files     enable row level security;
alter table public.invoices  enable row level security;
alter table public.requests  enable row level security;
alter table public.activity  enable row level security;

-- drop old versions so the script can be re-run
do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public'
             and tablename in ('clients','profiles','invites','projects','tasks','approvals','files','invoices','requests','activity')
  loop execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename); end loop;
end $$;

-- profiles
create policy profiles_read   on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy profiles_admin_update on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy profiles_admin_delete on public.profiles for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- invites
create policy invites_staff_read   on public.invites for select to authenticated using (public.is_staff());
create policy invites_staff_insert on public.invites for insert to authenticated
  with check (public.is_admin() or (public.is_staff() and role = 'client'));
create policy invites_staff_delete on public.invites for delete to authenticated using (public.is_staff());

-- clients (organisations)
create policy clients_staff_all  on public.clients for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy clients_own_read   on public.clients for select to authenticated
  using (id = public.my_client_id());

-- projects
create policy projects_staff_all on public.projects for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy projects_client_read on public.projects for select to authenticated
  using (client_id = public.my_client_id());

-- tasks: internal, staff only
create policy tasks_staff_all on public.tasks for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- approvals: clients read; they decide through decide_approval()
create policy approvals_staff_all on public.approvals for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy approvals_client_read on public.approvals for select to authenticated
  using (public.project_client(project_id) = public.my_client_id());

-- files
create policy files_staff_all on public.files for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy files_client_read on public.files for select to authenticated
  using (visible_to_client and public.project_client(project_id) = public.my_client_id());

-- invoices: clients never see drafts
create policy invoices_staff_all on public.invoices for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy invoices_client_read on public.invoices for select to authenticated
  using (status <> 'Draft' and client_id = public.my_client_id());

-- requests
create policy requests_staff_all on public.requests for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy requests_client_read on public.requests for select to authenticated
  using (client_id = public.my_client_id());
create policy requests_client_insert on public.requests for insert to authenticated
  with check (client_id = public.my_client_id() and created_by = auth.uid()
              and (project_id is null or public.project_client(project_id) = public.my_client_id()));

-- activity
create policy activity_staff_all on public.activity for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy activity_client_read on public.activity for select to authenticated
  using (visible_to_client and public.project_client(project_id) = public.my_client_id());

-- Nobody signed-out can touch anything.
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------- file storage
-- Private bucket. Object path convention: <project_id>/<random>-<filename>

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 52428800)   -- 50 MB per file
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "pf staff all"    on storage.objects;
drop policy if exists "pf client read"  on storage.objects;

create policy "pf staff all" on storage.objects for all to authenticated
  using (bucket_id = 'project-files' and public.is_staff())
  with check (bucket_id = 'project-files' and public.is_staff());

create policy "pf client read" on storage.objects for select to authenticated
  using (
    bucket_id = 'project-files' and exists (
      select 1 from public.files f
      where f.storage_path = storage.objects.name
        and f.visible_to_client
        and public.project_client(f.project_id) = public.my_client_id()
    )
  );

-- --------------------------------------------------------------- realtime
do $$ declare t text; begin
  foreach t in array array['projects','tasks','approvals','files','invoices','requests','activity','clients','profiles']
  loop
    begin execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null; when undefined_object then null; end;
  end loop;
end $$;
