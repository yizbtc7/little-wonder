-- ============================================================
-- LITTLE WONDER: Complete Activities Library
-- PART 3: 5-8 years (60-96 months)
-- ============================================================

INSERT INTO activities (title, subtitle, emoji, schema_target, domain, duration_minutes, materials, steps, science_note, age_min_months, age_max_months) VALUES

-- ============================================================
-- 60-72 MONTHS (5-6 YEARS): The Investigator
-- Focus: rules, fairness, complex projects, early literacy/math
-- ============================================================

('Diseña tu propio juego de mesa', 'Reglas + creatividad', '🎲', 'connecting', 'Cognitive', 40,
ARRAY['Cartón grande', 'Marcadores', 'Dado', 'Fichas (monedas, botones)', 'Tarjetas de papel'],
'Pregunta: "Si pudieras inventar un juego de mesa, ¿de qué sería?"

Guía el proceso: necesita un tablero (camino con casillas), reglas (¿qué pasa si caes aquí?), y un objetivo (¿cómo se gana?).

Deja que dibuje el tablero. Ayuda a escribir reglas simples. Después: ¡juéguenlo! ¿Funciona? ¿Qué cambiarías?

El primer juego será imperfecto. La iteración ES la actividad.',
'Diseñar un juego de mesa requiere: pensamiento sistémico (todas las piezas deben funcionar juntas), equidad (reglas justas), secuenciación, matemáticas (contar casillas, usar dados), y teoría de la mente (¿es divertido para OTROS?). Es connecting schema llevado al diseño de sistemas.',
60, 72),

('Estación meteorológica casera', 'Ciencia de datos real', '🌤️', 'positioning', 'Science', 30,
ARRAY['Termómetro (opcional)', 'Pluviómetro casero (botella cortada)', 'Veleta (palito + cartón)', 'Cuaderno de registro'],
'Armen instrumentos meteorológicos simples: pluviómetro (botella cortada con escala), veleta (cartón en un palito), y usen termómetro si tienen.

Cada día a la misma hora: midan, registren, dibujen un símbolo (sol, nube, lluvia).

Después de una semana: "¿Qué día llovió más? ¿Cuál fue el más caliente? ¿Ves algún patrón?"

Después de un mes: hagan un gráfico. Barras o puntos. Tu hijo está haciendo ciencia de datos.',
'La estación meteorológica enseña el corazón de la ciencia: observación sistemática, registro de datos, y búsqueda de patrones. El positioning schema se manifiesta en la organización de datos en tablas y gráficos. La persistencia de medir cada día entrena disciplina científica.',
60, 72),

('Puente que aguanta', 'Ingeniería estructural real', '🌁', 'connecting', 'Engineering', 30,
ARRAY['Palitos de helado', 'Pegamento o cinta', 'Vasos como pilares', 'Monedas para probar peso'],
'Desafío: construye un puente entre dos vasos que aguante el mayor peso posible.

Dale los materiales. No muestres cómo. "¿Cómo lo harías?"

Prueba: pon monedas una a una. ¿Cuántas aguanta antes de colapsar? "¿Cómo lo harías más fuerte?"

Iterar: construye una segunda versión. ¿Mejora? Comparar números (monedas) es medición real.',
'La ingeniería de puentes requiere comprensión intuitiva de: distribución de carga, triangulación, tensión vs. compresión. No necesita saber los nombres — los descubre experimentando. Contar monedas introduce medición cuantitativa de la fuerza.',
60, 72),

('Código secreto', 'Criptografía básica', '🔐', 'transforming', 'Language', 20,
ARRAY['Papel', 'Lápiz'],
'Inventen un código secreto juntos: A=1, B=2... o A=★, B=♦...

Escríbanse mensajes en código. "¿Puedes descifrar esto?"

Nivel avanzado: inventa un código donde cada letra se reemplaza por otra letra (cifrado César). "Si A=C, B=D... ¿qué dice este mensaje?"

Deja que invente su PROPIO sistema de código. Eso es diseño de sistemas simbólicos.',
'La criptografía es transformación simbólica: un símbolo se convierte en otro según una regla. Tu hijo está practicando pensamiento algebraico (relaciones entre conjuntos), correspondencia uno-a-uno, y el concepto fundamental de que los símbolos son convenciones — la misma idea que hace funcionar la lectura y la escritura.',
60, 72),

