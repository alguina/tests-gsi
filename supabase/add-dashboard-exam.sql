-- Migration: dashboard metrics support, session_questions, exam simulation fields.
-- Safe to run multiple times (idempotent).

alter table public.test_sessions add column if not exists duration_seconds integer;
alter table public.test_sessions add column if not exists time_limit_seconds integer;
alter table public.test_sessions add column if not exists metadata jsonb;

create table if not exists public.session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  position integer not null,
  selection_reason text,
  metadata jsonb,
  unique (session_id, question_id),
  unique (session_id, position)
);

create index if not exists session_questions_session_id_idx
  on public.session_questions (session_id);

alter table public.session_questions disable row level security;
grant select, insert, update, delete on public.session_questions to anon, authenticated;
