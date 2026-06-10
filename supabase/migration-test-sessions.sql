-- Migration: add test-taking tables to an existing Supabase project.
-- Run this in the Supabase SQL editor if you already applied an older schema.sql.

create table if not exists test_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_questions integer not null,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  blank_count integer not null default 0,
  net_score numeric not null default 0
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references test_sessions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_letter text,
  is_correct boolean not null default false,
  is_blank boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists attempts_session_id_idx on attempts (session_id);
create index if not exists attempts_question_id_idx on attempts (question_id);

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

alter table public.test_sessions disable row level security;
alter table public.attempts disable row level security;

grant select, insert, update, delete on public.test_sessions to anon, authenticated;
grant select, insert, update, delete on public.attempts to anon, authenticated;
grant execute on function public.get_random_questions(integer) to anon, authenticated;