('La investigación grande', 'Proyecto científico completo', '🔬', 'transforming', 'Science', 45,
ARRAY['Depende del tema elegido', 'Cuaderno', 'Materiales de experimentación'],
'Pregunta: "¿Qué te gustaría investigar? ¿Qué pregunta tienes sobre cómo funciona algo?"

Ayuda a convertir la curiosidad en pregunta investigable: no "¿por qué llueve?" sino "¿qué plantas crecen más rápido: las que regamos con agua tibia o con agua fría?"

Diseñen el experimento juntos. Tu hijo hace el trabajo. Registra resultados. Dibuja conclusiones.

Presenten los resultados a la familia. Tu hijo es el científico.',
'Un proyecto de investigación completo es la culminación de todo: pregunta (curiosidad), diseño (planificación), ejecución (persistencia), registro (documentación), y comunicación (presentación). Tu hijo experimenta el ciclo completo del descubrimiento científico.',
60, 72),

-- ============================================================
-- 72-84 MONTHS (6-7 YEARS): The Builder
-- Focus: sustained projects, reading/writing, social dynamics
-- ============================================================

('Periódico familiar', 'Escritura con propósito', '📰', 'positioning', 'Language', 40,
ARRAY['Papel', 'Marcadores, crayones', 'Opcional: computadora para dictar'],
'"Vamos a hacer un periódico de la familia." Secciones: noticias ("El gato se subió al techo"), deportes ("Leo aprendió a andar en bici"), opinión, clima, juegos.

Tu hijo decide qué incluir. Escribe (o dicta) los artículos. Dibuja las fotos. Decide la disposición.

Impriman copias (o fotocopien). Distribúyanlo a la familia. La próxima semana: ¡nueva edición!',
'El periódico integra: escritura con audiencia real, clasificación por secciones (positioning), narrativa, diseño visual (layout), y el concepto de periodicidad. Escribir para lectores reales transforma la escritura de ejercicio a comunicación con propósito.',
72, 84),

('Máquina simple real', 'Palancas, poleas, planos inclinados', '⚙️', 'connecting', 'Engineering', 35,
ARRAY['Palo largo o regla', 'Un punto de apoyo (bloque, lata)', 'Cuerda', 'Carrete o polea casera', 'Objetos de distinto peso'],
'Construyan una palanca: palo sobre un punto de apoyo. Pon un objeto en un extremo. "¿Puedes levantarlo empujando el otro lado?"

¿Dónde poner el punto de apoyo para que sea más fácil? ¿Más cerca del objeto o más lejos? Experimenta.

Luego: polea simple (cuerda sobre un palo alto). ¿Es más fácil levantar tirando hacia abajo que levantando directo?

Nombra: "¡Inventaste una palanca! Los egipcios usaban esto para construir pirámides."',
'Las máquinas simples (palanca, polea, plano inclinado) son la base de TODA la ingeniería mecánica. A los 6-7 años, tu hijo puede comprender intuitivamente ventaja mecánica: "mover el punto de apoyo cambia cuánta fuerza necesito." Esto es física aplicada.',
72, 84),

('Presupuesto de la fiesta', 'Matemáticas de la vida real', '🎉', 'positioning', 'Math', 30,
ARRAY['Papel', 'Lápiz', 'Monedas o billetes de juguete', 'Un "presupuesto" definido'],
'"Vamos a planear una fiesta con $100 (de juguete)." Tu hijo decide: ¿qué comprar? ¿Globos ($10), pastel ($30), jugo ($15)?

Escribe la lista. Suma. "¿Nos alcanza? Si no, ¿qué quitamos?"

Nivel avanzado: comparen precios. "Los globos cuestan $10 aquí pero $8 allá. ¿Cuánto ahorramos?"

La fiesta puede ser real o de juguete. El presupuesto es el ejercicio.',
'Presupuestar es matemáticas con consecuencias: suma, resta, comparación, y priorización. Tu hijo practica operaciones aritméticas con motivación real (la fiesta depende de sus decisiones). Introduce el concepto de trade-off: si gastamos más aquí, tenemos menos allá.',
72, 84),

('Experimento de germinación comparada', 'Variables controladas', '🌱', 'transforming', 'Science', 30,
ARRAY['6 vasos transparentes', 'Algodón', 'Semillas (frijoles)', 'Agua', 'Cuaderno de registro'],
'Planten la misma semilla en 6 vasos con condiciones distintas:
1. Agua + luz (control)
2. Agua + oscuridad
3. Sin agua + luz
4. Agua + luz + música (¡que el niño elija una variable!)
5-6: Las que tu hijo invente

Midan cada día: ¿cuál creció más? Registren con dibujos y medidas.

Después de 2 semanas: "¿Qué concluimos? ¿Qué necesitan las plantas?"',
'Este es un experimento con variables controladas — el gold standard del método científico. Tu hijo entiende: si solo cambio UNA cosa (luz vs. oscuridad) y todo lo demás es igual, la diferencia en resultado se debe a ese cambio. Este razonamiento es la base de todo pensamiento científico formal.',
72, 84),

