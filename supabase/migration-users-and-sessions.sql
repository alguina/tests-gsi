-- Migration: users table + extended test_sessions / attempts for multi-user readiness.
-- Run in Supabase SQL editor after schema.sql or migration-test-sessions.sql.

create table if not exists users (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into users (id, name)
values ('8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c', 'Alex')
on conflict (id) do nothing;

-- test_sessions: add user/mode/title/created_at; rename finished_at -> completed_at
alter table test_sessions add column if not exists user_id uuid references users(id);
alter table test_sessions add column if not exists mode text;
alter table test_sessions add column if not exists title text;
alter table test_sessions add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'test_sessions'
      and column_name = 'finished_at'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'test_sessions'
      and column_name = 'completed_at'
  ) then
    alter table test_sessions rename column finished_at to completed_at;
  end if;
end $$;

alter table test_sessions add column if not exists completed_at timestamptz;

update test_sessions
set user_id = '8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c'
where user_id is null;

update test_sessions
set mode = 'random'
where mode is null;

-- attempts: extended fields
alter table attempts add column if not exists user_id uuid references users(id);
alter table attempts add column if not exists selected_answer_id uuid references answers(id);
alter table attempts add column if not exists correct_answer_id uuid references answers(id);
alter table attempts add column if not exists correct_letter text;
alter table attempts add column if not exists answered_at timestamptz default now();

update attempts
set user_id = '8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c'
where user_id is null;

create index if not exists test_sessions_user_id_idx on test_sessions (user_id);
create index if not exists test_sessions_completed_at_idx on test_sessions (completed_at);
create index if not exists attempts_user_id_idx on attempts (user_id);

alter table public.users disable row level security;

grant select, insert, update, delete on public.users to anon, authenticated;
