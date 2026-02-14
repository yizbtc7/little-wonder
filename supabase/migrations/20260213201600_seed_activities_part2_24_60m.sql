-- ============================================================
-- LITTLE WONDER: Complete Activities Library
-- PART 2: 2-5 years (24-60 months)
-- ============================================================

INSERT INTO activities (title, subtitle, emoji, schema_target, domain, duration_minutes, materials, steps, science_note, age_min_months, age_max_months) VALUES

-- ============================================================
-- 24-30 MONTHS: The "Why?" Begins
-- Focus: language explosion, pretend play, fierce autonomy
-- ============================================================

('La fábrica de pociones', 'Química de cocina', '🧪', 'transforming', 'Science', 20,
ARRAY['Bicarbonato', 'Vinagre', 'Colorante alimentario', 'Recipientes', 'Cuchara', 'Bandeja'],
'Pon bicarbonato en varios recipientes. Agrega gotas de colorante a cada uno (colores distintos).

Dale un gotero o cuchara con vinagre: "¿Qué pasa si le echamos esto?" ¡Reacción efervescente!

Deja que repita. ¿Más vinagre = más burbujas? ¿Qué pasa si mezcla colores? Cada recipiente es un experimento nuevo.

Pregunta: "¿Qué crees que va a pasar?" antes de cada intento. Estás sembrando el hábito de hacer predicciones.',
'La reacción bicarbonato-vinagre es la primera reacción química que tu hijo puede provocar intencionalmente. Lo transformador aquí no es la reacción en sí — es el poder de CAUSAR un cambio dramático e irreversible. Irreversibilidad es un concepto central de esta edad (Piaget: preoperacional).',
24, 30),

('La casa de los animales', 'Construir mundos cerrados', '🐑', 'enclosure', 'Cognitive', 20,
ARRAY['Bloques, palos, plastilina', 'Animales de juguete'],
'Pon animales de juguete en la mesa: "Los animales necesitan una casa. ¿Les hacemos una?"

Deja que construya. ¿Hace muros? ¿Deja una puerta? ¿Separa animales por tipo?

Extiende: "¿Los caballos y las vacas viven juntos o separados?" Cada decisión de diseño es clasificación + spatial reasoning.

Si derriba todo y empieza de nuevo: perfecto. La iteración es parte del proceso.',
'El schema de enclosure se vuelve más intencional a esta edad: no solo mete cosas adentro de otras sino que DISEÑA espacios cerrados con propósito. Cada corral, cerca, o casa es un ejercicio de planificación espacial, categorización (quién va adentro), y diseño.',
24, 30),

('Cartas para todos', 'Deliver con propósito', '✉️', 'transporting', 'Language', 15,
ARRAY['Papel', 'Crayones', 'Sobres o bolsas', 'Una bolsa de "cartero"'],
'Haz "cartas" juntos: dibujos, garabatos, stickers — todo vale. Pon cada carta en un sobre.

"¿A quién le mandamos esta? ¿A abuela? ¿Al perro?" Escribe el nombre juntos.

Tu hijo es el cartero: entrega cada carta a su destinatario en la casa. Si son para personas lejanas, "pongan la carta en el buzón."',
'Este juego fusiona transporting (llevar cartas), lenguaje (nombrar destinatarios, "escribir"), juego simbólico (la carta "dice" algo), y motricidad fina. A los 24-30 meses, el juego simbólico se vuelve cada vez más elaborado — una hoja con garabatos ES una carta.',
24, 30),

('Circuito de movimiento', 'Trayectoria con todo el cuerpo', '🏃', 'trajectory', 'Motor', 20,
ARRAY['Almohadas, sillas, cinta en el piso, un túnel (o manta sobre sillas)'],
'Arma un circuito en la sala: cinta en el piso para seguir, almohadas para saltar, silla para pasar por debajo, túnel para gatear.

"¿Puedes hacer todo el circuito?" Modela una vez. Luego deja que lo haga solo. ¿Cambia el orden? ¿Inventa nuevos pasos?

Hazlo al revés: "¿Puedes hacerlo empezando por el final?" Eso requiere flexibilidad cognitiva.',
'Los circuitos de movimiento son gold standard para desarrollo de función ejecutiva: requieren secuenciación (hacer pasos en orden), memoria de trabajo (recordar qué sigue), e inhibición (esperar, no saltarse pasos). Todo envuelto en trayectoria corporal.',
24, 30),

