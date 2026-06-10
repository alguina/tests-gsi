-- Migration: add profile fields and create find_or_create_user RPC.
-- Safe to run multiple times (idempotent).
-- Run this in the Supabase SQL editor for existing projects.
-- New installs can use schema.sql directly (already includes these columns).

-- 1. Add columns if missing
alter table public.users add column if not exists normalized_name text;
alter table public.users add column if not exists last_seen_at timestamptz;

-- 2. Ensure id generates its own UUID so new rows can be inserted without specifying id.
alter table public.users alter column id set default gen_random_uuid();

-- 3. Backfill normalized_name for existing rows
update public.users
set normalized_name = lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
where normalized_name is null;

-- 4. Make normalized_name not null now that it is populated
alter table public.users alter column normalized_name set not null;

-- 5. Unique index on normalized_name
create unique index if not exists users_normalized_name_idx on public.users (normalized_name);

-- 6. RPC to find or create a user robustly (works with both old and new schema,
--    generates UUID server-side, runs with elevated privileges to bypass RLS).
create or replace function public.find_or_create_user(
  p_name text,
  p_normalized_name text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_name text;
begin
  -- Find existing user by normalized name
  select id, name into v_id, v_name
  from public.users
  where normalized_name = p_normalized_name
  limit 1;

  if found then
    -- Touch last_seen_at
    update public.users set last_seen_at = now() where id = v_id;
    return json_build_object('id', v_id, 'name', v_name);
  end if;

  -- Create new user with server-generated UUID
  insert into public.users (id, name, normalized_name, last_seen_at)
  values (gen_random_uuid(), p_name, p_normalized_name, now())
  returning id, name into v_id, v_name;

  return json_build_object('id', v_id, 'name', v_name);
end;
$$;

grant execute on function public.find_or_create_user(text, text) to anon, authenticated;

-- 7. Update ensure_default_user to include normalized_name
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

grant execute on function public.ensure_default_user() to anon, authenticated;
