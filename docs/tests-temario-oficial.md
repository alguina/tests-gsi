# Tests por tema oficial

Cada tema del mapa ofrece un test de hasta 10 preguntas distintas con confianza
alta. No usa el campo `topic` original ni las copias importadas de cada examen.
La asignación sigue siendo provisional: confianza alta no equivale a revisión
humana. Las bandas media, baja y sin_asignar quedan fuera de estos tests.

El servidor valida tema y tamaño, baraja el conjunto, comprueba que las preguntas
sigan activas y tengan opciones, y crea una sesión con el perfil activo. Si hay
menos preguntas disponibles, usa las disponibles; si no hay ninguna, no crea
una sesión. Las consultas se hacen por lotes pequeños para evitar límites REST.

Se reutiliza el flujo de tests existente: aviso de sesión en curso, guardado,
reanudación, envío y resultados. La configuración oficial se guarda en el
borrador para mantener el aviso al reanudar. No hay migración, cambios de RLS,
nuevas vistas de rendimiento personal ni material de estudio redactado.

Pruebas: cobertura del conjunto por los 57 temas; exclusión de otras bandas y
copias; límites, validación y creación de sesión con perfil/configuración;
rechazo de conjuntos vacíos; pruebas existentes y compilación de producción.
