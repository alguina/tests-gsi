-- Migration: resumable tests, bookmarks, and notes.
-- Safe to run multiple times (idempotent).

-- 1. Draft state for in-progress sessions
alter table public.test_sessions add column if not exists draft_state jsonb;

-- 2. Bookmarks
create table if not exists public.question_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists question_bookmarks_user_id_idx
  on public.question_bookmarks (user_id);

-- 3. Personal notes
create table if not exists public.question_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists question_notes_user_id_idx
  on public.question_notes (user_id);

-- 4. Permissions (local MVP: RLS off)
alter table public.question_bookmarks disable row level security;
alter table public.question_notes disable row level security;

grant select, insert, update, delete on public.question_bookmarks to anon, authenticated;
grant select, insert, update, delete on public.question_notes to anon, authenticated;
