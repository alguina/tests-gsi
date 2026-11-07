-- Official GSI A2 (ingreso libre) topic map proposal for the question bank.
-- PROPUESTA: clasificacion automatica (embeddings + keywords), pendiente de revision humana
-- en las filas con confianza 'media', 'baja' y 'sin_asignar'. Ver docs/mapeo-temas-oficiales-v2.md.
-- Run in the Supabase SQL editor. Does NOT touch public.questions or any existing table.
-- Rollback: drop table if exists public.question_tema_map;

create table if not exists public.question_tema_map (
  question_id uuid primary key references public.questions(id) on delete cascade,
  bloque_oficial smallint not null check (bloque_oficial between 1 and 4),
  tema_oficial smallint not null,
  confianza text not null default 'sin_asignar'
    check (confianza in ('alta', 'media', 'baja', 'sin_asignar', 'revisada')),
  fuente text not null default 'mapeo-v2-2026-11-07',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_tema_map_tema_idx
  on public.question_tema_map (bloque_oficial, tema_oficial);

alter table public.question_tema_map disable row level security;

grant select on public.question_tema_map to anon, authenticated;
grant insert, update, delete on public.question_tema_map to anon, authenticated;

-- Data load: docs/topic_map_v2.csv (16.348 rows, one per distinct question).
-- In the dashboard: Table editor -> question_tema_map -> Import data from CSV,
-- or via SQL: \copy public.question_tema_map(question_id,bloque_oficial,tema_oficial,confianza) from 'topic_map_v2.csv' csv header;