('Diario de gratitud-curiosidad', 'Reflexión diaria', '📔', 'positioning', 'Social-Emotional', 10,
ARRAY['Cuaderno bonito', 'Lápiz'],
'Cada noche, 3 preguntas:
1. "¿Qué fue lo mejor de hoy?" (gratitud)
2. "¿Qué aprendiste hoy?" (metacognición)
3. "¿Qué quieres descubrir mañana?" (curiosidad)

Escribe las respuestas (o que las escriba si ya puede). No corrijas ortografía — el contenido importa más.

Después de un mes: lean juntos. "¡Mira todo lo que descubriste!"',
'El diario combina tres prácticas respaldadas por investigación: gratitud (bienestar emocional), metacognición (reflexionar sobre el aprendizaje — la habilidad que más predice éxito académico), y orientación a futuro (establecer intenciones). 5 minutos diarios que construyen hábitos mentales para toda la vida.',
72, 84),

-- ============================================================
-- 84-96 MONTHS (7-8 YEARS): The Strategist
-- Focus: strategy, long-term projects, peer collaboration, abstract thinking
-- ============================================================

('Negocio de limonada (plan completo)', 'Emprendimiento real', '🍋', 'connecting', 'Math', 45,
ARRAY['Limones, azúcar, agua, hielo', 'Vasos', 'Cartulina para letrero', 'Monedas reales o de juguete'],
'Esto es un proyecto de negocios real:
1. **Costos:** ¿Cuánto gastamos en ingredientes?
2. **Precio:** ¿A cuánto vendemos cada vaso para ganar dinero?
3. **Marketing:** Diseña el letrero. ¿Qué nombre le ponemos?
4. **Operaciones:** ¿Quién hace la limonada? ¿Quién cobra? ¿Quién sirve?

Si es posible, vende de verdad. Si no, simula con la familia.

Al final: "¿Ganamos o perdimos? ¿Qué haríamos diferente?"',
'El puesto de limonada es un micro-negocio que integra: aritmética (costos, precios, ganancias), diseño (marketing), logística (operaciones), y toma de decisiones. Tu hijo experimenta el concepto de que las decisiones tienen consecuencias económicas — pensamiento sistémico aplicado.',
84, 96),

('Diseña una app (en papel)', 'Pensamiento computacional', '📱', 'positioning', 'Cognitive', 35,
ARRAY['Papel', 'Marcadores', 'Post-its'],
'"Si pudieras inventar una app, ¿qué haría?" Dibuja cada pantalla en un papel distinto.

¿Qué botones tiene? ¿Qué pasa si presionas cada uno? ¿A qué pantalla te lleva?

Conecta los papeles con flechas: pantalla 1 → botón → pantalla 2. ¡Es un diagrama de flujo!

Prueba de usuario: pide a alguien que "use" la app señalando botones. ¿Funciona como esperabas?',
'Diseñar una app en papel es pensamiento computacional sin computadora: secuencias, condicionales (si presionas X, pasa Y), y diseño de interfaz. El diagrama de flujo es el mismo que usan los programadores. Y la "prueba de usuario" introduce el concepto de diseñar para OTROS — empatía + diseño.',
84, 96),

('Documental casero', 'Investigación + narración', '🎬', 'transforming', 'Language', 45,
ARRAY['Celular o tablet para grabar', 'Cuaderno para guión'],
'Elige un tema que le fascine (insectos, cocina, el barrio, su mascota). Es el director de un documental.

Pasos:
1. **Investigar:** ¿Qué sabe? ¿Qué quiere descubrir?
2. **Guión:** ¿Qué va a decir? ¿A quién entrevista?
3. **Filmar:** Narrar y grabar.
4. **Editar:** Elegir las mejores partes.
5. **Estrenar:** Noche de cine con la familia.

No necesita ser perfecto. El proceso ES el aprendizaje.',
'Hacer un documental es el proyecto más completo de investigación: requiere dominio del tema, planificación narrativa, comunicación oral, habilidad técnica, y toma de decisiones editoriales. Tu hijo pasa de consumidor de contenido a CREADOR — un cambio de identidad poderoso.',
84, 96),

