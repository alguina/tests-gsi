-- Run in Supabase SQL editor if test start fails after an older schema install.
-- Safe to run multiple times.

create table if not exists users (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into users (id, name)
values ('8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c', 'Alex')
on conflict (id) do nothing;

create or replace function public.ensure_default_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name)
  values ('8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c', 'Alex')
  on conflict (id) do nothing;
end;
$$;

alter table test_sessions add column if not exists user_id uuid references users(id);
alter table test_sessions add column if not exists mode text;
alter table test_sessions add column if not exists title text;
alter table test_sessions add column if not exists created_at timestamptz default now();
alter table test_sessions add column if not exists completed_at timestamptz;

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

update test_sessions
set user_id = '8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c'
where user_id is null;

update test_sessions
set mode = 'random'
where mode is null;

alter table attempts add column if not exists user_id uuid references users(id);
alter table attempts add column if not exists selected_answer_id uuid references answers(id);
alter table attempts add column if not exists correct_answer_id uuid references answers(id);
alter table attempts add column if not exists correct_letter text;
alter table attempts add column if not exists answered_at timestamptz default now();

update attempts
set user_id = '8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c'
where user_id is null;

create or replace function public.get_random_questions(question_limit integer)
returns table (
  id uuid,
  source_id uuid,
  external_id text,
  text text,
  block text,
  topic text,
  year text,
  exam text,
  created_at timestamptz
)
language sql
stable
as $$
  select
    q.id,
    q.source_id,
    q.external_id,
    q.text,
    q.block,
    q.topic,
    q.year,
    q.exam,
    q.created_at
  from questions q
  where exists (
    select 1
    from answers a
    where a.question_id = q.id
      and a.is_correct = true
  )
  order by random()
  limit greatest(question_limit, 0);
$$;

alter table public.sources disable row level security;
alter table public.questions disable row level security;
alter table public.answers disable row level security;
alter table public.users disable row level security;
alter table public.test_sessions disable row level security;
alter table public.attempts disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sources to anon, authenticated;
grant select, insert, update, delete on public.questions to anon, authenticated;
grant select, insert, update, delete on public.answers to anon, authenticated;
grant select, insert, update, delete on public.users to anon, authenticated;
grant select, insert, update, delete on public.test_sessions to anon, authenticated;
grant select, insert, update, delete on public.attempts to anon, authenticated;
grant execute on function public.get_random_questions(integer) to anon, authenticated;
grant execute on function public.ensure_default_user() to anon, authenticated;