('Los colores se mezclan', 'Arte y ciencia en uno', '🎨', 'transforming', 'Creative', 15,
ARRAY['Pintura de 3 colores primarios', 'Papel', 'Platos para mezclar'],
'Pon rojo, azul y amarillo en platos separados. Dale un pincel: "¿Qué pasa si mezclamos rojo y amarillo?"

¡Naranja! "¿Y azul con amarillo?" ¡Verde! Deja que descubra cada combinación.

¿Qué pasa si mezcla los tres? Marrón/gris. "¡Cambiaron todos!" Irreversibilidad en acción.

Después: pintura libre. ¿Usa los colores nuevos que "inventó"?',
'La mezcla de colores es el experimento de transformación más visual que existe. Tu hijo ve en tiempo real cómo dos cosas se combinan para crear algo nuevo e irreversible. Esto es pensamiento pre-químico y también una lección sobre irreversibilidad (Piaget): no puedes "des-mezclar" los colores.',
24, 30),

-- ============================================================
-- 30-36 MONTHS: The Questioner
-- Focus: "why?", categorization, negotiation, elaborate pretend
-- ============================================================

('El supermercado', 'Juego simbólico con clasificación', '🛒', 'positioning', 'Language', 25,
ARRAY['Objetos de la cocina/casa', 'Bolsas', 'Papelitos como "dinero"', 'Mesa como mostrador'],
'Arma una "tienda" clasificando objetos: frutas aquí, latas allá, juguetes en otro estante.

Tu hijo puede ser vendedor o comprador. "¿Cuánto cuestan las manzanas?" Introduce números.

La clasificación (¿dónde va cada cosa?) es el corazón cognitivo. La transacción social es la práctica de lenguaje. Y el transporte de las compras es motor.',
'A los 30-36 meses, el juego de roles se vuelve más elaborado y sostenido. Clasificar productos es positioning schema. Contar "dinero" es pre-matemática. Negociar precios es pragmática del lenguaje. Todo en un solo juego.',
30, 36),

('Mapa del tesoro', 'Posición espacial con propósito', '🗺️', 'positioning', 'Cognitive', 20,
ARRAY['Papel grande', 'Crayones', 'Un "tesoro" (juguete o snack)'],
'Esconde un tesoro en la casa. Dibuja un mapa sencillo: rectángulo = sala, círculo = mesa, X = tesoro.

Dale el mapa: "¿Puedes encontrar el tesoro?" Ayuda con pistas si necesita: "Mira, estamos aquí. El tesoro está cerca de..."

Luego: ¿puede HACER un mapa para que TÚ encuentres algo? Eso es un salto enorme: representar el espacio en 2D.',
'Los mapas son representaciones simbólicas del espacio — uno de los logros cognitivos más complejos de la etapa preoperacional. Leer un mapa requiere: correspondencia símbolo-objeto, orientación espacial, y traducción de 2D a 3D. Hacerlo requiere aún más: observar el espacio y abstraerlo.',
30, 36),

('Fábrica de plastilina', 'Transformación con las manos', '🏺', 'transforming', 'Fine Motor', 20,
ARRAY['Plastilina casera o comprada', 'Palitos, tapas, rodillo, moldes improvisados'],
'Pon plastilina y herramientas. No digas qué hacer. Observa.

¿Aplasta? ¿Enrolla (rotación)? ¿Corta y junta (connecting)? ¿Hace bolitas y las alinea (positioning)?

Lo que hace revela su schema dominante. Extiende: "¿Puedes hacer una serpiente? ¿Una pizza? ¿Una casa?"

Introduce herramientas: un rodillo, un tenedor para textura, un cuchillo de plástico. Cada herramienta es un problema nuevo.',
'La plastilina es el material perfecto porque se adapta a CUALQUIER schema: puedes lanzarla (trajectory), enrollarla (rotation), meterla en contenedores (enclosure), aplanarla y cubrir cosas (enveloping), moverla (transporting), unir piezas (connecting), mezclar colores (transforming), y alinear bolitas (positioning).',
30, 36),

