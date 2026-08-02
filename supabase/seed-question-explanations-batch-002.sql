-- Auto-generated explanation seed. Safe to re-run (upsert).
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
  '058002e9-e691-41d5-8d3a-06bd64df52dc',
  'Cuando el Consejo de la UE decide por mayoría cualificada, el sistema tradicional se basaba en la ponderación de los votos de los Estados miembros (antes del sistema actual de doble mayoría).',
  'La opción D identifica correctamente esa “ponderación de los votos”.',
  'A, B y C usan formulaciones imprecisas o no técnicas respecto al mecanismo de mayoría cualificada.',
  '[{"title":"Tratado de la Unión Europea (EUR-Lex)","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012M/TXT"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '228a989a-5bee-4564-bc02-0b514675443f',
  'La Comisión Europea tiene su sede principal en Bruselas.',
  'B es la sede habitual y oficialmente asociada a la Comisión.',
  'Estrasburgo se asocia al Parlamento; Luxemburgo acoge otras instituciones; París no es sede de la Comisión.',
  '[{"title":"Instituciones de la UE — Comisión Europea","url":"https://european-union.europa.eu/institutions-law-budget/institutions-and-bodies/search-all-eu-institutions-and-bodies/european-commission_es"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'bc02a5a9-227c-402d-a91e-56f56aba3860',
  'El art. 118 LCSP fija los umbrales de contrato menor en valor estimado inferior a 40.000 € (obras) o 15.000 € (suministros/servicios), y prevé su publicación conforme al art. 63.4.',
  'C combina umbrales correctos y la obligación de publicación.',
  'A/D usan umbrales incorrectos (60.000/20.000). B acierta umbrales pero niega la publicación.',
  '[{"title":"Ley 9/2017 de Contratos del Sector Público","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'caeae513-3be6-4504-8d34-0260a03bebf4',
  'La planificación no apropiativa (non-preemptive) no quita la CPU a un proceso una vez que empieza a ejecutarse hasta que termina o se bloquea.',
  'A describe ese comportamiento y el riesgo de aplazamiento indefinido si hay bucles infinitos.',
  'B niega el riesgo. C y D describen planificación apropiativa basada en interrupciones de reloj.',
  '[{"title":"Conceptos de planificación de CPU (SO)","url":"https://en.wikipedia.org/wiki/Scheduling_(computing)"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0abfd9f5-9e2c-4615-ad07-69195f749add',
  'La Ley de altos cargos de la AGE impone dedicación exclusiva y, con carácter general, incompatibilidad con otros puestos o actividades.',
  'B refleja dedicación exclusiva sin compatibilizar otras actividades.',
  'A y C permiten compatibilidades que la norma restringe. D está mal redactada respecto a la regla de no percibir otras remuneraciones.',
  '[{"title":"Ley 3/2015 reguladora del ejercicio del alto cargo","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-3445"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e44841fe-1658-40a0-9e62-a2ae3883e636',
  'En pruebas de camino básico, un camino independiente aporta al menos una arista nueva no recorrida en caminos previos del conjunto básico.',
  'D enuncia correctamente esa definición.',
  'A habla de medición “cualitativa” (es cuantitativa). B dice caminos “dependientes” en lugar de independientes. C no garantiza ejecutar cada sentencia una sola vez como se afirma.',
  '[{"title":"Prueba del camino básico / complejidad ciclomática","url":"https://en.wikipedia.org/wiki/Cyclomatic_complexity"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9755f376-2594-4b63-a70c-5514f97de33f',
  'MOLAP almacena el almacén en estructuras multidimensionales físicas (matrices/cubos), alineando nivel lógico y físico y buscando eficiencia analítica.',
  'D describe MOLAP correctamente.',
  'A atribuye a ROLAP lo propio de MOLAP. B y C intercambian o citan ejemplos de forma incorrecta.',
  '[{"title":"OLAP — MOLAP/ROLAP","url":"https://en.wikipedia.org/wiki/Online_analytical_processing"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b5a25f82-1cd4-4dfd-baff-d6c14cd27d1d',
  'La NTI de digitalización exige que el documento electrónico resultante incluya la imagen electrónica del documento origen.',
  'A identifica ese elemento esencial.',
  'B cita metadatos del expediente (otra NTI). C y D no son el elemento nuclear que pregunta la norma de digitalización en esos términos.',
  '[{"title":"NTI de Digitalización de Documentos","url":"https://www.boe.es/buscar/doc.php?id=BOE-A-2011-13169"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c54f4cc3-a490-4b0c-9354-c507069fd4e5',
  'Scrum usa eventos como Daily Scrum, Sprint Planning y Sprint Review; no usa planificación waterfall rígida de todo el proyecto.',
  'D (Waterfall Planning) no es práctica Scrum.',
  'A, B y C sí son eventos/prácticas del marco Scrum (con matices de wording en C).',
  '[{"title":"La Guía de Scrum","url":"https://scrumguides.org/scrum-guide.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1dd924ba-76c0-432f-ac4c-d49f474cdd7a',
  'El esquema en estrella tiene una tabla de hechos central y dimensiones; si se normalizan dimensiones surge el esquema en copo de nieve.',
  'C describe correctamente esa transformación a snowflake.',
  'A invierte hechos/dimensiones. B no es siempre cierto sobre la PK. D lo sitúa erróneamente como BD multidimensional pura.',
  '[{"title":"Star schema","url":"https://en.wikipedia.org/wiki/Star_schema"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a6c32772-5300-4b43-afd0-ff0f13c17dcc',
  'El geo-bloqueo es discriminar el acceso o precio online según la localización del usuario.',
  'C coincide con esa definición en el marco del Mercado Único Digital.',
  'A es discriminación laboral, B es cuestión aduanera/logística, D es colusión de precios.',
  '[{"title":"Reglamento (UE) 2018/302 sobre bloqueo geográfico","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32018R0302"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '88e1ac40-4d3e-4999-aae7-2bbd904e8f72',
  'En arquitecturas .NET, la capa de datos puede integrarse con múltiples orígenes heterogéneos.',
  'B es una afirmación válida de diseño.',
  'A, C y D son recomendaciones/afirmaciones incorrectas o demasiado absolutas.',
  '[{"title":"Arquitectura de aplicaciones .NET","url":"https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4da1e74c-d3a0-4b33-8e88-e9c403d5ba6d',
  'El modelo OSI ordena las capas, de 7 a 1: Aplicación, Presentación, Sesión, Transporte, Red, Enlace de datos y Física.',
  'A enumera ese orden correcto.',
  'Las demás alteran el orden o el nombre de alguna capa.',
  '[{"title":"Modelo OSI","url":"https://en.wikipedia.org/wiki/OSI_model"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '963522c1-dad7-4cd1-a68d-fd90b2725baa',
  'El modelo EFQM se inspiró en referentes previos de excelencia como Malcom Baldrige y Deming.',
  'B recoge esa procedencia/referencia.',
  'Las otras afirmaciones no describen correctamente el origen o planteamiento del modelo.',
  '[{"title":"Modelo EFQM","url":"https://efqm.org/the-efqm-model/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '5d6ccced-72b9-4e01-acfc-457706ea0246',
  'El art. 17 LPAC exige archivo electrónico único de los documentos electrónicos de procedimientos finalizados.',
  'A refleja ese mandato.',
  'Las demás amplían o restringen mal el ámbito del archivo.',
  '[{"title":"Ley 39/2015 LPAC","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c46a8328-27d5-43a5-bb8b-fe7a4121af5d',
  'La Guía de Comunicación Digital AGE exige en cabecera de inicio: imagen institucional, multilingüismo, contacto, mapa web y buscador.',
  'B enumera ese conjunto obligatorio.',
  'Las otras combinaciones omiten u añaden elementos no exigidos así.',
  '[{"title":"Guía de Comunicación Digital de la AGE","url":"https://administracionelectronica.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '75e7b7a5-9bc7-42f0-a3ef-c4098949ef08',
  'Un Failover Cluster Windows Server sí puede crearse y gestionarse con PowerShell; negar esa posibilidad es falso.',
  'D es la afirmación falsa.',
  'Las demás afirmaciones son compatibles con un cluster de dos nodos y disco iSCSI compartido.',
  '[{"title":"Failover Clustering PowerShell","url":"https://learn.microsoft.com/en-us/powershell/module/failoverclusters/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '519913d2-db84-4138-a5f0-d88884c82ae8',
  'El Título II de la Ley 19/2013 (Buen Gobierno) se aplica a los altos cargos de la AGE.',
  'C identifica el ámbito subjetivo correcto.',
  'Las demás amplían o restringen incorrectamente el ámbito de aplicación.',
  '[{"title":"Ley 19/2013 de Transparencia","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2013-12887"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'df3145ab-e0b1-4840-9927-dcf14eebb9a3',
  'Según la Ley 40/2015, los conflictos de atribuciones solo pueden suscitarse entre órganos de la misma Administración no relacionados jerárquicamente.',
  'B reproduce esa regla.',
  'No proceden entre órganos jerárquicamente dependientes ni entre Administraciones distintas en ese cauce.',
  '[{"title":"Ley 40/2015 RJSP","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd2e44b67-7aea-49b5-b7a1-5179958d2655',
  'La CE 1978 tiene 169 artículos, 4 disposiciones adicionales, 9 transitorias, 1 derogatoria y 1 final.',
  'D coincide con esa estructura.',
  'A–C alteran el número de artículos o de disposiciones.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3f95b202-c037-4101-9af3-5ecb5e92c15e',
  'Los servlets Java amplían la funcionalidad del servidor web, no del cliente, y son independientes de plataforma gracias a la JVM.',
  'D es falsa al situarlos en el cliente y hacerlos dependientes de plataforma.',
  'Las demás afirmaciones del ítem son correctas en el contexto típico de la pregunta.',
  '[{"title":"Jakarta Servlet","url":"https://en.wikipedia.org/wiki/Jakarta_Servlet"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '255c16b1-b99c-4755-924e-ffb31357e479',
  'Los requerimientos funcionales describen interacciones sistema-entorno con independencia de la implementación.',
  'D recoge esa definición.',
  'Las demás confunden con no funcionales, diseño interno o detalles de implementación.',
  '[{"title":"Functional requirement","url":"https://en.wikipedia.org/wiki/Functional_requirement"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '526c501b-ff2c-4ed6-a9dc-fc60813774f4',
  'El modelo E/R extendido introduce generalización/especialización, cardinalidad mínima y dependencias en existencia/identificación.',
  'A enumera ese conjunto.',
  'Las otras combinaciones mezclan conceptos ajenos o incompletos.',
  '[{"title":"Enhanced entity–relationship model","url":"https://en.wikipedia.org/wiki/Enhanced_entity%E2%80%93relationship_model"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8b0f5a81-9f2d-4b4e-89fc-641b186d33dd',
  'En Scrum el equipo es multidisciplinar y los miembros colaboran sin silos rígidos de rol/tarea.',
  'A es falsa: no obliga a roles rígidos que impidan asumir tareas fuera del área.',
  'Las demás afirmaciones encajan mejor con Scrum.',
  '[{"title":"Scrum Guide","url":"https://scrumguides.org/scrum-guide.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7588fadd-c0d3-4e74-bddc-654920760a31',
  'PMBOK no se caracteriza principalmente por estar “orientado a sucesos”; esa es más bien una fortaleza típica atribuida a enfoques event-driven/otros marcos.',
  'A no es una fortaleza de PMBOK.',
  'Las demás opciones suelen citarse como fortalezas/rasgos de PMBOK.',
  '[{"title":"PMBOK Guide","url":"https://www.pmi.org/pmbok-guide-standards"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b98f0c3a-080b-4230-b6a4-068939b59748',
  'El ENS exige auditoría regular ordinaria de cumplimiento al menos cada dos años.',
  'B indica esa periodicidad.',
  'Otras cadencias no coinciden con el mínimo ordinario del art. 34 del RD vigente en el enunciado.',
  '[{"title":"Esquema Nacional de Seguridad","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '761f7e62-f753-428e-a61e-f16d730945c6',
  'Para Telnet a usuarios autenticados conviene un cortafuegos que combine filtrado de paquetes con pasarelas de aplicación (proxy).',
  'D describe esa arquitectura híbrida adecuada.',
  'Solo filtros o solo proxy suelen ser insuficientes para ese escenario.',
  '[{"title":"Application firewall / proxy","url":"https://en.wikipedia.org/wiki/Application_firewall"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b20c29b2-3e51-4867-8bca-0c8b41f5ded7',
  'REUNETE (reuniones virtuales SARA) incluye almacenamiento, gestión y reproducción de vídeo bajo demanda por streaming.',
  'B identifica esa funcionalidad.',
  'Las demás no describen correctamente el servicio común.',
  '[{"title":"Servicios comunes red SARA","url":"https://administracionelectronica.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '000f2f20-3ef6-4758-a7dc-e2845863c64c',
  'El art. 48 EBEP reconoce, entre otros, permiso por lactancia de hijo menor de doce meses con una hora diaria de ausencia.',
  'A está recogido en ese artículo.',
  'B–D no corresponden a los permisos tal como se formulan (parentesco, duración o cuantía incorrectas).',
  '[{"title":"EBEP (RDL 5/2015)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0f02a74d-31c0-4ead-b00e-aeab859e40f3',
  'El EER es el punto en que FAR = FRR (igual tasa de falsos positivos y falsos negativos).',
  'A define EER correctamente.',
  'B y C describen desequilibrios; D no define EER.',
  '[{"title":"Equal error rate","url":"https://en.wikipedia.org/wiki/Equal_error_rate"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '14775c92-e784-4ce2-8ab3-bd6a2bed9d2c',
  'Comparando N log N, 2^N y N(N-1)/2, el más eficiente asintóticamente es Alfa (N log N).',
  'A crece más despacio que Gamma (~N²) y que Beta (exponencial).',
  'B es peor (exponencial). C es cuadrático. D sí se puede determinar.',
  '[{"title":"Complejidad temporal","url":"https://en.wikipedia.org/wiki/Time_complexity"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2503cf47-7270-4c52-8ba9-e8a287d9c45e',
  'Ampliar memoria principal para procesos activos reduce swapping y suele mejorar el tiempo de respuesta transaccional.',
  'B apunta a esa mejora directa.',
  'A puede ayudar pero no siempre; C ampliar memoria virtual no reduce por sí la paginación (incluso puede empeorar).',
  '[{"title":"Memory management / swapping","url":"https://en.wikipedia.org/wiki/Memory_management"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '77c4d0ac-bfd6-410b-a357-3cc6a1fca022',
  'En EFQM, el criterio Personas trata RR.HH., conocimiento y reconocimiento; la gestión de relaciones con clientes es otro criterio (Clientes/Resultados).',
  'A no pertenece al criterio Personas.',
  'B–D sí son subcriterios típicos de Personas.',
  '[{"title":"Modelo EFQM","url":"https://efqm.org/the-efqm-model/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f0f3ba0c-1a74-4dff-8d7d-be984928a37d',
  'Los contenedores aíslan procesos de usuario compartiendo el mismo kernel del SO anfitrión.',
  'A describe la virtualización por contenedores.',
  'B describe VMs. C no es requisito. D es falsa: sí pueden correr sobre VMs.',
  '[{"title":"OS-level virtualization","url":"https://en.wikipedia.org/wiki/OS-level_virtualization"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '17a80e6e-b4d0-42ef-8163-fa7f88ff1c55',
  'La Ley 39/2006 clasifica la dependencia en tres grados, cada uno con dos niveles.',
  'C reproduce esa estructura.',
  'A/B usan dos grados; D usa tres niveles por grado.',
  '[{"title":"Ley 39/2006 de dependencia","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2006-21990"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '919e0880-1589-49f2-a16e-528831a21705',
  'En PL/SQL/Oracle, una función devuelve un valor; un procedimiento no (salvo parámetros OUT).',
  'D recoge la diferencia principal pedida.',
  'A–C no son las diferencias principales o son incorrectas.',
  '[{"title":"Oracle PL/SQL procedures and functions","url":"https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/plsql-subprograms.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6ed8a201-fd6d-4cf2-917d-0a1642ef0717',
  'En ITIL 4, el Service Value System incluye principios, gobernanza, cadena de valor, prácticas y mejora continua; el “modelo de 4 dimensiones” es un marco relacionado pero no se presenta como componente interno del SVS en esos términos.',
  'C es la opción incorrecta pedida.',
  'A, B y D se alinean mejor con la descripción del SVS/cadena de valor.',
  '[{"title":"ITIL 4 Service Value System","url":"https://www.axelos.com/certifications/itil-service-management"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4a0b0363-b7d3-4c40-ae6e-f503b1ea7028',
  'En Token Ring (IEEE 802.5), la estación destino copia los datos, pero la trama sigue hasta que la emisora la retira al completar el anillo.',
  'B describe ese comportamiento.',
  'A/C/D no reflejan el ciclo completo de retirada por el emisor.',
  '[{"title":"Token Ring","url":"https://en.wikipedia.org/wiki/Token_Ring"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '88d9ffc3-7166-4613-9cfa-e84e37795c99',
  'El personal eventual es empleado público, pero no funcionario de carrera; se nombra para funciones de confianza o asesoramiento.',
  'C refleja esa clasificación del EBEP.',
  'A niega su condición de empleado público. B y D lo clasifican mal.',
  '[{"title":"EBEP (RDL 5/2015)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '09ca6dbd-dc6f-4f72-85ff-51335571eeae',
  'Aunque el enunciado diga “definición”, habla de DML. Una sentencia DML no finaliza implícitamente la transacción; hace falta COMMIT/ROLLBACK (salvo casos específicos).',
  'D es la afirmación incorrecta.',
  'A–C son ciertas en el modelo Oracle habitual (SELECT/MERGE como DML; DML puede iniciar transacción).',
  '[{"title":"Oracle SQL DML","url":"https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Types-of-SQL-Statements.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '649a634e-9e7f-4a6a-b331-7cbc5f7d4bb0',
  'La Guía de Comunicación Digital de la AGE no limita al encargado a usar solo fuentes propias.',
  'A es la afirmación falsa.',
  'B–D sí encajan con buenas prácticas de la guía (actualizar, branding, limpiar páginas antiguas).',
  '[{"title":"Guía de Comunicación Digital de la AGE","url":"https://administracionelectronica.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '291e9cdf-6c9f-4f4c-86f1-27b2f969abef',
  'En NGN, el Session Border Controller se sitúa en fronteras administrativas para seguridad, interoperabilidad SIP, enrutado y transcoding.',
  'B identifica el SBC.',
  'A, C y D son elementos distintos o incompletos para ese rol fronterizo.',
  '[{"title":"Session Border Controller","url":"https://en.wikipedia.org/wiki/Session_Border_Controller"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7bed7f81-e09e-42e3-88d7-b9aa6d5d0c06',
  'En VDI, la plantilla maestra del SO/apps/config suele denominarse golden image.',
  'D es el término habitual.',
  'A–C no son la denominación estándar pedida.',
  '[{"title":"VDI / desktop virtualization","url":"https://en.wikipedia.org/wiki/Desktop_virtualization"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dc2285be-12f3-471b-8d9a-5a34997b0695',
  'El Anexo I del ENS contempla las dimensiones: disponibilidad, autenticidad, integridad, confidencialidad y trazabilidad.',
  'C incluye las cinco dimensiones correctas.',
  'A omite trazabilidad; B sustituye trazabilidad por no repudio; D está vacía.',
  '[{"title":"Esquema Nacional de Seguridad","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd091b94b-43e1-44c1-9235-4d0025cbc302',
  'La Ley 37/2007 tipifica como infracción grave reutilizar la información para una finalidad distinta de la autorizada.',
  'A es el tipo grave indicado.',
  'B y D suelen asociarse a infracciones leves; C a muy grave en el régimen sancionador de la ley.',
  '[{"title":"Ley 37/2007 de reutilización de información del sector público","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2007-19814"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '572e6138-5fb5-42af-a69e-9f5dc5ff6cd7',
  'EPHOS 2, cláusula 1, establece conformidad del cableado con ISO/IEC DIS 11801.',
  'C cita esa referencia.',
  'A, B y D apuntan a otras normas no pedidas por esa cláusula.',
  '[{"title":"EPHOS / cableado estructurado ISO/IEC 11801","url":"https://en.wikipedia.org/wiki/ISO/IEC_11801"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2c25b1be-8047-4878-a81f-716964e2e0f1',
  'El art. 97 CE atribuye al Gobierno dirección política, Administración y potestad reglamentaria; acreditar embajadores corresponde al Rey (art. 63.1).',
  'A es la función que NO corresponde al Gobierno en el art. 97.',
  'B, C y D sí están en el art. 97.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd16ada5e-0dfc-4ec5-ab28-6f53741b9b7c',
  'Un balanceador de carga reparte peticiones entre varios servidores para escalar y mejorar disponibilidad.',
  'D define correctamente el componente.',
  'A–C describen otras funciones (seguridad, ejecución, almacenamiento).',
  '[{"title":"Load balancing","url":"https://en.wikipedia.org/wiki/Load_balancing_(computing)"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4fb98879-d953-4fea-b934-f6f7c855b7c7',
  'El EBEP prevé que las AAPP establezcan sistemas de evaluación del desempeño de sus empleados.',
  'B identifica correctamente la norma.',
  'C y D no son la referencia principal de ese mandato; A es incorrecta.',
  '[{"title":"EBEP (RDL 5/2015)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6a88de7a-4749-4198-b26f-bf4f8d11f2ba',
  'Java combina tipos primitivos (no objetos) y tipos referencia (objetos).',
  'C refleja esa dualidad.',
  'A y B son absolutas e incorrectas; D niega la clasificación.',
  '[{"title":"Java Language Specification — Types","url":"https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html"}]'::jsonb,
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
