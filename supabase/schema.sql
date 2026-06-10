-- GSI A2 study app — Preparatic import schema
-- Run this in the Supabase SQL editor (or via psql) to create tables.
-- Row-level security is intentionally disabled for local MVP.

create extension if not exists "pgcrypto";

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text,
  source_type text not null default 'preparatic',
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  external_id text,
  text text not null,
  block text,
  topic text,
  year text,
  exam text,
  created_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  letter text not null,
  text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique (question_id, letter)
);

create index if not exists questions_source_id_idx on questions (source_id);
create index if not exists answers_question_id_idx on answers (question_id);

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

-- Returns questions that have at least one correct answer, in random order.
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

-- Local MVP: no auth yet, so RLS must stay off for the anon key to work.
alter table public.sources disable row level security;
alter table public.questions disable row level security;
alter table public.answers disable row level security;
alter table public.test_sessions disable row level security;
alter table public.attempts disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sources to anon, authenticated;
grant select, insert, update, delete on public.questions to anon, authenticated;
grant select, insert, update, delete on public.answers to anon, authenticated;
grant select, insert, update, delete on public.test_sessions to anon, authenticated;
grant select, insert, update, delete on public.attempts to anon, authenticated;
grant execute on function public.get_random_questions(integer) to anon, authenticated;