('Doctor de juguetes', 'Juego de roles con cuidado', '🩺', 'connecting', 'Social-Emotional', 20,
ARRAY['Muñecos o peluches', 'Tiras de tela como "vendas"', 'Cuchara como "estetoscopio"'],
'Un peluche "se lastimó." "¿Puedes ayudarlo?"

Deja que examine, vende, cuide. "¿Qué le duele? ¿Cómo lo curamos?" Cada decisión médica es resolución de problemas.

Lo poderoso es el connecting emocional: cuidar a otro ser, reconocer dolor, ofrecer consuelo. Es empatía en práctica.',
'El juego de doctor es uno de los más ricos en desarrollo socioemocional. Combina: connecting schema (vendas, arreglar), teoría de la mente (el peluche "siente" dolor), vocabulario emocional, y empatía activa. A esta edad, la empatía pasa de sentir con el otro a ACTUAR para ayudar.',
30, 36),

('Explora y clasifica naturaleza', 'Coleccionar y ordenar', '🍂', 'positioning', 'Science', 25,
ARRAY['Bolsa para colectar', 'Hojas, piedras, palos, flores (lo que encuentren)'],
'Salgan a caminar. Misión: colectar tesoros naturales. "¿Qué cosas interesantes encontramos?"

De vuelta en casa: "¿Cómo los organizamos?" Deja que decida las categorías. ¿Por color? ¿Tamaño? ¿Tipo?

Haz un "museo" en una bandeja. Cada grupo necesita un "letrero" (que tú escribes y él dicta).

La próxima vez: ¿usa las mismas categorías o inventa nuevas?',
'Clasificar es positioning schema elevado: organizar el mundo en categorías. Lo fascinante es que a esta edad las categorías son personales y a veces sorprendentes. Un niño puede agrupar "cosas que parecen caras" — una categoría que un adulto no elegiría. Eso es pensamiento original.',
30, 36),

-- ============================================================
-- 36-42 MONTHS (3-3.5 YEARS): The Imaginer
-- Focus: elaborate pretend, "why?" intensifies, social play begins
-- ============================================================

('La construcción más alta', 'Ingeniería vertical', '🏙️', 'trajectory', 'Engineering', 20,
ARRAY['Bloques de todo tipo, cajas, tupperware, libros'],
'"¿Puedes hacer la torre más alta que TÚ?" El desafío está lanzado.

Deja que construya. ¿Se cae? "¿Por qué se cayó? ¿Cómo la hacemos más fuerte?"

Introduce conceptos naturalmente: "Los bloques grandes van abajo" (base). "Si se inclina, se cae" (equilibrio).

Mide con cinta: "¡Tu torre mide 6 bloques!" ¿Puede superar su récord?',
'La construcción vertical requiere comprensión intuitiva de centro de gravedad, base de apoyo, y distribución de peso. Cada torre que se cae es una lección de ingeniería estructural. Preguntar "¿por qué se cayó?" entrena pensamiento causal — la herramienta cognitiva más poderosa.',
36, 42),

('Restaurante familiar', 'Juego de roles elaborado', '👨‍🍳', 'transforming', 'Language', 30,
ARRAY['Utensilios de cocina', 'Comida de juguete o plastilina', 'Papel como menú', 'Crayones'],
'Armen un restaurante juntos. Tu hijo elige: ¿es el chef, el mesero, o el cliente?

Hagan un menú (con dibujos). El mesero "toma la orden." El chef "cocina." El cliente "come."

Roten roles. Cada rol requiere habilidades distintas: el mesero necesita memoria, el chef necesita secuencia, el cliente necesita comunicar preferencias.',
'El juego de restaurante es extraordinariamente complejo cognitivamente: requiere representación simbólica (plastilina = comida), múltiples perspectivas (roles), secuenciación (pedir → cocinar → servir → comer), y lenguaje transaccional. Sostener este juego por 15+ minutos es función ejecutiva en acción.',
36, 42),

('Trampa para lluvia', 'Ciencia al aire libre', '🌧️', 'enclosure', 'Science', 15,
ARRAY['Recipiente abierto', 'Regla o cinta para medir'],
'En un día de lluvia, pon un recipiente afuera: "Vamos a atrapar la lluvia."

Después de un rato, revisen juntos: "¿Cuánta agua atrapamos?" Mide con una regla o marca con cinta.

Preguntas: "¿Si ponemos un recipiente más grande, atrapamos más?" "¿Y si lo ponemos debajo de un árbol?"

Repite en distintos días. ¿Siempre llueve igual? Introduce el concepto de comparar.',
'Este es un experimento real de medición. Tu hijo está aprendiendo: contención (enclosure schema), volumen, comparación, y el concepto de variable (ubicación del recipiente, tamaño, duración). También es una primera experiencia con el método científico: medir, comparar, concluir.',
36, 42),

