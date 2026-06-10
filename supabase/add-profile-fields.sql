-- Migration: add normalized_name and last_seen_at to users table.
-- Run this in the Supabase SQL editor for existing projects.
-- New installs can use schema.sql directly (already includes these columns).

-- Add columns if missing
alter table public.users add column if not exists normalized_name text;
alter table public.users add column if not exists last_seen_at timestamptz;

-- Ensure id has a default so new users can be created without specifying id.
-- The original schema created id without a default value.
alter table public.users alter column id set default gen_random_uuid();

-- Backfill normalized_name for existing rows (handles trim + lowercase + collapse spaces)
update public.users
set normalized_name = lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
where normalized_name is null;

-- Make normalized_name not null now that it is populated
alter table public.users alter column normalized_name set not null;

-- Unique index on normalized_name for fast lookups and conflict-free inserts
create unique index if not exists users_normalized_name_idx on public.users (normalized_name);

-- Replace ensure_default_user to also set normalized_name
create or replace function public.ensure_default_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, normalized_name)
  values (
    '8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c',
    'Alex',
    'alex'
  )
  on conflict (id) do update
    set normalized_name = coalesce(users.normalized_name, 'alex');
end;
$$;

-- Ensure grants are in place
grant execute on function public.ensure_default_user() to anon, authenticated;
