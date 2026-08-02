-- Fix: app uses anon key via PostgREST. If RLS is on without policies,
-- SELECT returns 0 rows (empty UI) even though SQL count(*) shows data.
-- Run in Supabase SQL Editor, then refresh /train?tab=explained

alter table public.question_explanations disable row level security;

grant select on public.question_explanations to anon, authenticated;
grant insert, update, delete on public.question_explanations to anon, authenticated;

notify pgrst, 'reload schema';

-- Sanity check (should match your earlier count):
-- select count(*) from public.question_explanations;