('Sellos de naturaleza', 'Arte con patrones', '🌿', 'positioning', 'Creative', 20,
ARRAY['Hojas, flores, tapas, objetos texturados', 'Pintura', 'Papel'],
'Pon pintura en un plato. Sumerge hojas, flores, tapas en la pintura y estámpalas en papel.

¿Qué patrones crea? ¿Alterna objetos (hoja-flor-hoja-flor)? ¿Hace filas? ¿Crea una composición libre?

Desafío: "¿Puedes hacer un patrón que se repita?" AB, AB, AB. Si lo logra, prueba ABC, ABC, ABC.',
'Crear patrones con sellos es positioning schema + pensamiento algebraico pre-formal. Los patrones repetitivos (AB, AB) son literalmente la base del álgebra: reconocer y predecir secuencias. Y las estampas son trayectoria controlada (de arriba hacia abajo con precisión).',
36, 42),

('Pistas de carreras de agua', 'Ingeniería hidráulica', '💧', 'trajectory', 'Engineering', 25,
ARRAY['Tubos de cartón, botellas cortadas, canaletas', 'Cinta adhesiva', 'Agua', 'Pared o valla'],
'Armen un sistema de "tuberías" en la pared: tubos, botellas cortadas, canaletas. Pégalos con cinta.

Vierte agua arriba. ¿Llega abajo? ¿Dónde se pierde? "¿Cómo hacemos que el agua llegue hasta acá?"

Cada ajuste es un ciclo de diseño: probar → observar → modificar → probar de nuevo.

Agrega embudos, curvas, bifurcaciones. ¿Puede predecir por dónde irá el agua?',
'Sistemas de agua son trayectoria + connecting + transforming en un proyecto. Cada ajuste es un ciclo de diseño-ingeniería iterativo. Tu hijo está aprendiendo sobre gravedad, flujo, dirección, y la idea crucial de que los sistemas se pueden diseñar y mejorar.',
36, 42),

-- ============================================================
-- 42-48 MONTHS (3.5-4 YEARS): The Explainer
-- Focus: theory of mind solidifying, rule-based games, narrative
-- ============================================================

('Inventar una historia juntos', 'Narración colaborativa', '📖', 'connecting', 'Language', 20,
ARRAY['Papel', 'Crayones o marcadores'],
'"Había una vez un..." y tú dices una palabra. Tu hijo dice la siguiente. Van construyendo una historia juntos.

Después: "¿Lo dibujamos?" Cada página es una escena. Estás haciendo un libro juntos.

Desafío avanzado: "¿Y si la historia fuera al revés? ¿Y si el final fuera el principio?"',
'La narración colaborativa trabaja múltiples habilidades simultáneamente: secuenciación (principio-medio-fin), vocabulario, creatividad, y lo más importante — connecting ideas. Cada "y después..." es una conexión causal. Invertir la historia requiere flexibilidad cognitiva avanzada.',
42, 48),

('Jardín en botella', 'Ciencia viva', '🌱', 'transforming', 'Science', 20,
ARRAY['Botella de plástico cortada o vaso transparente', 'Tierra', 'Semillas (lentejas, frijoles)', 'Agua'],
'Llenen la botella con tierra. Planten semillas junto a la pared transparente (para ver las raíces).

Rieguen juntos cada día. "¿Qué cambió hoy?" Lleva un registro dibujado: día 1, día 3, día 7.

Preguntas: "¿Qué necesita la planta?" "¿Qué pasa si no le ponemos agua?" (Hagan el experimento con una segunda semilla.)',
'Las plantas son el experimento de transformación más lento y poderoso. Tu hijo experimenta la idea de que los cambios ocurren gradualmente y son acumulativos — un concepto temporal que a los 3-4 años apenas emerge. El registro dibujado es documentación científica auténtica.',
42, 48),

