# Mapeo del banco de preguntas al temario oficial GSI A2 (ingreso libre) — PROPUESTA v2

Fecha: 2026-11-07. Fuente del temario: BOE-A-2025-26262, Anexo IX (4 bloques, 57 temas: I.10, II.16, III.15, IV.16).

**Estado: propuesta pendiente de revisión. No son asignaciones confirmadas.**

## Qué es

Una capa aditiva de solo lectura que asigna a cada pregunta del banco un bloque y tema oficial, con una banda de confianza. No toca `questions` ni las etiquetas actuales (block/topic de la app).

Piezas:

- `src/data/topic-map-v2.json`: **las 77.961 filas** de `questions` (id de fila → `[bloque, tema, confianza]`). Hace falta a nivel fila porque la app importa los mismos exámenes varios años y un intent puede apuntar a cualquier fila duplicada.
- `src/data/topic-map-v2-distinct.json`: las **16.348 preguntas distintas** (enunciado + opciones), para componer el banco sin inflar por duplicados anuales. (`.gitignore` ignoraba `data/`; se añadió la excepción explícita `!src/data/`.)
- `src/data/gsi-temario-oficial.json`: los 57 temas oficiales.
- `src/lib/officialTopics.ts`: lectura del mapa (`getOfficialTopic`, `getOfficialCoverage`, `computeTemarioOficialData`). `isConfianzaFiable` solo acepta `revisada`: nada automático se muestra como verdad.
- `src/lib/officialTopicsServer.ts`: carga los `attempts` del perfil activo (mismo patrón que `studyMetrics`).
- `src/app/temario-oficial/page.tsx` + `src/components/pages/TemarioOficialPageContent.tsx`: página nueva `/temario-oficial` con aviso permanente "propuesta sin revisar", **tu práctica por tema oficial** (respuestas y % de aciertos del perfil activo) y **composición del banco** por tema y banda.
- `docs/topic_map_v2.csv`: la propuesta fila a fila (16.348) para revisión humana.
- `supabase/add-question-tema-map.sql`: tabla nueva `question_tema_map` para persistir revisiones (`revisada`) cuando se quiera. Se ejecuta a mano, convención del repo. Reversible: `drop table`.

## Cifras del banco (verificadas)

- 77.961 filas en `questions` = duplicados por importaciones anuales de los mismos exámenes.
- Verificación completa de las 311.844 respuestas: 98,4% de los textos duplicados son idénticos (opciones y correcta); 0 conflictos de respuesta correcta; 253 enunciados genéricos compartidos por preguntas distintas.
- **16.348 preguntas reales** (deduplicando por enunciado + opciones). El "990" del panel es un artefacto de límite de consulta, no el banco real; los tests aleatorios sacan de todo el corpus.
- El mapa a nivel fila cubre el 99,95%: **42 filas** (variantes con erratas del enunciado) quedan explícitamente `sin_asignar`.

## Método

Dos clasificadores independientes sobre enunciado + respuesta correcta (sin usar block/topic de la app):

1. Embeddings semánticos multilingües (`paraphrase-multilingual-MiniLM-L12-v2`): similitud coseno con los 57 temas (+ lista de términos ancla por tema).
2. Palabras clave ponderadas (idf + anclas).

Bandas de confianza: `alta` = ambos métodos concuerdan con señal sólida; `media` = concordancia débil o embedding fuerte solo; `baja` = solo embedding débil (sugerencia); `sin_asignar` = similitud < 0,40, **no clasificada, revisión pendiente**.

## Precisión estimada (auditoría manual estratificada, n=34; NO es exactitud global)

| Banda | Preguntas distintas | Muestra | Estimación |
|---|---|---|---|
| alta | 3.913 | 12 | ~90% |
| media | 4.114 | 10 | ~80% |
| baja | 6.829 | 8 | ~70% (tratar como sugerencia) |
| sin_asignar | 1.492 | 4 | no fiable, excluida |

Los 57 temas tienen cobertura en alta+media. Errores típicos: temas transversales (JDBC->Java, protección de datos) y preguntas técnicas muy cortas.

## Qué hace este cambio y qué no

- El merge solo añade la página `/temario-oficial`, un enlace en la sección Progreso y los datos/lib/tests. **No escribe nada en la base de datos** ni cambia métricas existentes.
- La práctica por tema se calcula al vuelo desde `attempts` + el mapa empaquetado; no hace falta DB.
- Para **persistir revisiones humanas** (`revisada`) y usarlas en métricas del panel haría falta ejecutar el SQL a mano y un cambio de código posterior: fuera de este PR.

## Cómo revisarla

1. Revisar `docs/topic_map_v2.csv`; marcar `revisada` la confianza de las filas comprobadas a mano.
2. (Opcional, después) Ejecutar `supabase/add-question-tema-map.sql` en el SQL editor y cargar el CSV para guardar las revisiones.

## Verificación

- `npx vitest run`: 15/15 (8 nuevos de `officialTopics` + 7 existentes).
- `npm run build` verde; ruta `/temario-oficial` generada (dinámica, como el resto).
- Render comprobado en escritorio (1440px) y móvil (390px) con perfil activo.