('Torneo de estrategia', 'Pensar tres movimientos adelante', '♟️', 'positioning', 'Cognitive', 30,
ARRAY['Ajedrez, damas, Conecta 4, o juego de estrategia disponible'],
'Elige un juego de estrategia apropiado. Empieza con las reglas básicas.

La clave: después de cada juego, revisen juntos. "¿Qué movimiento cambió el juego? ¿Qué harías diferente?"

Introduce el concepto: "Antes de mover, piensa: si yo hago esto, ¿qué hará el otro? Y después, ¿qué hago yo?"

Lleva un registro de resultados. ¿Mejora con práctica? Eso es metacognición visible.',
'Los juegos de estrategia trabajan las tres funciones ejecutivas: inhibición (resistir el impulso de mover rápido), memoria de trabajo (mantener el plan mientras evalúas opciones), y flexibilidad cognitiva (cambiar de estrategia cuando la actual falla). La reflexión post-juego es metacognición — pensar sobre el propio pensamiento.',
84, 96),

('Construir un refugio real', 'Ingeniería a escala humana', '⛺', 'enclosure', 'Engineering', 60,
ARRAY['Ramas, palos largos', 'Cuerda o cordel', 'Sábanas o lonas', 'Pinzas de ropa'],
'Proyecto: construir un refugio donde quepa una persona (tu hijo).

¿Dónde lo construimos? ¿Qué forma tiene? ¿Cómo se sostiene? Planifica antes de construir.

Construyan juntos. Si se cae: "¿Por qué? ¿Cómo lo hacemos más estable?" Iterar.

Cuando funcione: coman un snack adentro. Dormirse ahí es épico si se puede.

Documentar: fotos de cada paso. Al final, un "manual" de cómo lo hicieron.',
'Construir un refugio es enclosure schema a escala real. Requiere: planificación espacial (¿qué forma?), ingeniería estructural (¿cómo se sostiene?), resolución iterativa de problemas, y trabajo colaborativo. Es uno de los proyectos más ancestrales de la humanidad — cada civilización empezó construyendo refugios.',
84, 96),

('El gran mapa del barrio', 'Cartografía y observación', '🗺️', 'positioning', 'Cognitive', 45,
ARRAY['Papel grande (o varios pegados)', 'Crayones y marcadores', 'Regla', 'Brújula (opcional)'],
'Salgan a caminar por el barrio con un cuaderno. Tu hijo anota lo que ve: calles, tiendas, árboles, parques.

De vuelta: transfieran al mapa grande. ¿Dónde queda la panadería respecto a la casa? ¿El parque está al norte o al sur?

Agrega leyenda: colores para tipos de lugar (verde=parque, rojo=tienda, azul=agua).

¿Quiere agregar un lugar que NO existe pero debería? "¿Qué le falta a nuestro barrio?"',
'La cartografía requiere: observación sistemática, traducción de 3D a 2D, orientación espacial, uso de escalas y convenciones (leyenda). La pregunta "¿qué le falta al barrio?" introduce diseño cívico: pensar en el bien común y proponer soluciones.',
84, 96),

('Inventar una máquina', 'Diseño especulativo', '🤖', 'connecting', 'Engineering', 35,
ARRAY['Papel', 'Marcadores', 'Materiales reciclados para prototipo (cajas, tubos, botones)'],
'"Si pudieras inventar una máquina que resolviera un problema, ¿cuál sería?"

Dibuja el diseño con detalle: ¿qué partes tiene? ¿Cómo funciona cada una? ¿Qué entra y qué sale?

Construye un prototipo con materiales reciclados. No necesita "funcionar" — necesita comunicar la idea.

Presenta a la familia: ¿qué problema resuelve? ¿Cómo funciona? ¿Cuánto costaría?',
'El diseño especulativo ("inventar lo que no existe") es pensamiento creativo + ingenieril en su forma más pura. Tu hijo practica: identificar problemas, proponer soluciones, descomponer sistemas en partes (connecting), y comunicar ideas complejas. Esto es design thinking para niños.',
84, 96),

('Diario de lectura crítica', 'Pensar sobre lo que leo', '📚', 'transforming', 'Language', 20,
ARRAY['Un libro que esté leyendo', 'Cuaderno', 'Lápiz'],
'Después de cada capítulo o libro, 4 preguntas:
1. "¿Qué pasó?" (comprensión)
2. "¿Qué sentiste?" (conexión emocional)
3. "¿Qué harías tú en lugar del personaje?" (perspectiva)
4. "¿Qué crees que va a pasar?" (predicción)

Escribe o dibuja las respuestas. Con el tiempo, forma un archivo de todo lo leído.

Una vez al mes: "¿Cuál fue tu libro favorito? ¿Por qué?" Comparar es pensamiento crítico.',
'La lectura crítica es transformación cognitiva: el texto se transforma en comprensión personal. Las cuatro preguntas trabajan distintos niveles: literal (qué pasó), emocional (qué sentí), perspectiva (teoría de la mente), y predictivo (inferencia). Este hábito es el mayor predictor de éxito académico a largo plazo.',
84, 96);