('Construcción de catapulta', 'Ingeniería de lanzamiento', '🏹', 'trajectory', 'Engineering', 25,
ARRAY['Palitos de helado o regla', 'Goma elástica', 'Tapa de botella', 'Pompones o bolitas livianas'],
'Arma una catapulta simple: palitos de helado unidos con goma, con una tapa como "canasta" en un extremo.

Pon un pompón. Presiona. ¡LANZA! "¿Hasta dónde llegó?"

Varía: ¿más palitos (más alto) = más lejos? ¿Pompón vs. bolita de papel? ¿Presionar más fuerte?

Pon un objetivo a distintas distancias. ¿Puede calibrar la fuerza para atinarle?',
'La catapulta es trajectory schema elevado a ingeniería. Tu hijo controla variables reales: fuerza, ángulo, peso del proyectil, elasticidad. Cada lanzamiento es un dato. Cambiar una variable y observar el resultado es literalmente el método científico experimental.',
42, 48),

('Museo personal', 'Curación y exhibición', '🏛️', 'positioning', 'Cognitive', 25,
ARRAY['Colecciones del niño (piedras, conchas, juguetes)', 'Tarjetas para letreros', 'Mesa o estante'],
'"Vamos a hacer un museo con tus cosas favoritas." Tu hijo decide: ¿qué exhibir? ¿Cómo organizarlo?

Necesita letreros: escribe lo que te dicte. "Piedra del parque — la encontré el martes."

Invita a la familia: tu hijo es el guía del museo. Explica cada pieza. Eso es comunicación + orgullo + narrativa.',
'Curar un museo requiere: selección (¿qué es importante?), clasificación (positioning), narrativa (la historia de cada pieza), y presentación pública (comunicación). Es un proyecto que integra múltiples dominios. El acto de EXPLICAR consolidoa su comprensión.',
42, 48),

('Cocinar de verdad', 'Seguir pasos y transformar', '🥞', 'transforming', 'Life Skills', 30,
ARRAY['Ingredientes de una receta simple (pancakes, galletas)', 'Utensilios de cocina'],
'Elige una receta simple (pancakes, galletas). Léanla juntos. Tu hijo hace todo lo que sea seguro: medir, verter, mezclar, amasar.

Nombra cada transformación: "La harina es polvo. Cuando le ponemos leche... ¡se vuelve masa! Y cuando la ponemos en el sartén... ¡se vuelve pancake!"

Deja que mida: "Necesitamos UNA taza de harina." Pre-matemáticas reales.',
'Cocinar es el rey de las actividades de transformación: ingredientes separados se combinan y cambian irreversiblemente por calor. Tu hijo presencia estados de materia, medición, secuenciación (seguir pasos en orden), y el concepto de que los procesos tienen resultados predecibles.',
42, 48),

-- ============================================================
-- 48-60 MONTHS (4-5 YEARS): The Designer
-- Focus: planning, complex construction, negotiation, pre-literacy
-- ============================================================

('Diseña y construye una ciudad', 'Urbanismo infantil', '🏘️', 'enclosure', 'Engineering', 30,
ARRAY['Bloques, cajas, cartón, papel, crayones', 'Carritos y muñecos'],
'"¿Cómo sería tu ciudad ideal?" Deja que planifique antes de construir.

¿Qué edificios necesita? ¿Calles? ¿Parques? Cada decisión es diseño urbano.

Construyan juntos. Introduce problemas: "¡Hay mucho tráfico! ¿Qué hacemos?" "¿Dónde va el hospital?"

Evolución: dibuja un plano ANTES de construir. Eso es planificación abstracta.',
'Diseñar una ciudad integra enclosure (edificios como espacios cerrados), connecting (calles unen edificios), positioning (dónde va cada cosa), y trajectory (rutas de vehículos). La planificación previa — dibujar antes de construir — es función ejecutiva avanzada: mantener un plan mental mientras se ejecuta.',
48, 60),

('Experimento de flota o hunde', 'El método científico real', '🚢', 'transforming', 'Science', 20,
ARRAY['Balde o tina con agua', '10+ objetos variados', 'Papel para anotar predicciones'],
'Pon un balde con agua. Reúne objetos: cuchara, hoja, piedra, corcho, moneda, plástico, papel.

ANTES de meter cada uno: "¿Tú crees que flota o se hunde?" Anota su predicción (✓ o ✗).

Prueben cada uno. "¿Acertaste? ¿Por qué crees que la piedra se hundió y la hoja no?"

Desafío: "¿Puedes hacer que algo que flota se hunda? ¿Y al revés?" (papel vs. papel hecho bolita, plastilina plana vs. plastilina en bola)',
'Este es método científico completo: hipótesis (predicción), experimento (probar), observación (registrar resultado), y teorización ("¿por qué?"). A los 4-5 años, tu hijo puede hacer predicciones razonadas basadas en experiencia previa — esto es pensamiento científico genuino.',
48, 60),

