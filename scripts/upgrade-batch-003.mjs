#!/usr/bin/env node
/**
 * Overlay crafted explanations onto a drafted batch JSON.
 * Usage: node scripts/upgrade-batch-003.mjs
 */
import fs from "node:fs/promises";

const upgrades = {
  "4b831ff7-e06d-40b0-9cdb-bc4760a89cf5": {
    explanation:
      "IANA delega recursos en cinco RIR: AfriNIC, APNIC, ARIN, LACNIC y RIPE NCC. No existe un RIR llamado EUNIC para Europa.",
    whyCorrect: "B es la opción que NO se corresponde con un RIR real.",
    whyOthers:
      "AfriNIC, APNIC y LACNIC sí son RIR. El europeo es RIPE NCC, no EUNIC.",
    sources: [
      {
        title: "Regional Internet registry",
        url: "https://en.wikipedia.org/wiki/Regional_Internet_registry",
      },
    ],
  },
  "f412f6b2-5af7-484a-9468-f6bd3467fbfe": {
    explanation:
      "ITIL 4 se publicó en febrero de 2019 (no a finales de 2018). Sí introduce cuatro dimensiones y principios guía compatibles con ágil.",
    whyCorrect: "A es la afirmación falsa respecto a ITIL V4.",
    whyOthers:
      "B y C son rasgos reales de ITIL 4; por tanto D (“todas falsas”) también es incorrecta.",
    sources: [
      {
        title: "ITIL",
        url: "https://en.wikipedia.org/wiki/ITIL",
      },
    ],
  },
  "8d609190-49f8-4550-8710-2dc33cd1af39": {
    explanation:
      "Al modularizar, el coste por módulo baja pero el de interfaz sube; el óptimo es el equilibrio. No es cierto que “menos módulos” minimicen siempre el coste total.",
    whyCorrect: "C es la afirmación incorrecta.",
    whyOthers:
      "A, B y D describen el trade-off clásico de modularización.",
    sources: [
      {
        title: "Modular programming",
        url: "https://en.wikipedia.org/wiki/Modular_programming",
      },
    ],
  },
  "1db6a0c3-fc3a-470b-8409-d2de109ef93c": {
    explanation:
      "La LOPDGDD/RGPD protege especialmente categorías como salud, religión u origen racial; los datos “administrativos” no son categoría especialmente protegida por sí mismos.",
    whyCorrect: "B no está especialmente protegido como categoría sensible.",
    whyOthers: "Salud, religión y origen racial sí son categorías especiales.",
    sources: [
      {
        title: "LOPDGDD (LO 3/2018)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673",
      },
    ],
  },
  "64e71501-9e8b-40a3-b3ff-359dae280e6b": {
    explanation:
      "RUP es iterativo e incremental; el desarrollo secuencial (en cascada pura) no es un principio clave de RUP.",
    whyCorrect: "C NO es un principio correcto de RUP.",
    whyOthers:
      "Equilibrio de prioridades, colaboración y calidad sí encajan con RUP.",
    sources: [
      {
        title: "Rational Unified Process",
        url: "https://en.wikipedia.org/wiki/Rational_Unified_Process",
      },
    ],
  },
  "48ef9769-0723-4096-8e08-4fff33f5e63a": {
    explanation:
      "GMPLS generaliza MPLS a conmutación temporal, de longitud de onda y espacial; esos caminos se denominan LSP.",
    whyCorrect: "D: tanto a) como b) son correctas.",
    whyOthers: "A y B por separado son verdaderas; C las niega erróneamente.",
    sources: [
      {
        title: "Generalized Multi-Protocol Label Switching",
        url: "https://en.wikipedia.org/wiki/Generalized_Multi-Protocol_Label_Switching",
      },
    ],
  },
  "2885b2dc-75ea-4b31-a0de-e908ef04c900": {
    explanation: "VoIP significa Voice over IP: voz sobre redes IP.",
    whyCorrect: "A define correctamente el acrónimo y su función.",
    whyOthers: "B–D inventan significados (vídeo/virtual/visual).",
    sources: [
      {
        title: "Voice over IP",
        url: "https://en.wikipedia.org/wiki/Voice_over_IP",
      },
    ],
  },
  "ff91c463-7722-41f2-bc43-0bd20c674343": {
    explanation:
      "El art. 123 CE atribuye al Tribunal Supremo la supremacía jurisdiccional, salvo garantías constitucionales (TC).",
    whyCorrect: "C reproduce ese mandato constitucional.",
    whyOthers:
      "TSJ, AN o CGPJ no ocupan esa posición de órgano jurisdiccional superior en todos los órdenes.",
    sources: [
      {
        title: "Constitución Española (BOE)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
      },
    ],
  },
  "207591b1-cce7-4c34-a6c4-9f294b30d52f": {
    explanation:
      "El art. 3 TFUE enumera competencias exclusivas de la Unión; entre ellas, la unión aduanera.",
    whyCorrect: "A es competencia exclusiva.",
    whyOthers:
      "Redes transeuropeas, cohesión y consumidores son ámbitos de competencia compartida/apoyo, no exclusivos del art. 3.",
    sources: [
      {
        title: "TFUE — EUR-Lex",
        url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012E/TXT",
      },
    ],
  },
  "f77a9ef4-1b09-4bc3-b311-ff665cbd4ae8": {
    explanation:
      "VALIDE permite validar certificados de sede electrónica (no CSV ni URLs de portales como función principal del enunciado).",
    whyCorrect: "D identifica el alcance correcto según el ítem.",
    whyOthers: "A–C amplían el alcance a URL o CSV de forma incorrecta aquí.",
    sources: [
      {
        title: "VALIDE — Administración electrónica",
        url: "https://administracionelectronica.gob.es/",
      },
    ],
  },
  "010a6d52-db9c-4212-8aa6-245b63f2b779": {
    explanation:
      "La potestad reglamentaria del departamento no corresponde al subsecretario en los términos de B; esa afirmación es la falsa.",
    whyCorrect: "B es la falsa respecto a las funciones del subsecretario.",
    whyOthers:
      "Jefatura de personal, nombramientos de subdirectores y convocatorias selectivas sí se asocian a la Subsecretaría.",
    sources: [
      {
        title: "Ley 40/2015 RJSP",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566",
      },
    ],
  },
  "63c3a661-2aab-4439-8edc-99491bf66ed8": {
    explanation:
      "LDAP surgió como acceso más ligero a directorios tipo X.500; no al revés. X.500 no es una versión simplificada de LDAP.",
    whyCorrect: "C es incorrecta.",
    whyOthers: "A, B y D describen aspectos reales del ecosistema X.500/DAP.",
    sources: [
      {
        title: "X.500",
        url: "https://en.wikipedia.org/wiki/X.500",
      },
    ],
  },
  "6d023230-e69b-4a20-890d-9a0fe2b2d4dc": {
    explanation:
      "En .NET, el CLR (Common Language Runtime) ejecuta el código y ofrece servicios de runtime.",
    whyCorrect: "B nombra el runtime correcto.",
    whyOthers: "NVM/CNR no existen así; CIL es el lenguaje intermedio, no el runtime.",
    sources: [
      {
        title: "Common Language Runtime",
        url: "https://en.wikipedia.org/wiki/Common_Language_Runtime",
      },
    ],
  },
  "9b0118b4-dfb2-4f33-b547-0fb8e83924dc": {
    explanation:
      "No es cierto que usuarios MOSS y PEM necesiten necesariamente certificados X.509 como se afirma; esa es la falsa del ítem.",
    whyCorrect: "A es la afirmación falsa.",
    whyOthers: "B–D describen rasgos habituales de PEM/MOSS en el temario clásico.",
    sources: [
      {
        title: "Privacy-Enhanced Mail",
        url: "https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail",
      },
    ],
  },
  "26c0668c-ada9-44c8-a41f-d1b5b692611f": {
    explanation:
      "MDM (Mobile Device Management) gestiona dispositivos móviles en la red corporativa.",
    whyCorrect: "A es la denominación correcta.",
    whyOthers:
      "BYOD es política de uso; MAM gestiona apps; TCP es protocolo de transporte.",
    sources: [
      {
        title: "Mobile device management",
        url: "https://en.wikipedia.org/wiki/Mobile_device_management",
      },
    ],
  },
  "ea48b3f4-826b-4253-abe8-7b1e1e2611b0": {
    explanation:
      "En el modelo E/R, el grado de una relación es el número de tipos de entidad que participan.",
    whyCorrect: "A define el grado.",
    whyOthers:
      "B describe cardinalidad; C columnas; D atributo.",
    sources: [
      {
        title: "Entity–relationship model",
        url: "https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model",
      },
    ],
  },
  "0da75020-2f9c-461f-bed0-b760d4a98d9b": {
    explanation:
      "La Sección 1ª del Capítulo II del Título I CE se titula «De los derechos fundamentales y de las libertades públicas».",
    whyCorrect: "C identifica la ubicación correcta.",
    whyOthers: "A, B y D sitúan mal el título en la estructura del Título I.",
    sources: [
      {
        title: "Constitución Española (BOE)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
      },
    ],
  },
  "991db1ae-cd55-4fa6-8459-8c2fe6deca18": {
    explanation:
      "En PERT los tiempos de actividad se modelan de forma probabilística (estimaciones optimista/más probable/pesimista).",
    whyCorrect: "C es correcta.",
    whyOthers:
      "A describe mejor CPM determinista; B y D no caracterizan PERT.",
    sources: [
      {
        title: "Program evaluation and review technique",
        url: "https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique",
      },
    ],
  },
  "0fb4834a-d4a2-4cfc-bea9-ff491ec29d26": {
    explanation:
      "El marco de pruebas OWASP Testing Guide se organiza en cinco fases.",
    whyCorrect: "B indica cinco fases.",
    whyOthers: "Tres, siete o “cuatro procesos” no coinciden con esa división.",
    sources: [
      {
        title: "OWASP Testing Guide",
        url: "https://owasp.org/www-project-web-security-testing-guide/",
      },
    ],
  },
  "ebe29646-62b0-4698-89e8-14a1a5243dc7": {
    explanation:
      "CAT6 llega hasta 250 MHz; CAT6a hasta 500 MHz (mejor inmunidad a alien crosstalk a 10 Gbps).",
    whyCorrect: "C recoge esa diferencia de ancho de banda.",
    whyOthers:
      "A/B invierten apantallamiento/interferencias; D exagera velocidades de CAT6a.",
    sources: [
      {
        title: "Category 6 cable",
        url: "https://en.wikipedia.org/wiki/Category_6_cable",
      },
    ],
  },
  "dab71616-1541-4092-a27a-c9e9bddc7ef2": {
    explanation:
      "Un sistema experto “concha” (shell) conserva motor de inferencia/reglas vaciando la base de conocimiento para reutilizarlo.",
    whyCorrect: "B es la denominación correcta.",
    whyOthers: "Kernel/inferente/fuente no designan ese patrón de reutilización.",
    sources: [
      {
        title: "Expert system",
        url: "https://en.wikipedia.org/wiki/Expert_system",
      },
    ],
  },
  "b319e8c2-1a89-4e57-8c13-60b363ad75e1": {
    explanation:
      "En MÉTRICA v3, los casos de uso no son técnica propia de la PSI; FCE, coste/beneficio y E/R extendido sí pueden aplicarse.",
    whyCorrect: "D NO es de aplicación en PSI según el ítem.",
    whyOthers: "A–C sí se usan en planificación de sistemas de información.",
    sources: [
      {
        title: "MÉTRICA v3",
        url: "https://administracionelectronica.gob.es/pae_Home/pae_Documentacion/pae_Metodolog/pae_Metrica_v3.html",
      },
    ],
  },
  "9db22fa0-895c-4759-8b66-369118694bd9": {
    explanation:
      "ISO 9004 orienta la mejora del desempeño y no es certificable; no “garantiza” la calidad del producto.",
    whyCorrect: "D es la aseveración falsa.",
    whyOthers: "A–C son rasgos correctos de ISO 9004.",
    sources: [
      {
        title: "ISO 9004",
        url: "https://en.wikipedia.org/wiki/ISO_9000",
      },
    ],
  },
  "d737a745-e25c-44db-b089-c1cf33ab19b0": {
    explanation:
      "Un trunk en switching es un enlace que transporta tráfico de varias VLANs (p. ej. 802.1Q).",
    whyCorrect: "B define trunk correctamente.",
    whyOthers: "No es solo velocidad, media converter ni versión de firmware.",
    sources: [
      {
        title: "VLAN trunking",
        url: "https://en.wikipedia.org/wiki/VLAN",
      },
    ],
  },
  "f37a449a-2098-4ab9-9382-f2a2e2141d4a": {
    explanation:
      "El sector primario en España representa en torno al 3% del PIB (orden de magnitud típico en temarios).",
    whyCorrect: "D (~3%) es la cifra correcta del ítem.",
    whyOthers: "26%, 50% o 5% no encajan con ese peso aproximado.",
    sources: [
      {
        title: "INE / economía española",
        url: "https://www.ine.es/",
      },
    ],
  },
  "661c345b-3cb4-4e5d-9b30-2039b78cf5df": {
    explanation:
      "La reforma tributaria 2014 incluye leyes 26, 27 y 28/2014; no una Ley 29/2014 del IVA con ese contenido.",
    whyCorrect: "D no forma parte de esa reforma según el enunciado.",
    whyOthers: "A–C sí están incluidas en la reforma citada.",
    sources: [
      {
        title: "BOE — legislación tributaria",
        url: "https://www.boe.es/",
      },
    ],
  },
  "df4ef8fc-f84b-4c36-9d02-a6fb23edda0e": {
    explanation:
      "Los firewalls de capa 7 actúan como proxy de aplicación.",
    whyCorrect: "D describe ese comportamiento.",
    whyOthers:
      "No “no existen”; números de secuencia/filtros de paquetes son capas inferiores.",
    sources: [
      {
        title: "Application firewall",
        url: "https://en.wikipedia.org/wiki/Application_firewall",
      },
    ],
  },
  "596367d6-9c27-4d15-9ba1-96a57702e21b": {
    explanation:
      "Los diputados al Parlamento Europeo se eligen por 5 años (art. 14 TUE).",
    whyCorrect: "A indica el mandato de 5 años.",
    whyOthers: "4, 2 o 3 años no coinciden con el TUE.",
    sources: [
      {
        title: "Tratado de la Unión Europea",
        url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012M/TXT",
      },
    ],
  },
  "08a78504-7a3e-44e5-89f9-8ea3a530f4ac": {
    explanation:
      "En la reforma de Estatutos de Autonomía intervienen siempre las Cortes Generales.",
    whyCorrect: "A es correcta.",
    whyOthers: "No depende de la vía de acceso de la CA.",
    sources: [
      {
        title: "Constitución Española (BOE)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
      },
    ],
  },
  "bca7578e-afbf-4004-bbbf-890253f83610": {
    explanation:
      "Los Factores Críticos de Éxito priorizan actividades y recursos de la organización.",
    whyCorrect: "C identifica esa práctica.",
    whyOthers: "TOWS, coste/beneficio e impacto tienen otros objetos.",
    sources: [
      {
        title: "Critical success factor",
        url: "https://en.wikipedia.org/wiki/Critical_success_factor",
      },
    ],
  },
  "d2868ba2-bf68-467a-9d62-e1f7baf43c41": {
    explanation:
      "SLS sinteriza polvo con láser a temperatura inferior a la fusión completa.",
    whyCorrect: "A describe SLS.",
    whyOthers: "SLA usa resina; FFF filamento fundido; cera térmica es otro proceso.",
    sources: [
      {
        title: "Selective laser sintering",
        url: "https://en.wikipedia.org/wiki/Selective_laser_sintering",
      },
    ],
  },
  "0d0d9831-3c30-4168-9f0b-c9eaa109e6bd": {
    explanation:
      "El formato general de URL es método://servidor[:puerto]/directorio/fichero.",
    whyCorrect: "C es la sintaxis correcta.",
    whyOthers: "A/B/D alteran el orden de esquema, barras o puerto.",
    sources: [
      {
        title: "URL",
        url: "https://en.wikipedia.org/wiki/URL",
      },
    ],
  },
  "27b70618-aaa8-4f4c-8984-cc93fa894250": {
    explanation:
      "Las direcciones IP van en la cabecera IP, no en la de segmento TCP.",
    whyCorrect: "C no está en la cabecera TCP.",
    whyOthers:
      "Campos de urgencia/reset y contadores de la conexión sí pueden asociarse al segmento TCP en el temario.",
    sources: [
      {
        title: "Transmission Control Protocol",
        url: "https://en.wikipedia.org/wiki/Transmission_Control_Protocol",
      },
    ],
  },
  "e58df7d1-3cd4-4b14-82d6-dcabde07c8fb": {
    explanation:
      "GPRS sí requiere gestión de movilidad; negar eso es incorrecto.",
    whyCorrect: "C no caracteriza a GPRS.",
    whyOthers:
      "Envío irregular de paquetes y GGSN como pasarela sí son rasgos de GPRS.",
    sources: [
      {
        title: "General Packet Radio Service",
        url: "https://en.wikipedia.org/wiki/General_Packet_Radio_Service",
      },
    ],
  },
  "c08199ee-383f-491f-a5a6-c879b70578a0": {
    explanation:
      "El análisis de requisitos incluye criterios de prueba/evaluación del producto; no el diseño detallado de funciones ni de la BD.",
    whyCorrect: "A concierne al análisis de requerimientos según el ítem.",
    whyOthers: "B y C son más propias de diseño; D mezcla incorrectamente.",
    sources: [
      {
        title: "Requirements analysis",
        url: "https://en.wikipedia.org/wiki/Requirements_analysis",
      },
    ],
  },
  "9cec4461-63be-4d28-91f9-e85a965b988d": {
    explanation:
      "COCOMO empotrado (embedded) modela proyectos con restricciones fuertes de hardware/software y operación.",
    whyCorrect: "D define el modo empotrado.",
    whyOthers: "A–C corresponden a modos orgánico/semidetached u otras lecturas.",
    sources: [
      {
        title: "COCOMO",
        url: "https://en.wikipedia.org/wiki/COCOMO",
      },
    ],
  },
  "a1f3fed9-3ef9-4708-9be4-7c238824fa20": {
    explanation:
      "EFQM es dinámico, usa lógica RADAR/REDER y tiene carácter globalizador.",
    whyCorrect: "D: todas las anteriores son correctas.",
    whyOthers: "A–C son verdaderas por separado.",
    sources: [
      {
        title: "Modelo EFQM",
        url: "https://efqm.org/the-efqm-model/",
      },
    ],
  },
  "ee74368d-f9f9-4eea-964a-d28a967fa7c6": {
    explanation:
      "La criptografía de clave pública/privada es asimétrica.",
    whyCorrect: "B nombra el tipo correcto.",
    whyOthers: "Simétrico usa la misma clave; paralelo/redundante no aplican.",
    sources: [
      {
        title: "Public-key cryptography",
        url: "https://en.wikipedia.org/wiki/Public-key_cryptography",
      },
    ],
  },
  "858a033d-b28f-4915-8188-978d23a07e20": {
    explanation:
      "Las acciones positivas se regulan en el art. 11 de la LO 3/2007.",
    whyCorrect: "C indica el artículo correcto.",
    whyOthers: "Los arts. 13 y 14 no son el de acciones positivas en este ítem.",
    sources: [
      {
        title: "LO 3/2007 de igualdad",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115",
      },
    ],
  },
  "43b99a0e-f568-4ca6-9459-0e2e8a2a7eaf": {
    explanation:
      "iOS no soporta Adobe Flash; sí multitouch, multitarea limitada y acelerómetros.",
    whyCorrect: "A es la característica incorrecta.",
    whyOthers: "B–D sí describen capacidades de iOS.",
    sources: [
      {
        title: "iOS",
        url: "https://en.wikipedia.org/wiki/IOS",
      },
    ],
  },
  "3736c4e9-7977-4ae5-9526-1d3e610a3842": {
    explanation:
      "IANA coordina la asignación de ASN a nivel global.",
    whyCorrect: "A identifica la entidad correcta.",
    whyOthers: "ISOC, IETF e IAB tienen otros roles en la gobernanza de Internet.",
    sources: [
      {
        title: "IANA",
        url: "https://www.iana.org/",
      },
    ],
  },
  "00fe990e-0030-47de-a7cb-ab23417a5fd9": {
    explanation:
      "La Mesa de Contratación no es órgano de contratación; asiste en la adjudicación.",
    whyCorrect: "D no es órgano de contratación.",
    whyOthers:
      "Ministro, Secretario de Estado y Junta de Contratación sí pueden serlo en el ámbito ministerial.",
    sources: [
      {
        title: "Ley 9/2017 LCSP",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902",
      },
    ],
  },
  "0b6f5891-9d3c-48dc-8299-e61080053041": {
    explanation:
      "Los diagramas de secuencia son de comportamiento/interacción, no de estructura.",
    whyCorrect: "C no pertenece a los diagramas de estructura.",
    whyOthers: "Clases, objetos y estructura compuesta sí son estructurales.",
    sources: [
      {
        title: "UML diagrams",
        url: "https://en.wikipedia.org/wiki/Unified_Modeling_Language",
      },
    ],
  },
  "16d3a39d-0460-48f1-84f0-93f2fc7e3771": {
    explanation:
      "Una tarea crítica sin holgura retrasa el proyecto si se demora.",
    whyCorrect: "A es la consecuencia correcta.",
    whyOthers: "B y C niegan o relativizan incorrectamente el efecto sobre el camino crítico.",
    sources: [
      {
        title: "Critical path method",
        url: "https://en.wikipedia.org/wiki/Critical_path_method",
      },
    ],
  },
  "2689fa09-c210-498d-873e-bb7a919dec25": {
    explanation:
      "No existe como plan español “Plan Nacional de Reforestación” en el sentido del ítem; sí PNACC, PNIEC y Plan Forestal Español.",
    whyCorrect: "A no es un plan español de ese listado.",
    whyOthers: "B–D sí son planes/estrategias reales.",
    sources: [
      {
        title: "Planes ambientales España",
        url: "https://www.miteco.gob.es/",
      },
    ],
  },
  "6b688bdf-91f9-4d7a-afc4-90093e321a10": {
    explanation:
      "Los SO distribuidos destacan por concurrencia global (procesos en varios nodos).",
    whyCorrect: "B es la característica correcta del ítem.",
    whyOthers:
      "No hay reloj común estricto; no exigen homogeneidad; buscan tolerancia a fallos, no dependencia.",
    sources: [
      {
        title: "Distributed operating system",
        url: "https://en.wikipedia.org/wiki/Distributed_operating_system",
      },
    ],
  },
  "e4b22176-edfd-43f1-8530-351431d21763": {
    explanation:
      "Java no es un lenguaje nativo del ecosistema .NET (aunque existan puentes); C#, VB y C++/CLI sí.",
    whyCorrect: "A no es uno de esos lenguajes .NET.",
    whyOthers: "B–D sí son lenguajes del marco .NET.",
    sources: [
      {
        title: ".NET",
        url: "https://en.wikipedia.org/wiki/.NET",
      },
    ],
  },
  "86310b6a-43ba-4268-8678-5d751c7c1bbb": {
    explanation:
      "Apache es servidor web multiplataforma (incl. Windows), licencia libre y muy usado en Unix/Linux.",
    whyCorrect: "D: todas son correctas.",
    whyOthers: "A–C son verdaderas por separado.",
    sources: [
      {
        title: "Apache HTTP Server",
        url: "https://httpd.apache.org/",
      },
    ],
  },
  "0a2bf76a-af5d-4d54-9451-b4f76bc8a42c": {
    explanation:
      "La UE enfatiza la soberanía de los datos en los espacios de datos europeos.",
    whyCorrect: "A recoge ese principio.",
    whyOthers: "Independencia/parcialidad/agilidad no son el principio citado.",
    sources: [
      {
        title: "European data spaces",
        url: "https://digital-strategy.ec.europa.eu/en/policies/data-spaces",
      },
    ],
  },
  "b70f5e6c-4534-494f-b3ce-0b26cb01e4dd": {
    explanation:
      "Las arquitecturas pipeline se clasifican como MISD (Multiple Instruction, Single Data) en la taxonomía de Flynn.",
    whyCorrect: "C es la clasificación del ítem.",
    whyOthers: "SISD/SIMD/MIMD corresponden a otros patrones.",
    sources: [
      {
        title: "Flynn's taxonomy",
        url: "https://en.wikipedia.org/wiki/Flynn%27s_taxonomy",
      },
    ],
  },
  "5f7176ad-cfe5-4c2a-bf04-013b23daf71e": {
    explanation:
      "Fiber to the curb (FTTC) lleva la fibra hasta los derivadores/taps cercanos al usuario.",
    whyCorrect: "B es la denominación correcta.",
    whyOthers: "FTTB/FTTH/FTLA describen otros puntos de terminación.",
    sources: [
      {
        title: "Fiber to the x",
        url: "https://en.wikipedia.org/wiki/Fiber_to_the_x",
      },
    ],
  },
  "fecdf98a-0844-4bd2-86ab-4bd8371b3bd0": {
    explanation: "El etiquetado VLAN se estandariza en IEEE 802.1Q.",
    whyCorrect: "A es el estándar correcto.",
    whyOthers: "802.1R/V/T no son el estándar de VLAN tagging del ítem.",
    sources: [
      {
        title: "IEEE 802.1Q",
        url: "https://en.wikipedia.org/wiki/IEEE_802.1Q",
      },
    ],
  },
  "7d89ebe7-c4cf-4498-a91c-2312835030c3": {
    explanation:
      "La legislación delegada del Gobierno recibe el nombre de Decreto Legislativo (art. 85 CE).",
    whyCorrect: "B es el título correcto.",
    whyOthers: "Decreto-ley es legislación de urgencia; reglamento no es legislación delegada.",
    sources: [
      {
        title: "Constitución Española (BOE)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
      },
    ],
  },
  "2a26cd0b-2399-41e3-8603-12576bd0e205": {
    explanation:
      "El funcionamiento de la Junta de Contratación Centralizada se regula en la Orden HAP/2834/2015.",
    whyCorrect: "B identifica la norma correcta del ítem.",
    whyOthers: "HAP/2028/2013 y RD 695/2013 no son la cita correcta aquí.",
    sources: [
      {
        title: "Orden HAP/2834/2015 (BOE)",
        url: "https://www.boe.es/",
      },
    ],
  },
  "0c8819bf-e9ac-4324-b440-248eae1c928c": {
    explanation:
      "ANSI representa a EE.UU. en ISO y participó en estándares como FDDI.",
    whyCorrect: "D: a) y b) son verdaderas.",
    whyOthers: "A y B son correctas; C las niega.",
    sources: [
      {
        title: "American National Standards Institute",
        url: "https://en.wikipedia.org/wiki/American_National_Standards_Institute",
      },
    ],
  },
  "d2af6dc8-7c78-4ece-a069-0c1947daf879": {
    explanation:
      "QAM se usa en modulaciones analógicas y digitales.",
    whyCorrect: "C es la técnica común a ambos ámbitos.",
    whyOthers: "PSK/ASK son digitales; AM es analógica.",
    sources: [
      {
        title: "Quadrature amplitude modulation",
        url: "https://en.wikipedia.org/wiki/Quadrature_amplitude_modulation",
      },
    ],
  },
  "77c1343a-9efb-4d0f-8941-34530347a9b5": {
    explanation:
      "El delimitador de inicio de trama Ethernet (SFD) es 10101011.",
    whyCorrect: "A es el valor binario correcto.",
    whyOthers: "10101010 es el preámbulo repetido; los otros no son el SFD.",
    sources: [
      {
        title: "Ethernet frame",
        url: "https://en.wikipedia.org/wiki/Ethernet_frame",
      },
    ],
  },
  "dfb61880-5151-4065-9d9a-8eda45e0c781": {
    explanation:
      "Con mayoría cualificada en el Consejo se aplica la ponderación de los votos (sistema clásico del temario).",
    whyCorrect: "D usa la formulación correcta.",
    whyOthers: "A–C no son la denominación técnica del mecanismo.",
    sources: [
      {
        title: "Consejo de la UE — mayoría cualificada",
        url: "https://www.consilium.europa.eu/es/council-eu/voting-system/qualified-majority/",
      },
    ],
  },
  "4a0bdabe-5132-4070-8190-6ee1be57b5b5": {
    explanation:
      "El Tratado de Maastricht (1992) estableció la Unión Europea.",
    whyCorrect: "D es correcto.",
    whyOthers:
      "Roma crea CEE; Ámsterdam/Lisboa reforman la UE ya existente.",
    sources: [
      {
        title: "Tratado de Maastricht",
        url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=LEGISSUM:xy0026",
      },
    ],
  },
  "9e660d44-2bf4-40bb-a898-1d015ea24958": {
    explanation:
      "COSMIC FFP es un método de medición de puntos de función.",
    whyCorrect: "C es el método correcto.",
    whyOthers: "Delphi y COCOMO no son PF; SPFP no es el estándar citado.",
    sources: [
      {
        title: "COSMIC function points",
        url: "https://en.wikipedia.org/wiki/COSMIC_functional_size_measurement",
      },
    ],
  },
  "8ef051ab-c9ba-404c-a9be-c9ff1d9ed692": {
    explanation: "AirWatch es una solución MDM conocida.",
    whyCorrect: "C es MDM.",
    whyOthers: "Magento es e-commerce; borda/Kobli no son la solución MDM del ítem.",
    sources: [
      {
        title: "Mobile device management",
        url: "https://en.wikipedia.org/wiki/Mobile_device_management",
      },
    ],
  },
  "4fe1028e-f82a-4617-9e9c-e49ccccdad7b": {
    explanation:
      "Según el ítem, el “Plan de Acción europeo para la Contaminación Cero” no se considera en ese listado de planes europeos de medio ambiente.",
    whyCorrect: "D es la que no cuenta como tal en la pregunta.",
    whyOthers: "Red Natura 2000, Marco clima 2030 y Pacto Verde sí.",
    sources: [
      {
        title: "European Green Deal",
        url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/european-green-deal_en",
      },
    ],
  },
  "96479af8-58f6-4c3b-8b1d-ef915dce42f6": {
    explanation:
      "FCAPS de ISO incluye Fault, Configuration, Accounting, Performance y Security; no “Improvement Management”.",
    whyCorrect: "D no es un área FCAPS.",
    whyOthers: "A–C sí forman parte del modelo clásico.",
    sources: [
      {
        title: "FCAPS",
        url: "https://en.wikipedia.org/wiki/FCAPS",
      },
    ],
  },
  "fcbb0c1d-d77a-4624-99b2-20418a2eb192": {
    explanation:
      "Las fuentes del derecho administrativo se clasifican de varias formas: directas/indirectas, escritas/no escritas, primarias/subsidiarias.",
    whyCorrect: "D: todas las anteriores.",
    whyOthers: "A–C son clasificaciones válidas por separado.",
    sources: [
      {
        title: "Derecho administrativo",
        url: "https://www.boe.es/",
      },
    ],
  },
  "7c367277-b26a-4de1-8f59-3ccbb4d31c7f": {
    explanation:
      "JavaScript no usa el lenguaje Java (solo el nombre histórico); JavaBeans, Servlets y JSP sí son Java.",
    whyCorrect: "A NO usa Java.",
    whyOthers: "B–D son tecnologías Java.",
    sources: [
      {
        title: "JavaScript",
        url: "https://en.wikipedia.org/wiki/JavaScript",
      },
    ],
  },
  "762b6363-87fb-4610-83cb-6360c78eaa1a": {
    explanation:
      "XSLT usa expresiones XPath para seleccionar nodos en XML.",
    whyCorrect: "B es correcta.",
    whyOthers: "SAX/DOM son APIs de parsing; JSAX no es el mecanismo XPath.",
    sources: [
      {
        title: "XSLT",
        url: "https://en.wikipedia.org/wiki/XSLT",
      },
    ],
  },
  "4d34f5dc-54ad-43f0-a8db-727e2bd818d4": {
    explanation:
      "Data Explorer, Steward e Hygienist son roles asociados al ecosistema Big Data en el temario.",
    whyCorrect: "D: todas son ciertas.",
    whyOthers: "A–C son roles citados por separado.",
    sources: [
      {
        title: "Big data",
        url: "https://en.wikipedia.org/wiki/Big_data",
      },
    ],
  },
  "ca307d77-27da-4ef2-8d29-3f79199550d3": {
    explanation: "UML no incluye un “diagrama de elementos”.",
    whyCorrect: "D no se usa en UML.",
    whyOthers: "Secuencia, comunicación y estados sí existen.",
    sources: [
      {
        title: "Unified Modeling Language",
        url: "https://en.wikipedia.org/wiki/Unified_Modeling_Language",
      },
    ],
  },
  "86a2d00a-04c3-47f9-bce9-796dd68e1f9f": {
    explanation:
      "Las técnicas PET de privacidad incluyen privacidad diferencial, cifrado homomórfico y anonimización.",
    whyCorrect: "D: todas son correctas.",
    whyOthers: "A–C son técnicas PET válidas.",
    sources: [
      {
        title: "Privacy-enhancing technologies",
        url: "https://en.wikipedia.org/wiki/Privacy-enhancing_technologies",
      },
    ],
  },
  "d5fbc22d-c251-4f13-ab4e-3359b87b9dd5": {
    explanation:
      "En óptica, la modulación directa es un método clásico de modulación óptica.",
    whyCorrect: "A es el método citado.",
    whyOthers: "Las demás no son la respuesta del ítem.",
    sources: [
      {
        title: "Optical modulation",
        url: "https://en.wikipedia.org/wiki/Optical_modulation_amplitude",
      },
    ],
  },
  "95a86ae5-909d-4e0b-a0e6-b7fb13d389ee": {
    explanation:
      "El PGGC contempla siete tipos de riesgos potenciales de proyecto.",
    whyCorrect: "B indica siete.",
    whyOthers: "Cinco, tres o seis no coinciden con ese cómputo del temario.",
    sources: [
      {
        title: "PGGC / calidad AGE",
        url: "https://administracionelectronica.gob.es/",
      },
    ],
  },
  "da7db36f-7590-4dff-8b6d-947c2f05e52d": {
    explanation:
      "Los balanceadores se agrupan habitualmente en capa 4 (transporte) y capa 7 (aplicación).",
    whyCorrect: "B es la clasificación correcta.",
    whyOthers: "Otras combinaciones de capas no son la agrupación habitual del ítem.",
    sources: [
      {
        title: "Load balancing",
        url: "https://en.wikipedia.org/wiki/Load_balancing_(computing)",
      },
    ],
  },
  "36290444-fad0-4a56-9bf7-cc8027078f4a": {
    explanation:
      "En la Guía de Participantes de MÉTRICA v3 no figura el perfil “Técnico” como tal.",
    whyCorrect: "C no está incluido.",
    whyOthers: "Directivo, Consultor y Programador sí aparecen.",
    sources: [
      {
        title: "MÉTRICA v3",
        url: "https://administracionelectronica.gob.es/pae_Home/pae_Documentacion/pae_Metodolog/pae_Metrica_v3.html",
      },
    ],
  },
  "2b874cc1-6f7a-4a74-a9da-7957f254a2eb": {
    explanation:
      "Las herramientas CASE buscan principalmente aumentar la productividad del desarrollo.",
    whyCorrect: "A es el objeto principal.",
    whyOthers: "Riesgos, calidad o reutilización pueden beneficiarse, pero no son el objeto citado.",
    sources: [
      {
        title: "Computer-aided software engineering",
        url: "https://en.wikipedia.org/wiki/Computer-aided_software_engineering",
      },
    ],
  },
  "507aae5e-eec9-467d-b76c-c7cc998b5318": {
    explanation:
      "Abstracción, encapsulación y modularidad son propiedades OO; “independencia” no lo es como propiedad canónica.",
    whyCorrect: "C no es propiedad OO del listado.",
    whyOthers: "A, B y D sí lo son.",
    sources: [
      {
        title: "Object-oriented programming",
        url: "https://en.wikipedia.org/wiki/Object-oriented_programming",
      },
    ],
  },
  "1cfc729c-df8b-485c-80f9-19f032d26986": {
    explanation: "Horizonte Europa se estructura en 5 misiones.",
    whyCorrect: "A indica 5 misiones.",
    whyOthers: "3 no es el total del programa.",
    sources: [
      {
        title: "Horizonte Europa — misiones",
        url: "https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe/eu-missions-horizon-europe_en",
      },
    ],
  },
};

const pathIn = "data/explanations-batch-003.json";
const rows = JSON.parse(await fs.readFile(pathIn, "utf8"));
let n = 0;
for (const row of rows) {
  if (upgrades[row.questionId]) {
    Object.assign(row, upgrades[row.questionId], { status: "draft" });
    n += 1;
  }
}
await fs.writeFile(pathIn, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Upgraded ${n}/${rows.length}`);
