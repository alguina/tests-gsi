-- Stored on-demand explanations for questions (precomputed, not live AI).
-- Run in the Supabase SQL editor.

create table if not exists public.question_explanations (
  question_id uuid primary key references public.questions(id) on delete cascade,
  explanation text not null,
  why_correct text,
  why_others text,
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'reviewed', 'needs_update')),
  generated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists question_explanations_status_idx
  on public.question_explanations (status);

alter table public.question_explanations disable row level security;

grant select on public.question_explanations to anon, authenticated;
grant insert, update, delete on public.question_explanations to anon, authenticated;