('Máquina de Rube Goldberg', 'Ingeniería en cadena', '⚙️', 'connecting', 'Engineering', 30,
ARRAY['Dominós o bloques', 'Pelotas', 'Tubos de cartón', 'Rampas (libros)', 'Objetos variados'],
'"Vamos a hacer una máquina donde una cosa mueve la otra." Empiecen simple: una pelota baja por una rampa y tumba un dominó.

Cada paso debe conectarse con el siguiente. ¿La pelota llega con suficiente fuerza? ¿Los dominós están suficientemente cerca?

Aggrega pasos: rampa → pelota → dominós → carro → tumba un vaso. Cada falla es un problema de ingeniería para resolver.',
'Las máquinas de Rube Goldberg son la expresión máxima del connecting schema: cada pieza debe conectar con la siguiente en una cadena causal. Requiere: planificación secuencial, comprensión de transferencia de energía, y tolerancia a la frustración (¡nunca funciona al primer intento!).',
48, 60),

('Diario de explorador', 'Documentar descubrimientos', '📓', 'positioning', 'Language', 20,
ARRAY['Cuaderno o hojas grapadas', 'Crayones, lápices', 'Lupa (opcional)'],
'Salgan a explorar (jardín, parque, calle). Tu hijo es un "explorador científico."

En cada descubrimiento, para y documenta: dibuja lo que ve, dicta una descripción (tú escribes).

"I notice... I wonder... It reminds me of..." (INIWIRMO) — estructura de journaling científico.

Al final: revisen juntos el diario. "¿Qué fue lo más interesante?" Guardarlo — es documentación real.',
'El diario de explorador es pedagogical documentation (Reggio Emilia) en su forma más pura: observar, registrar, reflexionar. El acto de dibujar lo que se observa requiere atención sostenida y traducción de 3D a 2D. Dictar la descripción es narrativa + vocabulario científico.',
48, 60),

('Teatro de sombras', 'Narrativa con positioning', '🎭', 'positioning', 'Creative', 25,
ARRAY['Linterna o lámpara', 'Sábana blanca', 'Recortes de cartón (personajes)', 'Palitos'],
'Cuelga una sábana. Pon una linterna detrás. Hagan figuras con cartón en palitos.

Inventen una historia. Los personajes aparecen, se mueven, interactúan detrás de la sábana.

Tu hijo descubre: cerca de la luz = sombra grande, lejos = pequeña. ¿Puede hacer que un personaje "crezca" y "encoja"?

El público (otro familiar) solo ve sombras. Tu hijo controla qué ven: eso es poder narrativo.',
'El teatro de sombras combina: positioning (dónde poner cada personaje), trajectory (movimiento de los personajes), y narrativa (contar una historia). El descubrimiento de que la distancia a la luz cambia el tamaño es un experimento óptico que tu hijo puede controlar — ciencia y arte en uno.',
48, 60),

('Recorrido de obstáculos cronometrado', 'Velocidad y planificación', '⏱️', 'trajectory', 'Motor', 25,
ARRAY['Cinta en el piso', 'Almohadas', 'Sillas', 'Aros o cuerdas', 'Cronómetro del celular'],
'Diseñen juntos un circuito: línea de equilibrio (cinta), saltar almohadas, pasar bajo silla, lanzar pelota a un balde, correr al final.

Primera vez: solo completar. Segunda: con cronómetro. "¿Puedes hacerlo más rápido?"

¿Puede diseñar un circuito para TI? Invertir roles (él diseña, tú ejecutas) es planificación avanzada.',
'Los circuitos cronometrados agregan una dimensión a la trayectoria corporal: eficiencia. Tu hijo no solo completa la secuencia sino que optimiza. Esto entrena función ejecutiva: planificación, secuenciación, autorregulación (no apurarse tanto que se equivoque), y metacognición (reflexionar sobre la propia estrategia).',
48, 60);
