-- Run this if you already created the tables and get RLS errors on insert.
-- Supabase enables RLS by default on new tables.

alter table public.sources disable row level security;
alter table public.questions disable row level security;
alter table public.answers disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sources to anon, authenticated;
grant select, insert, update, delete on public.questions to anon, authenticated;
grant select, insert, update, delete on public.answers to anon, authenticated;
