# Resultados por tema oficial

La vista usa el perfil activo de la app. No hay autenticación ni protección nueva:
los resultados NO son privados. No se cambia RLS, esquema ni historial.

Solo se atribuyen resultados a preguntas de confianza alta del mapa provisional,
igual que en el entrenamiento. Media/baja y sin asignación se cuentan aparte.
No se presenta el resultado como dominio del tema ni como mapeo validado.

- Intentos: todas las respuestas registradas, incluidos blancos y repeticiones.
- Precisión: aciertos / (aciertos + fallos); sin blancos. Sin respuestas, no hay %.
- Preguntas distintas: cada texto+opciones cuenta una vez, aunque proceda de
  varias copias importadas. El denominador es el conjunto distinto de confianza
  alta del mapa, no el número de intentos ni una lista de contenidos aprendidos.
- Las pruebas técnicas históricas no etiquetadas pueden seguir incluidas.
  No se publica una lista privada de exclusiones ni se borran registros.

La tabla de alias contiene únicamente IDs de preguntas del banco público. Se
validó contra los representantes del mapa: 77.961 filas, 16.348 representantes,
exactamente uno por grupo. Normalización compatible con el mapa: minúsculas,
descomposición Unicode sin diacríticos, trim y textos de opciones ordenados.

La lectura es servidor, por user_id del perfil activo, paginada por ID. No hay
fallback a un perfil por defecto. Un fallo de lectura se muestra como error,
no como progreso cero. Al cambiar de perfil se ocultan inmediatamente los datos
anteriores y se descartan respuestas de solicitudes antiguas.
