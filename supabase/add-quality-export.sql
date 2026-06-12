-- Migration: question quality flags, is_active, performance indexes, RPC update.
-- Safe to run multiple times (idempotent).

alter table public.questions add column if not exists is_active boolean not null default true;

create index if not exists questions_topic_idx on public.questions (topic);
create index if not exists questions_is_active_idx on public.questions (is_active);

create table if not exists public.question_quality_flags (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  flag_type text not null,
  severity text,
  details jsonb,
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (question_id, flag_type)
);

create index if not exists question_quality_flags_flag_type_idx
  on public.question_quality_flags (flag_type);
create index if not exists question_quality_flags_reviewed_idx
  on public.question_quality_flags (reviewed);

create index if not exists attempts_user_question_idx
  on public.attempts (user_id, question_id);
create index if not exists attempts_user_created_at_idx
  on public.attempts (user_id, created_at desc);
create index if not exists test_sessions_user_completed_at_idx
  on public.test_sessions (user_id, completed_at desc);

alter table public.question_quality_flags disable row level security;
grant select, insert, update, delete on public.question_quality_flags to anon, authenticated;

-- Only active questions with a known correct answer are eligible for tests.
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
  where coalesce(q.is_active, true) = true
    and exists (
      select 1
      from answers a
      where a.question_id = q.id
        and a.is_correct = true
    )
  order by random()
  limit greatest(question_limit, 0);
$$;

grant execute on function public.get_random_questions(integer) to anon, authenticated;
