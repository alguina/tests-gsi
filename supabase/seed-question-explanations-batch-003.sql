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
  '4b831ff7-e06d-40b0-9cdb-bc4760a89cf5',
  'IANA delega recursos en cinco RIR: AfriNIC, APNIC, ARIN, LACNIC y RIPE NCC. No existe un RIR llamado EUNIC para Europa.',
  'B es la opción que NO se corresponde con un RIR real.',
  'AfriNIC, APNIC y LACNIC sí son RIR. El europeo es RIPE NCC, no EUNIC.',
  '[{"title":"Regional Internet registry","url":"https://en.wikipedia.org/wiki/Regional_Internet_registry"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f412f6b2-5af7-484a-9468-f6bd3467fbfe',
  'ITIL 4 se publicó en febrero de 2019 (no a finales de 2018). Sí introduce cuatro dimensiones y principios guía compatibles con ágil.',
  'A es la afirmación falsa respecto a ITIL V4.',
  'B y C son rasgos reales de ITIL 4; por tanto D (“todas falsas”) también es incorrecta.',
  '[{"title":"ITIL","url":"https://en.wikipedia.org/wiki/ITIL"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8d609190-49f8-4550-8710-2dc33cd1af39',
  'Al modularizar, el coste por módulo baja pero el de interfaz sube; el óptimo es el equilibrio. No es cierto que “menos módulos” minimicen siempre el coste total.',
  'C es la afirmación incorrecta.',
  'A, B y D describen el trade-off clásico de modularización.',
  '[{"title":"Modular programming","url":"https://en.wikipedia.org/wiki/Modular_programming"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1db6a0c3-fc3a-470b-8409-d2de109ef93c',
  'La LOPDGDD/RGPD protege especialmente categorías como salud, religión u origen racial; los datos “administrativos” no son categoría especialmente protegida por sí mismos.',
  'B no está especialmente protegido como categoría sensible.',
  'Salud, religión y origen racial sí son categorías especiales.',
  '[{"title":"LOPDGDD (LO 3/2018)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '64e71501-9e8b-40a3-b3ff-359dae280e6b',
  'RUP es iterativo e incremental; el desarrollo secuencial (en cascada pura) no es un principio clave de RUP.',
  'C NO es un principio correcto de RUP.',
  'Equilibrio de prioridades, colaboración y calidad sí encajan con RUP.',
  '[{"title":"Rational Unified Process","url":"https://en.wikipedia.org/wiki/Rational_Unified_Process"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '48ef9769-0723-4096-8e08-4fff33f5e63a',
  'GMPLS generaliza MPLS a conmutación temporal, de longitud de onda y espacial; esos caminos se denominan LSP.',
  'D: tanto a) como b) son correctas.',
  'A y B por separado son verdaderas; C las niega erróneamente.',
  '[{"title":"Generalized Multi-Protocol Label Switching","url":"https://en.wikipedia.org/wiki/Generalized_Multi-Protocol_Label_Switching"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2885b2dc-75ea-4b31-a0de-e908ef04c900',
  'VoIP significa Voice over IP: voz sobre redes IP.',
  'A define correctamente el acrónimo y su función.',
  'B–D inventan significados (vídeo/virtual/visual).',
  '[{"title":"Voice over IP","url":"https://en.wikipedia.org/wiki/Voice_over_IP"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ff91c463-7722-41f2-bc43-0bd20c674343',
  'El art. 123 CE atribuye al Tribunal Supremo la supremacía jurisdiccional, salvo garantías constitucionales (TC).',
  'C reproduce ese mandato constitucional.',
  'TSJ, AN o CGPJ no ocupan esa posición de órgano jurisdiccional superior en todos los órdenes.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '207591b1-cce7-4c34-a6c4-9f294b30d52f',
  'El art. 3 TFUE enumera competencias exclusivas de la Unión; entre ellas, la unión aduanera.',
  'A es competencia exclusiva.',
  'Redes transeuropeas, cohesión y consumidores son ámbitos de competencia compartida/apoyo, no exclusivos del art. 3.',
  '[{"title":"TFUE — EUR-Lex","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012E/TXT"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f77a9ef4-1b09-4bc3-b311-ff665cbd4ae8',
  'VALIDE permite validar certificados de sede electrónica (no CSV ni URLs de portales como función principal del enunciado).',
  'D identifica el alcance correcto según el ítem.',
  'A–C amplían el alcance a URL o CSV de forma incorrecta aquí.',
  '[{"title":"VALIDE — Administración electrónica","url":"https://administracionelectronica.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '010a6d52-db9c-4212-8aa6-245b63f2b779',
  'La potestad reglamentaria del departamento no corresponde al subsecretario en los términos de B; esa afirmación es la falsa.',
  'B es la falsa respecto a las funciones del subsecretario.',
  'Jefatura de personal, nombramientos de subdirectores y convocatorias selectivas sí se asocian a la Subsecretaría.',
  '[{"title":"Ley 40/2015 RJSP","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '63c3a661-2aab-4439-8edc-99491bf66ed8',
  'LDAP surgió como acceso más ligero a directorios tipo X.500; no al revés. X.500 no es una versión simplificada de LDAP.',
  'C es incorrecta.',
  'A, B y D describen aspectos reales del ecosistema X.500/DAP.',
  '[{"title":"X.500","url":"https://en.wikipedia.org/wiki/X.500"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6d023230-e69b-4a20-890d-9a0fe2b2d4dc',
  'En .NET, el CLR (Common Language Runtime) ejecuta el código y ofrece servicios de runtime.',
  'B nombra el runtime correcto.',
  'NVM/CNR no existen así; CIL es el lenguaje intermedio, no el runtime.',
  '[{"title":"Common Language Runtime","url":"https://en.wikipedia.org/wiki/Common_Language_Runtime"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9b0118b4-dfb2-4f33-b547-0fb8e83924dc',
  'No es cierto que usuarios MOSS y PEM necesiten necesariamente certificados X.509 como se afirma; esa es la falsa del ítem.',
  'A es la afirmación falsa.',
  'B–D describen rasgos habituales de PEM/MOSS en el temario clásico.',
  '[{"title":"Privacy-Enhanced Mail","url":"https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '26c0668c-ada9-44c8-a41f-d1b5b692611f',
  'MDM (Mobile Device Management) gestiona dispositivos móviles en la red corporativa.',
  'A es la denominación correcta.',
  'BYOD es política de uso; MAM gestiona apps; TCP es protocolo de transporte.',
  '[{"title":"Mobile device management","url":"https://en.wikipedia.org/wiki/Mobile_device_management"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ea48b3f4-826b-4253-abe8-7b1e1e2611b0',
  'En el modelo E/R, el grado de una relación es el número de tipos de entidad que participan.',
  'A define el grado.',
  'B describe cardinalidad; C columnas; D atributo.',
  '[{"title":"Entity–relationship model","url":"https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0da75020-2f9c-461f-bed0-b760d4a98d9b',
  'La Sección 1ª del Capítulo II del Título I CE se titula «De los derechos fundamentales y de las libertades públicas».',
  'C identifica la ubicación correcta.',
  'A, B y D sitúan mal el título en la estructura del Título I.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '991db1ae-cd55-4fa6-8459-8c2fe6deca18',
  'En PERT los tiempos de actividad se modelan de forma probabilística (estimaciones optimista/más probable/pesimista).',
  'C es correcta.',
  'A describe mejor CPM determinista; B y D no caracterizan PERT.',
  '[{"title":"Program evaluation and review technique","url":"https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0fb4834a-d4a2-4cfc-bea9-ff491ec29d26',
  'El marco de pruebas OWASP Testing Guide se organiza en cinco fases.',
  'B indica cinco fases.',
  'Tres, siete o “cuatro procesos” no coinciden con esa división.',
  '[{"title":"OWASP Testing Guide","url":"https://owasp.org/www-project-web-security-testing-guide/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ebe29646-62b0-4698-89e8-14a1a5243dc7',
  'CAT6 llega hasta 250 MHz; CAT6a hasta 500 MHz (mejor inmunidad a alien crosstalk a 10 Gbps).',
  'C recoge esa diferencia de ancho de banda.',
  'A/B invierten apantallamiento/interferencias; D exagera velocidades de CAT6a.',
  '[{"title":"Category 6 cable","url":"https://en.wikipedia.org/wiki/Category_6_cable"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dab71616-1541-4092-a27a-c9e9bddc7ef2',
  'Un sistema experto “concha” (shell) conserva motor de inferencia/reglas vaciando la base de conocimiento para reutilizarlo.',
  'B es la denominación correcta.',
  'Kernel/inferente/fuente no designan ese patrón de reutilización.',
  '[{"title":"Expert system","url":"https://en.wikipedia.org/wiki/Expert_system"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b319e8c2-1a89-4e57-8c13-60b363ad75e1',
  'En MÉTRICA v3, los casos de uso no son técnica propia de la PSI; FCE, coste/beneficio y E/R extendido sí pueden aplicarse.',
  'D NO es de aplicación en PSI según el ítem.',
  'A–C sí se usan en planificación de sistemas de información.',
  '[{"title":"MÉTRICA v3","url":"https://administracionelectronica.gob.es/pae_Home/pae_Documentacion/pae_Metodolog/pae_Metrica_v3.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9db22fa0-895c-4759-8b66-369118694bd9',
  'ISO 9004 orienta la mejora del desempeño y no es certificable; no “garantiza” la calidad del producto.',
  'D es la aseveración falsa.',
  'A–C son rasgos correctos de ISO 9004.',
  '[{"title":"ISO 9004","url":"https://en.wikipedia.org/wiki/ISO_9000"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd737a745-e25c-44db-b089-c1cf33ab19b0',
  'Un trunk en switching es un enlace que transporta tráfico de varias VLANs (p. ej. 802.1Q).',
  'B define trunk correctamente.',
  'No es solo velocidad, media converter ni versión de firmware.',
  '[{"title":"VLAN trunking","url":"https://en.wikipedia.org/wiki/VLAN"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f37a449a-2098-4ab9-9382-f2a2e2141d4a',
  'El sector primario en España representa en torno al 3% del PIB (orden de magnitud típico en temarios).',
  'D (~3%) es la cifra correcta del ítem.',
  '26%, 50% o 5% no encajan con ese peso aproximado.',
  '[{"title":"INE / economía española","url":"https://www.ine.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '661c345b-3cb4-4e5d-9b30-2039b78cf5df',
  'La reforma tributaria 2014 incluye leyes 26, 27 y 28/2014; no una Ley 29/2014 del IVA con ese contenido.',
  'D no forma parte de esa reforma según el enunciado.',
  'A–C sí están incluidas en la reforma citada.',
  '[{"title":"BOE — legislación tributaria","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'df4ef8fc-f84b-4c36-9d02-a6fb23edda0e',
  'Los firewalls de capa 7 actúan como proxy de aplicación.',
  'D describe ese comportamiento.',
  'No “no existen”; números de secuencia/filtros de paquetes son capas inferiores.',
  '[{"title":"Application firewall","url":"https://en.wikipedia.org/wiki/Application_firewall"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '596367d6-9c27-4d15-9ba1-96a57702e21b',
  'Los diputados al Parlamento Europeo se eligen por 5 años (art. 14 TUE).',
  'A indica el mandato de 5 años.',
  '4, 2 o 3 años no coinciden con el TUE.',
  '[{"title":"Tratado de la Unión Europea","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012M/TXT"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '08a78504-7a3e-44e5-89f9-8ea3a530f4ac',
  'En la reforma de Estatutos de Autonomía intervienen siempre las Cortes Generales.',
  'A es correcta.',
  'No depende de la vía de acceso de la CA.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'bca7578e-afbf-4004-bbbf-890253f83610',
  'Los Factores Críticos de Éxito priorizan actividades y recursos de la organización.',
  'C identifica esa práctica.',
  'TOWS, coste/beneficio e impacto tienen otros objetos.',
  '[{"title":"Critical success factor","url":"https://en.wikipedia.org/wiki/Critical_success_factor"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd2868ba2-bf68-467a-9d62-e1f7baf43c41',
  'SLS sinteriza polvo con láser a temperatura inferior a la fusión completa.',
  'A describe SLS.',
  'SLA usa resina; FFF filamento fundido; cera térmica es otro proceso.',
  '[{"title":"Selective laser sintering","url":"https://en.wikipedia.org/wiki/Selective_laser_sintering"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0d0d9831-3c30-4168-9f0b-c9eaa109e6bd',
  'El formato general de URL es método://servidor[:puerto]/directorio/fichero.',
  'C es la sintaxis correcta.',
  'A/B/D alteran el orden de esquema, barras o puerto.',
  '[{"title":"URL","url":"https://en.wikipedia.org/wiki/URL"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '27b70618-aaa8-4f4c-8984-cc93fa894250',
  'Las direcciones IP van en la cabecera IP, no en la de segmento TCP.',
  'C no está en la cabecera TCP.',
  'Campos de urgencia/reset y contadores de la conexión sí pueden asociarse al segmento TCP en el temario.',
  '[{"title":"Transmission Control Protocol","url":"https://en.wikipedia.org/wiki/Transmission_Control_Protocol"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e58df7d1-3cd4-4b14-82d6-dcabde07c8fb',
  'GPRS sí requiere gestión de movilidad; negar eso es incorrecto.',
  'C no caracteriza a GPRS.',
  'Envío irregular de paquetes y GGSN como pasarela sí son rasgos de GPRS.',
  '[{"title":"General Packet Radio Service","url":"https://en.wikipedia.org/wiki/General_Packet_Radio_Service"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c08199ee-383f-491f-a5a6-c879b70578a0',
  'El análisis de requisitos incluye criterios de prueba/evaluación del producto; no el diseño detallado de funciones ni de la BD.',
  'A concierne al análisis de requerimientos según el ítem.',
  'B y C son más propias de diseño; D mezcla incorrectamente.',
  '[{"title":"Requirements analysis","url":"https://en.wikipedia.org/wiki/Requirements_analysis"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9cec4461-63be-4d28-91f9-e85a965b988d',
  'COCOMO empotrado (embedded) modela proyectos con restricciones fuertes de hardware/software y operación.',
  'D define el modo empotrado.',
  'A–C corresponden a modos orgánico/semidetached u otras lecturas.',
  '[{"title":"COCOMO","url":"https://en.wikipedia.org/wiki/COCOMO"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a1f3fed9-3ef9-4708-9be4-7c238824fa20',
  'EFQM es dinámico, usa lógica RADAR/REDER y tiene carácter globalizador.',
  'D: todas las anteriores son correctas.',
  'A–C son verdaderas por separado.',
  '[{"title":"Modelo EFQM","url":"https://efqm.org/the-efqm-model/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ee74368d-f9f9-4eea-964a-d28a967fa7c6',
  'La criptografía de clave pública/privada es asimétrica.',
  'B nombra el tipo correcto.',
  'Simétrico usa la misma clave; paralelo/redundante no aplican.',
  '[{"title":"Public-key cryptography","url":"https://en.wikipedia.org/wiki/Public-key_cryptography"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '858a033d-b28f-4915-8188-978d23a07e20',
  'Las acciones positivas se regulan en el art. 11 de la LO 3/2007.',
  'C indica el artículo correcto.',
  'Los arts. 13 y 14 no son el de acciones positivas en este ítem.',
  '[{"title":"LO 3/2007 de igualdad","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '43b99a0e-f568-4ca6-9459-0e2e8a2a7eaf',
  'iOS no soporta Adobe Flash; sí multitouch, multitarea limitada y acelerómetros.',
  'A es la característica incorrecta.',
  'B–D sí describen capacidades de iOS.',
  '[{"title":"iOS","url":"https://en.wikipedia.org/wiki/IOS"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3736c4e9-7977-4ae5-9526-1d3e610a3842',
  'IANA coordina la asignación de ASN a nivel global.',
  'A identifica la entidad correcta.',
  'ISOC, IETF e IAB tienen otros roles en la gobernanza de Internet.',
  '[{"title":"IANA","url":"https://www.iana.org/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '00fe990e-0030-47de-a7cb-ab23417a5fd9',
  'La Mesa de Contratación no es órgano de contratación; asiste en la adjudicación.',
  'D no es órgano de contratación.',
  'Ministro, Secretario de Estado y Junta de Contratación sí pueden serlo en el ámbito ministerial.',
  '[{"title":"Ley 9/2017 LCSP","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0b6f5891-9d3c-48dc-8299-e61080053041',
  'Los diagramas de secuencia son de comportamiento/interacción, no de estructura.',
  'C no pertenece a los diagramas de estructura.',
  'Clases, objetos y estructura compuesta sí son estructurales.',
  '[{"title":"UML diagrams","url":"https://en.wikipedia.org/wiki/Unified_Modeling_Language"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '16d3a39d-0460-48f1-84f0-93f2fc7e3771',
  'Una tarea crítica sin holgura retrasa el proyecto si se demora.',
  'A es la consecuencia correcta.',
  'B y C niegan o relativizan incorrectamente el efecto sobre el camino crítico.',
  '[{"title":"Critical path method","url":"https://en.wikipedia.org/wiki/Critical_path_method"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2689fa09-c210-498d-873e-bb7a919dec25',
  'No existe como plan español “Plan Nacional de Reforestación” en el sentido del ítem; sí PNACC, PNIEC y Plan Forestal Español.',
  'A no es un plan español de ese listado.',
  'B–D sí son planes/estrategias reales.',
  '[{"title":"Planes ambientales España","url":"https://www.miteco.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6b688bdf-91f9-4d7a-afc4-90093e321a10',
  'Los SO distribuidos destacan por concurrencia global (procesos en varios nodos).',
  'B es la característica correcta del ítem.',
  'No hay reloj común estricto; no exigen homogeneidad; buscan tolerancia a fallos, no dependencia.',
  '[{"title":"Distributed operating system","url":"https://en.wikipedia.org/wiki/Distributed_operating_system"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e4b22176-edfd-43f1-8530-351431d21763',
  'Java no es un lenguaje nativo del ecosistema .NET (aunque existan puentes); C#, VB y C++/CLI sí.',
  'A no es uno de esos lenguajes .NET.',
  'B–D sí son lenguajes del marco .NET.',
  '[{"title":".NET","url":"https://en.wikipedia.org/wiki/.NET"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '86310b6a-43ba-4268-8678-5d751c7c1bbb',
  'Apache es servidor web multiplataforma (incl. Windows), licencia libre y muy usado en Unix/Linux.',
  'D: todas son correctas.',
  'A–C son verdaderas por separado.',
  '[{"title":"Apache HTTP Server","url":"https://httpd.apache.org/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0a2bf76a-af5d-4d54-9451-b4f76bc8a42c',
  'La UE enfatiza la soberanía de los datos en los espacios de datos europeos.',
  'A recoge ese principio.',
  'Independencia/parcialidad/agilidad no son el principio citado.',
  '[{"title":"European data spaces","url":"https://digital-strategy.ec.europa.eu/en/policies/data-spaces"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b70f5e6c-4534-494f-b3ce-0b26cb01e4dd',
  'Las arquitecturas pipeline se clasifican como MISD (Multiple Instruction, Single Data) en la taxonomía de Flynn.',
  'C es la clasificación del ítem.',
  'SISD/SIMD/MIMD corresponden a otros patrones.',
  '[{"title":"Flynn''s taxonomy","url":"https://en.wikipedia.org/wiki/Flynn%27s_taxonomy"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '5f7176ad-cfe5-4c2a-bf04-013b23daf71e',
  'Fiber to the curb (FTTC) lleva la fibra hasta los derivadores/taps cercanos al usuario.',
  'B es la denominación correcta.',
  'FTTB/FTTH/FTLA describen otros puntos de terminación.',
  '[{"title":"Fiber to the x","url":"https://en.wikipedia.org/wiki/Fiber_to_the_x"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'fecdf98a-0844-4bd2-86ab-4bd8371b3bd0',
  'El etiquetado VLAN se estandariza en IEEE 802.1Q.',
  'A es el estándar correcto.',
  '802.1R/V/T no son el estándar de VLAN tagging del ítem.',
  '[{"title":"IEEE 802.1Q","url":"https://en.wikipedia.org/wiki/IEEE_802.1Q"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7d89ebe7-c4cf-4498-a91c-2312835030c3',
  'La legislación delegada del Gobierno recibe el nombre de Decreto Legislativo (art. 85 CE).',
  'B es el título correcto.',
  'Decreto-ley es legislación de urgencia; reglamento no es legislación delegada.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2a26cd0b-2399-41e3-8603-12576bd0e205',
  'El funcionamiento de la Junta de Contratación Centralizada se regula en la Orden HAP/2834/2015.',
  'B identifica la norma correcta del ítem.',
  'HAP/2028/2013 y RD 695/2013 no son la cita correcta aquí.',
  '[{"title":"Orden HAP/2834/2015 (BOE)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0c8819bf-e9ac-4324-b440-248eae1c928c',
  'ANSI representa a EE.UU. en ISO y participó en estándares como FDDI.',
  'D: a) y b) son verdaderas.',
  'A y B son correctas; C las niega.',
  '[{"title":"American National Standards Institute","url":"https://en.wikipedia.org/wiki/American_National_Standards_Institute"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd2af6dc8-7c78-4ece-a069-0c1947daf879',
  'QAM se usa en modulaciones analógicas y digitales.',
  'C es la técnica común a ambos ámbitos.',
  'PSK/ASK son digitales; AM es analógica.',
  '[{"title":"Quadrature amplitude modulation","url":"https://en.wikipedia.org/wiki/Quadrature_amplitude_modulation"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '77c1343a-9efb-4d0f-8941-34530347a9b5',
  'El delimitador de inicio de trama Ethernet (SFD) es 10101011.',
  'A es el valor binario correcto.',
  '10101010 es el preámbulo repetido; los otros no son el SFD.',
  '[{"title":"Ethernet frame","url":"https://en.wikipedia.org/wiki/Ethernet_frame"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dfb61880-5151-4065-9d9a-8eda45e0c781',
  'Con mayoría cualificada en el Consejo se aplica la ponderación de los votos (sistema clásico del temario).',
  'D usa la formulación correcta.',
  'A–C no son la denominación técnica del mecanismo.',
  '[{"title":"Consejo de la UE — mayoría cualificada","url":"https://www.consilium.europa.eu/es/council-eu/voting-system/qualified-majority/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4a0bdabe-5132-4070-8190-6ee1be57b5b5',
  'El Tratado de Maastricht (1992) estableció la Unión Europea.',
  'D es correcto.',
  'Roma crea CEE; Ámsterdam/Lisboa reforman la UE ya existente.',
  '[{"title":"Tratado de Maastricht","url":"https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=LEGISSUM:xy0026"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9e660d44-2bf4-40bb-a898-1d015ea24958',
  'COSMIC FFP es un método de medición de puntos de función.',
  'C es el método correcto.',
  'Delphi y COCOMO no son PF; SPFP no es el estándar citado.',
  '[{"title":"COSMIC function points","url":"https://en.wikipedia.org/wiki/COSMIC_functional_size_measurement"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8ef051ab-c9ba-404c-a9be-c9ff1d9ed692',
  'AirWatch es una solución MDM conocida.',
  'C es MDM.',
  'Magento es e-commerce; borda/Kobli no son la solución MDM del ítem.',
  '[{"title":"Mobile device management","url":"https://en.wikipedia.org/wiki/Mobile_device_management"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4fe1028e-f82a-4617-9e9c-e49ccccdad7b',
  'Según el ítem, el “Plan de Acción europeo para la Contaminación Cero” no se considera en ese listado de planes europeos de medio ambiente.',
  'D es la que no cuenta como tal en la pregunta.',
  'Red Natura 2000, Marco clima 2030 y Pacto Verde sí.',
  '[{"title":"European Green Deal","url":"https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/european-green-deal_en"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '96479af8-58f6-4c3b-8b1d-ef915dce42f6',
  'FCAPS de ISO incluye Fault, Configuration, Accounting, Performance y Security; no “Improvement Management”.',
  'D no es un área FCAPS.',
  'A–C sí forman parte del modelo clásico.',
  '[{"title":"FCAPS","url":"https://en.wikipedia.org/wiki/FCAPS"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'fcbb0c1d-d77a-4624-99b2-20418a2eb192',
  'Las fuentes del derecho administrativo se clasifican de varias formas: directas/indirectas, escritas/no escritas, primarias/subsidiarias.',
  'D: todas las anteriores.',
  'A–C son clasificaciones válidas por separado.',
  '[{"title":"Derecho administrativo","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7c367277-b26a-4de1-8f59-3ccbb4d31c7f',
  'JavaScript no usa el lenguaje Java (solo el nombre histórico); JavaBeans, Servlets y JSP sí son Java.',
  'A NO usa Java.',
  'B–D son tecnologías Java.',
  '[{"title":"JavaScript","url":"https://en.wikipedia.org/wiki/JavaScript"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '762b6363-87fb-4610-83cb-6360c78eaa1a',
  'XSLT usa expresiones XPath para seleccionar nodos en XML.',
  'B es correcta.',
  'SAX/DOM son APIs de parsing; JSAX no es el mecanismo XPath.',
  '[{"title":"XSLT","url":"https://en.wikipedia.org/wiki/XSLT"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4d34f5dc-54ad-43f0-a8db-727e2bd818d4',
  'Data Explorer, Steward e Hygienist son roles asociados al ecosistema Big Data en el temario.',
  'D: todas son ciertas.',
  'A–C son roles citados por separado.',
  '[{"title":"Big data","url":"https://en.wikipedia.org/wiki/Big_data"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ca307d77-27da-4ef2-8d29-3f79199550d3',
  'UML no incluye un “diagrama de elementos”.',
  'D no se usa en UML.',
  'Secuencia, comunicación y estados sí existen.',
  '[{"title":"Unified Modeling Language","url":"https://en.wikipedia.org/wiki/Unified_Modeling_Language"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '86a2d00a-04c3-47f9-bce9-796dd68e1f9f',
  'Las técnicas PET de privacidad incluyen privacidad diferencial, cifrado homomórfico y anonimización.',
  'D: todas son correctas.',
  'A–C son técnicas PET válidas.',
  '[{"title":"Privacy-enhancing technologies","url":"https://en.wikipedia.org/wiki/Privacy-enhancing_technologies"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd5fbc22d-c251-4f13-ab4e-3359b87b9dd5',
  'En óptica, la modulación directa es un método clásico de modulación óptica.',
  'A es el método citado.',
  'Las demás no son la respuesta del ítem.',
  '[{"title":"Optical modulation","url":"https://en.wikipedia.org/wiki/Optical_modulation_amplitude"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '95a86ae5-909d-4e0b-a0e6-b7fb13d389ee',
  'El PGGC contempla siete tipos de riesgos potenciales de proyecto.',
  'B indica siete.',
  'Cinco, tres o seis no coinciden con ese cómputo del temario.',
  '[{"title":"PGGC / calidad AGE","url":"https://administracionelectronica.gob.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'da7db36f-7590-4dff-8b6d-947c2f05e52d',
  'Los balanceadores se agrupan habitualmente en capa 4 (transporte) y capa 7 (aplicación).',
  'B es la clasificación correcta.',
  'Otras combinaciones de capas no son la agrupación habitual del ítem.',
  '[{"title":"Load balancing","url":"https://en.wikipedia.org/wiki/Load_balancing_(computing)"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '36290444-fad0-4a56-9bf7-cc8027078f4a',
  'En la Guía de Participantes de MÉTRICA v3 no figura el perfil “Técnico” como tal.',
  'C no está incluido.',
  'Directivo, Consultor y Programador sí aparecen.',
  '[{"title":"MÉTRICA v3","url":"https://administracionelectronica.gob.es/pae_Home/pae_Documentacion/pae_Metodolog/pae_Metrica_v3.html"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2b874cc1-6f7a-4a74-a9da-7957f254a2eb',
  'Las herramientas CASE buscan principalmente aumentar la productividad del desarrollo.',
  'A es el objeto principal.',
  'Riesgos, calidad o reutilización pueden beneficiarse, pero no son el objeto citado.',
  '[{"title":"Computer-aided software engineering","url":"https://en.wikipedia.org/wiki/Computer-aided_software_engineering"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '507aae5e-eec9-467d-b76c-c7cc998b5318',
  'Abstracción, encapsulación y modularidad son propiedades OO; “independencia” no lo es como propiedad canónica.',
  'C no es propiedad OO del listado.',
  'A, B y D sí lo son.',
  '[{"title":"Object-oriented programming","url":"https://en.wikipedia.org/wiki/Object-oriented_programming"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1cfc729c-df8b-485c-80f9-19f032d26986',
  'Horizonte Europa se estructura en 5 misiones.',
  'A indica 5 misiones.',
  '3 no es el total del programa.',
  '[{"title":"Horizonte Europa — misiones","url":"https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe/eu-missions-horizon-europe_en"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1a8f8a65-c473-426b-a454-bc75fd572051',
  'A es correcta: Sistemas.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Logística») no cumple ese criterio; C («Comunicaciones») no cumple ese criterio; D («Seguridad») no cumple ese criterio.',
  '[{"title":"Ingeniería del software","url":"https://en.wikipedia.org/wiki/Software_engineering"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'de35c89f-da4b-433e-b17f-06b40cd7cec3',
  'La opción incorrecta/falsa es D: Platinium.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'D es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9923a31f-6784-4018-a327-620c325cde48',
  'A es correcta: //.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («*+») no cumple ese criterio; C («#>») no cumple ese criterio; D («$>») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7ff41c06-6c7c-435e-842b-abb13346789f',
  'B es correcta: SNMP.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («RCP») no cumple ese criterio; C («SMTP») no cumple ese criterio; D («ICMP») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3399afe6-7783-4d98-9438-85ebc5d90ecf',
  'B es correcta: Bruselas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Estrasburgo.») no cumple ese criterio; C («Luxemburgo.») no cumple ese criterio; D («París.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'fa772c51-94f0-4ba4-afd3-7bb80cb8fa4c',
  'C es correcta: SMB.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («ext2») no cumple ese criterio; B («swap») no cumple ese criterio; D («MSB») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1f288fad-9b59-4893-8cf7-21fdee062017',
  'B es correcta: Cuando un órgano judicial considere, en algún proceso, que una norma con rango de ley, aplicable al caso, de cuya validez dependa el fallo, pueda ser contraria a la Constitución, planteará la cuestión ante el Tribunal Constitucional en los supuestos, en la forma y con los efectos que establezca la ley, que en ningún caso serán suspensivos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Para que las sentencias del Tribunal Constitucional puedan tener plenos efectos frente a t») no cumple ese criterio; C («Están legitimados para interponer el recurso de amparo, toda persona natural o jurídica qu») no cumple ese criterio; D («Están legitimados para interponer el recurso de inconstitucionalidad, el Presidente del Go») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7458002f-4980-4724-abf0-392727c13f46',
  'A es correcta: la organización de los servicios territoriales no integrados en las Delegaciones del Gobierno se establecerá mediante Real Decreto.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («los servicios territoriales no integrados dependerán del Delegado del Gobierno, o en su ca») no cumple ese criterio; C («los servicios territoriales integrados dependerán del órgano central competente sobre el s») no cumple ese criterio; D («ninguna es correcta») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '16ae17f4-140e-40b1-b3df-785156abb1e8',
  'B es correcta: Sin mediar delegación de las Cortes, aunque deben ser inmediatamente sometidos a debate y votación de totalidad al Congreso de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Previa delegación de las Cortes, para casos de extraordinaria y urgente necesidad y una ve») no cumple ese criterio; C («En casos de extraordinaria y urgente necesidad sin mediar delegación de las Cortes, aunque») no cumple ese criterio; D («Previa delegación de las Cortes, para casos de extraordinaria y urgente necesidad, y que u») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '5c4e1b7d-607e-48d4-b07e-05ede15cb3a1',
  'La opción incorrecta/falsa es A: El Subdelegado del Gobierno tiene rango de Director General. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'A es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c964acf7-34f0-4a79-ae53-633a7ff2c1b8',
  'C es correcta: Según lo establecido en el Tratado de Lisboa, a partir del 1 de Noviembre de 2014, la Comisión estará compuesta por un número de miembros correspondiente a los dos tercios del número de Estados miembros..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Según lo establecido en el Tratado de Lisboa, a partir del 1 de Noviembre de 2014, la Comi») no cumple ese criterio; B («Según lo establecido en el Tratado de Lisboa, a partir del 1 de Noviembre de 2014, la Comi») no cumple ese criterio; D («Según lo establecido en el Tratado de Lisboa, a partir del 1 de Noviembre de 2014, la Comi») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4b11380c-d01e-4d7c-874f-709cb022cff8',
  'D es correcta: Ante los tribunales ordinarios por un procedimiento basado en los principios de preferencia y sumariedad y, en su caso, a través del recurso de amparo ante el Tribunal Constitucional..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Sólo ante el Tribunal Constitucional de acuerdo con lo previsto en el Artículo 161.1.a), r») no cumple ese criterio; B («Sólo ante los tribunales ordinarios por un procedimiento basado en los principios de prefe») no cumple ese criterio; C («Ante los tribunales ordinarios por un procedimiento basado en los principios de preferenci») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '33ec557f-a58a-4a02-8961-abd2b199a2d5',
  'A es correcta: El servicio a la cultura como deber y atribución esencial y facilitará la comunicación cultural entre las Comunidades Autónomas, de acuerdo con ellas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («El servicio a la cultura y a la investigación científica y técnica como deber y atribución») no cumple ese criterio; C («El servicio a la cultura como deber y atribución esencial y facilitará la comunicación cul») no cumple ese criterio; D («El servicio a la cultura y a la investigación científica y técnica como deber y atribución») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '04f9d561-efc4-4604-bce9-5bb427099d68',
  'A es correcta: La Ley limitará el uso de la informática para garantizar el honor y la intimidad personal y familiar de los ciudadanos y el pleno ejercicio de sus derechos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («La ley regulará... b) El acceso de los ciudadanos a los archivos y registros administrativ») no cumple ese criterio; C («La ley regulará... b) El acceso de los ciudadanos a los archivos y registros informáticos,») no cumple ese criterio; D («Los tratados internacionales válidamente celebrados, una vez publicados oficialmente en Es») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9c77977b-9512-4555-9cc4-7b1b516f01a1',
  'D es correcta: Las tres quintas partes de los miembros del Congreso y posteriormente, en un plazo máximo de 20 días, ser ratificado por esa misma mayoría del Senado.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Las tres quintas partes de los miembros del Congreso y posteriormente, en un plazo máximo ») no cumple ese criterio; B («La mayoría absoluta de ambas cámaras, Congreso y Senado») no cumple ese criterio; C («Las dos quintas partes de los miembros del Congreso y posteriormente, en un plazo máximo d») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c80823e2-f19f-4fcd-ab1e-4d665671f7d5',
  'B es correcta: Entrará a ejercer inmediatamente la Regencia el Príncipe heredero de la Corona, si fuere mayor de edad..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Rey siguiere en su puesto, pero delegando sus funciones a la figura del Presidente del ») no cumple ese criterio; C («Se sometiere a referéndum distintas propuestas de candidatos para la delegación de funcion») no cumple ese criterio; D («Las funciones del Rey son ejercidas por un Responsable provisional del Gobierno designado ») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a1ed53a3-d003-41b8-8f99-754a6572a1be',
  'C es correcta: La moción de censura por mayoría absoluta, propuesta al menos por una décima parte de los Diputados, y habrá de incluir un candidato a la Presidencia del Gobierno..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La cuestión de confianza por mayoría absoluta, propuesta al menos por una décima parte de ») no cumple ese criterio; B («La moción de censura, propuesta al menos por la mayoría absoluta de los Diputados, y habrá») no cumple ese criterio; D («-») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7df382eb-7ee5-4830-adb8-640d2ce241f6',
  'La opción incorrecta/falsa es B: Un sistema tributario justo inspirado en los principios de igualdad y progresividad que, en ningún caso, tendrá alcance confiscatorio.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'B es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '47d1db6c-9a6e-48aa-baa8-86c37a22dba0',
  'C es correcta: El reglamento tendrá un alcance general. Será obligatorio en todos sus elementos y directamente aplicable en cada Estado miembro..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La directiva será obligatoria en todos sus elementos. Cuando designe destinatarios sólo se») no cumple ese criterio; B («Las recomendaciones y dictámenes serán vinculantes.») no cumple ese criterio; D («La decisión obligará al Estado miembro destinatario en cuanto al resultado que deba conseg») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4641a19d-656b-4e9f-a6bb-88b488bd850f',
  'A es correcta: Será declarado por el Gobierno mediante decreto acordado en Consejo de Ministros por un plazo máximo de quince días, dando cuenta al Congreso de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Será declarado por mayoría absoluta del Congreso de los Diputados mediante ley por un plaz») no cumple ese criterio; C («Será declarado por el Gobierno mediante decreto acordado en Consejo de Ministros por un pl») no cumple ese criterio; D («Será declarado por mayoría absoluta del Congreso de los Diputados mediante ley por un plaz») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'de26f55b-720f-45c4-8589-b125a328e021',
  'D es correcta: Si, mediante Ley Orgánica, en relación con las facultades que por su propia naturaleza sean susceptibles de transferencia o delegación, previendo en cada caso la correspondiente transferencia de medios financieros, así como las formas de control que se reserve el Estado..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («No, en ningún caso.») no cumple ese criterio; B («Sí, mediante Ley Orgánica, en relación con cualquier tipo de facultades.») no cumple ese criterio; C («Sí, mediante Ley Orgánica, en relación con las facultades que por su propia naturaleza sea») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0c4c2835-9107-4a71-ab9f-5ec96ddec52c',
  'B es correcta: El volumen de deuda pública del conjunto de las Administraciones Públicas no podrá superar el valor de referencia establecido en el Tratado de Funcionamiento de la Unión Europea..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Las Administraciones Públicas, a excepción de las Corporaciones Locales, adecuarán sus act») no cumple ese criterio; C («Todas las Administraciones Públicas habrán de estar autorizadas por Ley para emitir deuda ») no cumple ese criterio; D («Las Comunidades Autónomas tendrán competencia para regular la metodología y procedimiento ») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd6dc1b37-d5e9-4927-b4a7-18d99794b805',
  'C es correcta: Asumirá, en su rango y condición, la representación exterior de la Unión en los asuntos de política exterior y de seguridad común..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Ejercerá funciones de control político y consultivas.») no cumple ese criterio; B («Definirá las orientaciones con arreglo a las cuales la Comisión desempeñará sus funciones.») no cumple ese criterio; D («Nombrará, de común a cuerdo con los Gobiernos de los Estados miembros, a los jueces y abog») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7c2e9a7a-f015-487a-8d4c-e3752fcf7512',
  'B es correcta: El Tribunal Constitucional..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Tribunal Supremo.») no cumple ese criterio; C («El Consejo General del Poder Judicial.») no cumple ese criterio; D («Cualquier juzgado o tribunal.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '056fec82-4404-45ff-add1-1d6786940351',
  'B es correcta: 2 tercios de los municipios cuya población represente al menos la mayoría del censo electoral de su provincia o isla.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («2 tercios de los municipios cuya población represente 3 quintos del censo electoral de su ») no cumple ese criterio; C («la mayoría de los municipios cuya población represente la mayoría del censo electoral de s») no cumple ese criterio; D («3 quintos de los municipios o mayoría del censo electoral de su provincia o isla») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9c51ad52-e927-49a0-bacc-40c75d64efab',
  'La opción incorrecta/falsa es C: Los Reglamentos comunitarios son directamente aplicables en España desde su publicación en el Boletín Oficial del Estado.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'C es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2b3cf856-72ca-46a3-95aa-d39a8e80280e',
  'D es correcta: Cuando la decisión designe destinatarios, sólo será obligatoria para éstos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Para ejercer las competencias de la Unión, las instituciones adoptarán reglamentos, direct») no cumple ese criterio; B («El reglamento tendrá un alcance sectorial.») no cumple ese criterio; C («Las directivas y decisiones no serán vinculantes.») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '05236377-b831-4ca5-9c3b-e7ec98351240',
  'A es correcta: Sugerencias de las Instituciones comunitarias a los Estados miembros para que actúen en un determinado sentido en relación con materias concretas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Ninguna de las respuestas es correcta.») no cumple ese criterio; C («Sugerencias de los Estados miembros a las Instituciones comunitarias para que actúen en un») no cumple ese criterio; D («Sugerencias de las Instituciones comunitarias a los Estados miembros para que actúen en un») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '67f905d2-12fd-4ccd-97fa-a7efa3e17962',
  'La opción incorrecta/falsa es D: Autorizar indultos generalesen los términos previstos en la Constitución.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'D es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3ba04d93-0a4d-4069-a7f1-3cf36a8c8ca4',
  'D es correcta: El Consejo, el Consejo Europeo, la Comisión, el Parlamento Europeo, el Banco Central Europeo, el Tribunal de Justicia y el Tribunal de Cuentas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Consejo, el Consejo Europeo, la Comisión, el Parlamento Europeo y el Tribunal de Justic») no cumple ese criterio; B («El Consejo, el Consejo Europeo, la Comisión, el Parlamento Europeo, el Comité de las Regio») no cumple ese criterio; C («El Consejo, el Consejo Europeo, la Comisión, el Parlamento Europeo, el Comité de las Regio») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '08069ca8-6ea6-4736-97f7-09f5598aae03',
  'B es correcta: Consiste en el proceso por parte de la Unión Europea para la supervisión y alineación de objetivos presupuestarios de los Estados miembros, entre otras funciones..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Consiste en el proceso por parte de la Unión Europea para la gestión de políticas medioamb») no cumple ese criterio; C («Es el periodo temporal donde se consolidan los grupos parlamentarios en el Parlamento Euro») no cumple ese criterio; D («Se denomina así a cada periodo de presidencia, de 6 meses de duración, del Consejo.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c84531d2-6095-4169-97be-3c8519abda50',
  'La opción incorrecta/falsa es D: Los jueces, los magistrados y los fiscales no pueden asociarse profesionalmente mientras se encuentren en activo.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'D es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f7344a3f-22e7-4f86-974c-3ec6d83de5db',
  'A es correcta: La comparecencia de los miembros del Gobierno ante las Cámaras y sus Comisiones puede extenderse también a los funcionarios de sus Departamentos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Los funcionarios sólo comparecerán si así lo solicitasen las propias Cámaras o sus Comisio») no cumple ese criterio; C («Los funcionarios sólo comparecerán si así lo deciden los miembros del Gobierno.») no cumple ese criterio; D («Los funcionarios no comparecerán en ningún caso.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '70f89319-c2dd-4597-9d33-3ff5934364d8',
  'La opción incorrecta/falsa es D: Legislación sobre propiedad intelectual e industrial. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'D es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '1eb91d81-5658-46cf-bca8-079b6dbad6a4',
  'C es correcta: Nombrar y separar a los miembros del Gobierno, a propuesta de su Presidente..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Plantear ante el Congreso de los Diputados, previa deliberación del Consejo de Ministros, ») no cumple ese criterio; B («Dirigir la política de defensa y ejercer respecto de las Fuerzas Armadas las funciones pre») no cumple ese criterio; D («Interponer el recurso de inconstitucionalidad.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'da1dc5f1-6a12-41b6-9b1c-59f7521c8960',
  'A es correcta: Funcionarios de carrera, contratados en régimen de Derecho Laboral y personal eventual..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Funcionarios de carrera, interinos y contratados en régimen de Derecho Laboral.») no cumple ese criterio; C («Funcionarios de carrera, contratados laborales y el personal con habilitación de carácter ») no cumple ese criterio; D («Funcionarios y personal eventual.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '98d39d44-8fb3-4846-a025-4a2f3a80b2e2',
  'C es correcta: No podrá iniciarse en tiempo de guerra o de vigencia de los estados de alarma, excepción o sitio..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Podrá iniciarse en cualquier circunstancia.») no cumple ese criterio; B («Podrá iniciarse en cualquier circunstancia, salvo en tiempo de guerra.») no cumple ese criterio; D («No podrá iniciarse hasta que no hayan transcurrido dos meses desde el cese del estado de e») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e2d6aed3-1285-4600-b6e3-2531456d12da',
  'C es correcta: eficacia, jerarquía, descentralización, desconcentración y coordinación.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («eficiencia, legalidad, descentralización, desconcentración y cooperación») no cumple ese criterio; A («eficacia, legalidad, descentralización, desconcentración y coordinación») no cumple ese criterio; D («eficiencia, jerarquía, descentralización, desconcentración y cooperación») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dcb6c497-8bab-4658-8d73-81fd7f93153c',
  'B es correcta: Mediante una ley de bases (textos articulados) o por una ley ordinaria (refundir textos legales)..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («En materia de desarrollo de los derechos fundamentales y de las libertades públicas.») no cumple ese criterio; C («De forma expresa para una materia concreta y sin fijar plazo para su ejecución.») no cumple ese criterio; D («Permitiendo la subdelegación expresa a autoridades distintas del propio Gobierno.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '66c84590-b882-473b-a04c-c5ece95f7dc2',
  'A es correcta: El Ministerio Fiscal.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («El Consejo General del Poder Judicial») no cumple ese criterio; C («El Defensor del Pueblo») no cumple ese criterio; D («El Tribunal Constitucional») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6a583a89-b065-41f9-ae0e-311ab0fa162c',
  'B es correcta: La provincia es una entidad local con personalidad jurídica propia.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La provincia es una entidad local con personalidad jurídica delegada») no cumple ese criterio; C («La provincia es una parte de la Comunidad Autónoma con personalidad jurídica subrogada») no cumple ese criterio; D («La provincia es una parte de la Comunidad Autónoma con personalidad jurídica propia») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f65bac2b-81d5-4337-bcbf-0df238e58827',
  'D es correcta: Tiene como misión la defensa de todos los derechos comprendidos en el Título I de la Constitución Española, y no sólo los susceptibles de recurso de amparo..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Es el supremo órgano consultivo del Gobierno.») no cumple ese criterio; B («Puede supervisar la actividad de la Administración del Estado, pero no la de las Comunidad») no cumple ese criterio; C («Puede anular resoluciones e imponer sanciones, siempre que no impliquen privación de liber») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '125ff8d4-7373-4aea-a6e6-cdf7a81dbd10',
  'La opción incorrecta/falsa es C: Integridad, austeridad y transparencia en la actuación administrativa. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'C es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ed79fd19-3f57-450c-bc97-0ce778bd420f',
  'C es correcta: Organismos autónomos, Entidades Públicas Empresariales y Agencias estatales.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Organismos autónomos, Entidades Públicas Empresariales y autoridades administrativas indep») no cumple ese criterio; B («Organismos autónomos, consorcios y fundaciones del sector público») no cumple ese criterio; D («Organismos autónomos, Agencias estatales y autoridades administrativas independientes») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '52b561b7-2b23-41b4-abf6-6237eab76423',
  'La opción incorrecta/falsa es C: Las competencias asumidas y aquéllas del Estado sobre las que la Comunidad Autónoma se reserva el derecho de opción.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'C es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; B sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '671db0ee-9bd7-4795-9791-3fb1d7454bc7',
  'C es correcta: Después de ser promulgados deberán ser inmediatamente sometidos a debate y votación de totalidad al Congreso de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Pueden regular materia electoral general en caso de urgente necesidad.») no cumple ese criterio; B («Para dictar estas normas es necesaria la delegación previa de las Cortes Generales.») no cumple ese criterio; D («La potestad de dictarlos la tiene el Presidente del Gobierno.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '5f3dbd26-7d34-42cc-bda9-1e61a5953284',
  'A es correcta: La validez del Derecho comunitario es independiente de su aceptación por los Estados Miembros..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («El Derecho Comunitario, si es claro, preciso y autosuficiente, no requiere ninguna medida ») no cumple ese criterio; C («Los Estados miembros deben facilitar y adoptar medidas para el eficaz cumplimiento del der») no cumple ese criterio; D («La norma Comunitaria prevalece sobre una norma de derecho interno.») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8297b183-4255-4a5c-b7d4-f2aef1808734',
  'D es correcta: La norma Comunitaria prevalece sobre una norma de derecho interno..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La validez del Derecho comunitario es independiente de su aceptación por los Estados Miemb») no cumple ese criterio; B («El Derecho Comunitario, si es claro, preciso y autosuficiente, no requiere ninguna medida ») no cumple ese criterio; C («Los Estados miembros deben facilitar y adoptar medidas para el eficaz cumplimiento del der») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '24bb7204-2582-4b1c-91f5-61f8496f65e5',
  'C es correcta: El Príncipe heredero de la Corona, si fuese mayor de edad..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El padre o la madre del Rey.») no cumple ese criterio; B («El pariente de mayor edad más próximo a suceder en la Corona.») no cumple ese criterio; D («El Príncipe heredero de la Corona, aunque fuese menor de edad.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '86bc2dda-04cd-44c5-bc69-44fc982ba433',
  'A es correcta: Requiere la previa autorización del Congreso de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Requiere la previa autorización de las Cortes Generales.») no cumple ese criterio; C («Tendrá efectos vinculantes si su resultado es ratificado por las Cortes Generales.») no cumple ese criterio; D («Se realizará por el Presidente del Gobierno, previa autorización de las Cortes Generales.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2bfc58d4-45a8-46ca-956d-b810735d9057',
  'B es correcta: El artículo 31.2 de la Constitución Española..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El artículo 103.1 de la Constitución Española.») no cumple ese criterio; C («El Preámbulo de la Constitución Española.») no cumple ese criterio; D («La eficiencia y la economía no son principios constitucionales, por lo que no están recogi») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b2a44852-272d-4c54-ac49-fc5c257969ca',
  'C es correcta: La Subsecretaría del Departamento correspondiente..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La Secretaría de Estado de Digitalización e Inteligencia Artificial.») no cumple ese criterio; B («La Secretaría General de Administración Digital, con rango de Subsecretaría.») no cumple ese criterio; D («La Dirección General de Digitalización e Inteligencia Artificial.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'caeaf2e2-093e-4577-938e-881261d848fb',
  'C es correcta: Serán públicas, con las excepciones que prevean las leyes de procedimiento..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Serán secretas, según las leyes de procedimiento.») no cumple ese criterio; B («Serán privadas, con las excepciones que prevean las leyes de procedimiento.») no cumple ese criterio; D («Se realizarán a puerta cerrada, según las leyes de procedimiento.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '21f2ec21-3cc5-48bc-affa-743c510058d7',
  'B es correcta: De los derechos y deberes de los ciudadanos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («De los derechos fundamentales y de las libertades públicas.») no cumple ese criterio; C («De los principios rectores de la política social y económica.») no cumple ese criterio; D («De las garantías de las libertades y derechos fundamentales.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9e3a22f0-04e5-46ea-97a3-f2230dc5cb15',
  'C es correcta: A las disposiciones sancionadoras no favorables o restrictivas de derechos individuales..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («A todas las normas de carácter penal.») no cumple ese criterio; B («A todas las disposiciones legales de cualquier orden.») no cumple ese criterio; D («A las disposiciones sancionadoras favorables o no restrictivas de derechos públicos.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '26407b6c-f0f3-483c-be6b-45ac3e8be74f',
  'B es correcta: Fomento y coordinación general de la investigación científica y técnica..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Los montes y aprovechamientos forestales.») no cumple ese criterio; C («Ordenación del territorio, urbanismo y vivienda.») no cumple ese criterio; D («La gestión en materia de protección del medio ambiente.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ce97324c-4525-4465-b553-825193419d9c',
  'B es correcta: La naturaleza, funcionamiento y estructura de los partidos políticos..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La regulación sobre la adquisición de la nacionalidad española.») no cumple ese criterio; C («La entrada en vigor de la propia Constitución.») no cumple ese criterio; D («El reconocimiento de los derechos históricos de los territorios forales.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dc2ed80c-7b78-48fe-bac7-5bdeedc9bfb4',
  'B es correcta: Fomento y coordinación general de la investigación científica y técnica.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Promoción del deporte y de la adecuada utilización del ocio») no cumple ese criterio; C («Los montes y aprovechamientos forestales») no cumple ese criterio; D («Ordenación del territorio, urbanismo y vivienda») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e44fd1f8-d252-4ece-9b1f-378fd0ce262b',
  'A es correcta: A Diputaciones u otras Corporaciones de carácter representativo..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («A los Subdelegados del Gobierno y a los Directores Insulares.») no cumple ese criterio; C («A las Diputaciones y a las Mancomunidades de Municipios.») no cumple ese criterio; D («A las Diputaciones y a las Comarcas.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8641cd2d-fe88-41e7-ac20-f4a14ace66b2',
  'B es correcta: En municipios, en provincias y en las Comunidades Autónomas que se constituyan..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («En municipios, en comarcas, en provincias y en las Comunidades Autónomas que se constituya») no cumple ese criterio; C («En Comunidades Autónomas.») no cumple ese criterio; D («En provincias, en islas y en las Comunidades Autónomas que se constituyan.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '16bb06e6-99a6-4cd3-a7a2-1212580bbbb5',
  'A es correcta: A las Fuerzas o Institutos armados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («A los Cuerpos o Fuerzas armadas.») no cumple ese criterio; C («A los Institutos sometidos a disciplina militar.») no cumple ese criterio; D («A los funcionarios públicos.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f8fe7bc3-34fc-43e3-8f3f-ddb73cb4786a',
  'D es correcta: Al Gobierno..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Al Jefe del Estado, por corresponderle el mando supremo de las Fuerzas Armadas.») no cumple ese criterio; B («A las Cortes Generales, como representación del pueblo español.») no cumple ese criterio; C («Al Congreso de los Diputados.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2fff846c-b358-41ef-999f-b16c5d611101',
  'B es correcta: Previa autorización de las Cortes Generales, declarar la guerra y hacer la paz..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Previa autorización del Presidente del Gobierno, declarar la guerra y hacer la paz.») no cumple ese criterio; C («Previa autorización del Consejo de Ministros, declarar la guerra y hacer la paz.») no cumple ese criterio; D («-») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'df76aa9d-8332-4d46-a655-42a07772b5ac',
  'A es correcta: El Tribunal de Cuentas ejerce el control económico y presupuestario de la actividad de los órganos de las Comunidades Autónomas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («El Tribunal de Cuentas está integrado por ocho magistrados.») no cumple ese criterio; C («El Presidente del Tribunal de Cuentas es nombrado por las Cortes Generales.») no cumple ese criterio; D («-») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'ac3c6883-13c2-4e21-9763-ac29bb5eadbd',
  'La opción incorrecta/falsa es A: corresponderá al Estado. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'A es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b5e20c03-5103-486b-8073-dc1dcd1bb6f7',
  'C es correcta: La a y la b son correctas.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'D («Ninguna de las anteriores») no cumple ese criterio; A («Una subsecretaría») no cumple ese criterio; B («Una Secretaria General Técnica asociada a la Subsecretaría») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a5c46fd9-102d-478f-a57c-c29a44f09233',
  'D es correcta: Al Rey, previa autorización de las Cortes Generales..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («A las Cortes Generales, previa autorización del Rey.») no cumple ese criterio; B («Al Rey, previa autorización del Congreso.») no cumple ese criterio; C («Al Congreso de los Diputados, previa autorización del Rey.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6e5e68ea-5b27-4f38-b21e-746f3929e7fa',
  'B es correcta: Una Subsecretaría, y dependiendo de ella una Secretaría General Técnica.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Una Secretaría General Técnica, y dependiendo de ella una Subsecretaría») no cumple ese criterio; C («Una Subsecretaría, y dependiendo de ella una Secretaría General») no cumple ese criterio; D («Una Secretaría de Estado, y dependiendo de ella una Secretaría General Técnica») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd11c9040-1a58-4d20-a0ce-4083ae301bf4',
  'C es correcta: Puede ser instada por las Asambleas de las Comunidades Autónomas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Le corresponde exclusivamente al congreso y al Senado.») no cumple ese criterio; B («Puede ser ejercida por el Tribunal Constitucional.») no cumple ese criterio; D («Le corresponde exclusivamente al Gobierno.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '537c9b2d-4e32-4427-99dd-2b1ae33ff9d1',
  'D es correcta: los Jefes de Estado o de Gobierno de los países de la UE, el presidente del Consejo Europeo y el presidente de la Comisión Europea.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («los Ministros de cada país de la UE, en función del tema que se vaya a tratar») no cumple ese criterio; B («un equipo de comisarios, uno por cada país de la UE») no cumple ese criterio; C («705 diputatos») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a973e208-7733-4027-bc62-f7fc7e7e5a95',
  'La opción incorrecta/falsa es B: Conseguir la unidad financiera europea.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'B es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2d7fccc5-4fd7-4f09-b872-26df2f8b8d8a',
  'C es correcta: A petición del Presidente del Gobierno..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Cuando el Rey, por razones de interés general, así lo decida.») no cumple ese criterio; B («A petición del Pleno del Consejo de Ministros.») no cumple ese criterio; D («No está prevista constitucionalmente la presidencia del Consejo de Ministros por parte del») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '48a1d489-0779-406a-bed1-552ec003c83c',
  'B es correcta: Su objetivo es reactivar la inversión y el crecimiento en Europa..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El denominado plan Juncker es un fondo de inversiones con el que el Ejecutivo comunitario ») no cumple ese criterio; C («El dinero procederá de los presupuestos europeos.») no cumple ese criterio; D («Banco Europeo de Inversiones aportará 15000 millones de euros.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b5ceb322-761d-4dcd-a0ec-0d318592f600',
  'La opción incorrecta/falsa es B: Ejercer la potestad reglamentaria en las materias propias de la Subsecretaría. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'B es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'cc1d2743-446f-4bd6-be6d-31090a9d79fb',
  'C es correcta: Ordenación del territorio, urbanismo y vivienda.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Legislación sobre productos farmacéuticos») no cumple ese criterio; B («Bases de régimen minero y energético») no cumple ese criterio; D («Legislación sobre propiedad intelectual e industrial») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f5e59ca6-cd5b-467d-9a20-3d05d1c0c4be',
  'B es correcta: Los Ministros y los Secretarios de Estado.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Los Subsecretarios y Secretarios generales») no cumple ese criterio; C («Los Ministros, los Organismos autónomos y demás entes públicos estatales») no cumple ese criterio; D («Los Ministros, los Secretarios de Estado y los Subsecretarios») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3829796a-4fcf-4306-a939-4fbe3b39e2cc',
  'C es correcta: De utilidad pública o interés social..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («De calamidad pública.») no cumple ese criterio; B («De grave riesgo.») no cumple ese criterio; D («En cualquiera de las situaciones anteriores.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4e8625fc-0b07-4367-85ae-f81b3d1e7001',
  'Todas las afirmaciones previas son correctas; por eso la respuesta es D.',
  'D recoge que el resto de opciones verdaderas se cumplen.',
  'Las opciones parciales no agotan el conjunto correcto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '3d52264f-41de-42cb-ac93-d916654f1735',
  'B es correcta: al menos por la décima parte de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («al menos por 50 Diputados.») no cumple ese criterio; C («por la Mesa del Congreso de los Diputados.») no cumple ese criterio; D («al menos por dos grupos políticos del Congreso de los Diputados.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b6f27eef-188c-4f83-a406-798e31e73f0c',
  'D es correcta: 4 años no renovables salvo que hubiera permanecido en el cargo menos de 2 años.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («5 años renovables por otros 5») no cumple ese criterio; B («5 años no renovables») no cumple ese criterio; C («4 años renovable por otros 4») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e5e4e2b1-7e3b-4218-bc20-5340e8b943a7',
  'D es correcta: las Cortes Generales.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («las leyes de presupuestos autonómicos») no cumple ese criterio; B («la Ley de Presupuestos Generales del Estado») no cumple ese criterio; C («el Gobierno, mediante Real Decreto») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '47b0f1cf-35be-4594-9e43-511090e27ee7',
  'D es correcta: El Presidente, de los Vicepresidentes en su caso, de los Ministros y demás miembros que establezca la ley..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Presidente y su gabinete.») no cumple ese criterio; B («El Presidente y sus Ministros.») no cumple ese criterio; C («El Rey y el Presidente.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '052e9b89-f651-46b7-ba16-d7812bb10ac7',
  'D es correcta: Ninguna es correcta..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Sancionada y promulgada por el Rey.») no cumple ese criterio; B («Aprobada por los Plenos del Congreso y el Senado.») no cumple ese criterio; C («Ratificada mediante referéndum por el pueblo español.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8e835ee7-71df-4858-9702-8ca5b30f08ce',
  'A es correcta: Por la Ley Orgánica del Poder Judicial.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Por las leyes de las Comunidades Autónomas que tengan cedida esta competencia») no cumple ese criterio; C («Por la ley del Ministerio Fiscal») no cumple ese criterio; D («Por leyes ordinarias específicas») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f230e1a5-a665-4827-824e-db9c31497ab5',
  'B es correcta: en Presidencia del Gobierno y en Ministerios.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («en Ministerios») no cumple ese criterio; C («en Presidencia del Gobierno, en Ministerios y en Secretarías Generales») no cumple ese criterio; D («en Presidencia del Gobierno, en Ministerios, en Secretarías Generales y en el Servicio Ext») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '29cb05b0-2039-43dd-9658-d40779d7c8e9',
  'C es correcta: El Título X de la Constitución Española..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Título VIII de la Constitución Española.») no cumple ese criterio; B («El Título IX de la Constitución Española.») no cumple ese criterio; D («La Disposición Adicional 1ª de la Constitución Española.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0cf409d8-5bac-4f49-8330-4ceb9abb4cc8',
  'C es correcta: Monarquia parlamentaria..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Estado democrático.») no cumple ese criterio; B («Estado social y democrático de Derecho.») no cumple ese criterio; D («Estado autonómico.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'f2fb1527-8ea4-43ba-bf52-1351e781a971',
  'B es correcta: Open Source Observatory (OSOR)..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Copernicus.») no cumple ese criterio; C («Erasmus+.») no cumple ese criterio; D («-») no cumple ese criterio.',
  '[{"title":"Ingeniería del software","url":"https://en.wikipedia.org/wiki/Software_engineering"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'cfb1b6da-c2b8-4d29-997c-14c3fa9284b9',
  'D es correcta: Marco Financiero Plurianual..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Pacto Económico Europeo.») no cumple ese criterio; B («Plan Presupuestario Quinquenal.») no cumple ese criterio; C («Agenda Estratégica.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '39e62541-489b-4559-9898-bba28964c4d3',
  'B es correcta: Ambos tienen la consideración de alto cargo.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Ministro es órgano superior y el Secretario de Estado es órgano directivo») no cumple ese criterio; C («Ambos tienen la consideración de órganos directivos») no cumple ese criterio; D («Ambos nombrados por el Rey») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'd9291436-d386-40b3-a863-a8142984db10',
  'C es correcta: Los Reglamentos de las Cámaras..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Ley Orgánica.») no cumple ese criterio; B («Lo dispuesto en la normativa comunitaria.») no cumple ese criterio; D («El Reglamento del Congreso de los Diputados, exclusivamente.») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '6cd8d9bb-9fd4-4f42-86c7-3e2ba1225a84',
  'D es correcta: Rhea..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («EPI.») no cumple ese criterio; B («SiPearl.») no cumple ese criterio; C («Manué.») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7625d215-5467-4972-a15a-9be98f196625',
  'C es correcta: Unión aduanera..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Mercado exterior.») no cumple ese criterio; B («Agricultura y pesca.») no cumple ese criterio; D («Medio ambiente.») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0846cf6b-aa3a-4c20-a4c8-3080d4293c2a',
  'A es correcta: Puede ejercer la potestad legislativa..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Sólo puede ejercer la potestad reglamentaria.») no cumple ese criterio; C («No puede ejercer la actividad de fomento.») no cumple ese criterio; D («-») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '057e2192-b9ca-45ed-b877-d9db8a671c87',
  'Todas las afirmaciones previas son correctas; por eso la respuesta es D.',
  'D recoge que el resto de opciones verdaderas se cumplen.',
  'Las opciones parciales no agotan el conjunto correcto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '04e23681-5b03-40f9-bec5-cf7a4ce7f76a',
  'D es correcta: Ante la ley..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Ante las instituciones.») no cumple ese criterio; B («Ante el Gobierno Central.») no cumple ese criterio; C («Ante las Cortes Generales.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '668b3e0c-39df-463c-8bfa-7153c93d782c',
  'C es correcta: El pueblo español..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Las Cortes Generales.») no cumple ese criterio; B («El Congreso de los Diputados.») no cumple ese criterio; D («El Estado.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '50f6fc46-52aa-4a33-bdee-862239393707',
  'C es correcta: La Constitución..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Estado.») no cumple ese criterio; B («Los poderes públicos.») no cumple ese criterio; D («El Poder Judicial.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '9fd6d1f9-38b5-49f8-83b1-49fbecda5a3f',
  'C es correcta: El Congreso de los Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («El Jefe del Estado.») no cumple ese criterio; B («El Tribunal Constitucional.») no cumple ese criterio; D («Las Cortes Generales.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'b69a0d70-f01c-4c33-9da7-3b57c1baac19',
  'B es correcta: Ley 40/2015. Título I, capítulo III..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Ley 40/2015. Título I, capítulo II.») no cumple ese criterio; C («Ley 40/2015. Título I, capítulo IV.») no cumple ese criterio; D («Ninguna de las anteriores es correcta.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '29b127c3-330e-49f1-843e-0f5a3178d65a',
  'A es correcta: Subsecretario.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'D («ninguna es correcta») no cumple ese criterio; B («Subdirector general») no cumple ese criterio; C («Secretario de Estado») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '7a7325e0-f1b7-42ee-bfa8-1348bd47622c',
  'C es correcta: Veintisiete Jueces y once Abogados Generales..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Veintiocho Jueces y once Abogados Generales.») no cumple ese criterio; B («Veintisiete Jueces y veintisiete Abogados Generales.») no cumple ese criterio; D («Veintiocho Jueces y ocho Abogados Generales.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '53a11f7d-a82f-41b7-8831-c293bf5c261d',
  'C es correcta: Las Cortes Generales, mediante ley orgánica.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («el Rey») no cumple ese criterio; B («el Gobierno, mediante Real Decreto») no cumple ese criterio; D («la Diputación provincial y 2 tercios de los municipios») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '69ce7e5d-3656-4fa3-a4d7-41133adf0a79',
  'La opción incorrecta/falsa es B: La caza y la pesca fluvial.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'B es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4728bcf2-563a-4301-a50e-5b924e47c28c',
  'D es correcta: Juzgar y hacer ejecutar lo juzgado.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Juzgar y sentenciar lo juzgado») no cumple ese criterio; B («Conocer y juzgar lo conocido») no cumple ese criterio; C («Todas las respuestas son ciertas») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '490b13bc-a7a1-458a-81fe-98af4e3b49a9',
  'D es correcta: El Tribunal Superior de Justicia.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La Audiencia Territorial») no cumple ese criterio; B («La Audiencia Provincial») no cumple ese criterio; C («El Tribunal Supremo») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '4b7240ad-64f6-4f0a-a547-a577cbec5b61',
  'D es correcta: Al Gobierno, al Congreso y al Senado..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Al Congreso y al Senado, únicamente.») no cumple ese criterio; B («Al rey y al Gobierno.») no cumple ese criterio; C («Al Congreso, al Senado y al Rey.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '52965860-dd6c-4498-857c-ef4561d2b79a',
  'La opción incorrecta/falsa es A: Centralización. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'A es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'B sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'e6872255-86b8-4322-bf7a-b4af8e35216d',
  'A es correcta: Un mínimo de 300 Diputados..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Un máximo de 350 Diputados.») no cumple ese criterio; C («Un mínimo de 400 Diputados.») no cumple ese criterio; D («Un máximo de 300 Diputados.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '8aee34b1-c9d5-484d-a68c-bb8a07b5185a',
  'A es correcta: El Consejo Europeo..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («El Consejo de la Unión Europea.») no cumple ese criterio; C («Los miembros de la Comisión Europea.») no cumple ese criterio; D («El Parlamento Europeo.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '66ddf742-3e6e-4a5b-8399-80f6ff5155b4',
  'A es correcta: Cambia cada seis meses.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Cambia cada año») no cumple ese criterio; C («Es elegida por el Parlamento Europeo») no cumple ese criterio; D («Es inexistente, es decir, no existe la Presidencia de la Unión Europea») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '15553b4a-ff7c-476f-bca6-ab7240ca0564',
  'A es correcta: tres quintos.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («mayoría simple») no cumple ese criterio; C («mayoría absoluta») no cumple ese criterio; D («dos tercios») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'dde6f534-2b5e-44f6-b8b5-8c994c688657',
  'A es correcta: Al Gobierno..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («A las Cortes Generales.») no cumple ese criterio; C («Al Poder Judicial.») no cumple ese criterio; D («Al Congreso de los Diputados.») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'a05ccd07-b893-497f-84dd-d5179dec3edc',
  'D es correcta: Tratado de Maastricht..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Tratado de Roma.») no cumple ese criterio; B («Tratado de Lisboa.») no cumple ese criterio; C («Tratado de Ámsterdam.») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2d3e571e-7921-4584-a679-12727b8395ac',
  'D es correcta: Todos los anteriores son correctas.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («La Organización Central») no cumple ese criterio; B («La Organización Territorial.») no cumple ese criterio; C («La Administración General del Estado en el exterior») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '27b89ff9-7839-4aa7-9d75-092a88ae8b07',
  'B es correcta: 14.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («17») no cumple ese criterio; C («20») no cumple ese criterio; D («31») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '84a4cf7b-403c-4498-86df-d43752413905',
  'B es correcta: cada una de las Comunidades Autónomas.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («la capital del país») no cumple ese criterio; C («cada una de las provincias») no cumple ese criterio; D («cada una de las embajadas españolas») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2ad127cf-3ada-4800-a53c-bf6b9e7c57e4',
  'C es correcta: Las respuestas a y b son correctas..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («FEDER (Fondo Europeo de Desarrollo Regional).») no cumple ese criterio; B («FSE (Fondo Social Europeo).») no cumple ese criterio; D («Ninguno de los anteriores.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '5ae32d55-da35-4cf9-9fb3-49472e3b84d0',
  'C es correcta: 12.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («8») no cumple ese criterio; B («10») no cumple ese criterio; D («15») no cumple ese criterio.',
  '[{"title":"Constitución Española (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '0010ea0f-aa8d-40ee-b827-9641afe56fa6',
  'B es correcta: Una ley orgánica..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Una ley ordinaria.») no cumple ese criterio; C («Una ley de bases.») no cumple ese criterio; D («Una ley de transferencia.») no cumple ese criterio.',
  '[{"title":"Conceptos de redes","url":"https://en.wikipedia.org/wiki/Computer_network"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c30c9ea7-387f-49a7-b072-0e48d69bea6c',
  'B es correcta: Portugal.',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'A («Grecia») no cumple ese criterio; C («Las alternativas a) y b) son correctas») no cumple ese criterio; D («Ninguno») no cumple ese criterio.',
  '[{"title":"Instituciones UE","url":"https://european-union.europa.eu/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  'c5aeb29a-160d-4b61-8152-d8ecfee523ac',
  'La opción incorrecta/falsa es B: Crecimiento inclusivo.. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.',
  'B es la que NO cumple el criterio pedido (la falsa/incorrecta).',
  'A sí es coherente o verdadera en este contexto; C sí es coherente o verdadera en este contexto; D sí es coherente o verdadera en este contexto.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '54487c39-f4fc-45af-b6c9-13f0e76685d2',
  'A es correcta: Una vez por semana..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Una vez al mes.») no cumple ese criterio; C («Dos veces en semana.») no cumple ese criterio; D («Cuando lo acuerde el Presidente de la Comisión, y además una vez al mes.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
  'draft',
  now(),
  now()
),
(
  '2a374db4-ee93-4eab-8533-3168596e3e62',
  'A es correcta: Legislación procesal..',
  'Coincide con el criterio normativo o técnico que exige la pregunta.',
  'B («Ordenación del territorio, urbanismo y vivienda.») no cumple ese criterio; C («Caza.») no cumple ese criterio; D («Asistencia social.») no cumple ese criterio.',
  '[{"title":"Referencia temática (revisar)","url":"https://www.boe.es/"}]'::jsonb,
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
