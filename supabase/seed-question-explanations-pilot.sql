-- Pilot seed: 8 stored explanations.
-- Prerequisite: run add-question-explanations.sql first.
-- Safe to re-run (upserts by question_id).

insert into public.question_explanations (
  question_id,
  explanation,
  why_correct,
  why_others,
  sources,
  status,
  generated_at,
  updated_at
)
values
(
  '52b4cd21-28c5-40fa-8346-ae0e4f8fade5',
  'La Constitución Española de 1978 se compone de 169 artículos y un bloque final de disposiciones: 4 adicionales, 9 transitorias, 1 derogatoria y 1 final.',
  'La opción D refleja exactamente ese cómputo constitucional.',
  'A confunde el número de disposiciones adicionales; B reduce mal el número de artículos; C inventa dos disposiciones finales.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6078b643-5c2b-4781-87be-6b04ff6d416e',
  'El artículo 97 CE atribuye al Gobierno la dirección de la política interior y exterior, la Administración civil y militar y la defensa, así como la potestad reglamentaria. Acreditar embajadores no es función del Gobierno en ese artículo.',
  'Acreditar a embajadores y representantes diplomáticos corresponde al Rey (art. 63.1 CE), por eso A es la función que NO se encomienda al Gobierno en el art. 97.',
  'B, C y D sí aparecen en el artículo 97 como funciones del Gobierno.',
  '[{"title":"Artículo 97 CE","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"},{"title":"Artículo 63 CE","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '90ea5b64-3298-42c1-a893-524f5087ea6c',
  'El artículo 123 CE declara que el Tribunal Supremo es el órgano jurisdiccional superior en todos los órdenes, salvo lo dispuesto en materia de garantías constitucionales.',
  'La opción C reproduce ese tenor literal del art. 123.',
  'A y B son órganos inferiores o de ámbito distinto; D es el órgano de gobierno de los jueces, no un órgano jurisdiccional superior.',
  '[{"title":"Artículo 123 CE","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e622c508-ab96-4fee-86e3-acfc465982ef',
  'La pregunta pide señalar la falsa. Entre las funciones típicas del Subsecretario no figura ejercer la potestad reglamentaria de la Subsecretaría.',
  'B es falsa: la potestad reglamentaria no se atribuye con carácter general al Subsecretario.',
  'A, C y D sí se relacionan con competencias habituales de la Subsecretaría (personal, nombramientos de subdirectores dependientes y pruebas selectivas, según el marco orgánico aplicable).',
  '[{"title":"Ley 40/2015, de Régimen Jurídico del Sector Público","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8a3eeed3-1b79-4997-a35e-adfd0d300552',
  'En el Título I CE, el Capítulo II se divide en dos secciones. La Sección 1ª se titula «De los derechos fundamentales y de las libertades públicas».',
  'C identifica correctamente Sección 1ª del Capítulo II del Título I.',
  'A apunta al Capítulo I (españoles y extranjeros); B y D sitúan mal la sección dentro del Título I.',
  '[{"title":"Título I CE","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b1fe9dab-2565-4b93-bf54-014e29d09ea7',
  'Según el artículo 14 del Tratado de la Unión Europea, los diputados al Parlamento Europeo se eligen por sufragio universal directo para un mandato de cinco años.',
  'A coincide con el mandato de 5 años del art. 14 TUE.',
  'B, C y D no corresponden a la duración fijada en el Tratado.',
  '[{"title":"Tratado de la Unión Europea (versión consolidada)","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012M/TXT"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9ff41f59-d2cd-4088-9269-c2a81a5b687e',
  'El artículo 147.3 CE establece que la reforma de los Estatutos de Autonomía exigirá, en todo caso, la aprobación de las Cortes Generales mediante ley orgánica.',
  'A es correcta: las Cortes intervienen siempre en la reforma estatutaria.',
  'B niega esa intervención; C y D introducen distinciones de vía de acceso que no eliminan el papel de las Cortes.',
  '[{"title":"Artículo 147 CE","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e8bde941-1c36-4857-9a5e-d0fc8bcfca82',
  'La Unión Europea, como tal, nace con el Tratado de Maastricht (1992). Otros tratados reforman o crean Comunidades anteriores, pero no «establecen» la UE en ese sentido.',
  'D identifica correctamente el Tratado de Maastricht.',
  'Roma crea las Comunidades Europeas; Ámsterdam y Lisboa son reformas posteriores.',
  '[{"title":"Tratado de Maastricht (EUR-Lex)","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:11992M/TXT"}]'::jsonb,
  'draft',
  now(),
  now()
)
on conflict (question_id) do update set
  explanation = excluded.explanation,
  why_correct = excluded.why_correct,
  why_others = excluded.why_others,
  sources = excluded.sources,
  status = excluded.status,
  updated_at = now();
