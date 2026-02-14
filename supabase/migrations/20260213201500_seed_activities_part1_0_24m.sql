-- ============================================================
-- LITTLE WONDER: Complete Activities Library
-- PART 1: 0-24 months
-- Organized by age band × schema
-- Language: Spanish
-- ============================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  emoji TEXT NOT NULL,
  schema_target TEXT NOT NULL,
  domain TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  materials TEXT[] NOT NULL DEFAULT '{}',
  steps TEXT NOT NULL,
  science_note TEXT NOT NULL,
  age_min_months INTEGER NOT NULL,
  age_max_months INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 0-3 MONTHS: Early Explorer
-- Focus: visual tracking, sensory, serve & return
-- ============================================================

INSERT INTO activities (title, subtitle, emoji, schema_target, domain, duration_minutes, materials, steps, science_note, age_min_months, age_max_months) VALUES

('Sigue mi cara', 'Tu rostro es su juguete favorito', '👤', 'trajectory', 'Visual', 5,
ARRAY['Solo tu cara'],
'Acuéstate frente a tu bebé a 25-30 cm. Mueve tu cara lentamente de lado a lado. Haz pausas. Sonríe. Cuando sus ojos te sigan, estás viendo trayectoria visual en acción.

Varía: izquierda, derecha, arriba. Cada dirección trabaja músculos oculares diferentes. ¿Cuánto puede seguirte antes de perder el rastro?',
'El seguimiento visual es la primera expresión del schema de trayectoria. A esta edad, los ojos son su herramienta principal. Cada seguimiento fortalece las vías neuronales que conectan visión con atención — la base de toda exploración futura.',
0, 3),

('Conversación de sonidos', 'El primer serve and return', '🗣️', 'positioning', 'Language', 5,
ARRAY['Solo tu voz'],
'Cuando tu bebé haga un sonido — un gorjeo, un "ahhh" — imítalo. Mismo tono. Luego espera. Cuenta hasta 5.

Si hace otro sonido, responde de nuevo. Estás teniendo una conversación. No importa que no sean palabras — importa el ritmo: tú hablas, yo hablo.

Varía: si dice "ahhh", responde "ahhh" y agrega "ohhh". ¿Intenta imitarte?',
'Cada intercambio construye conexiones en el área de Broca. Un estudio del MIT demostró que estos turnos conversacionales — no la cantidad de palabras — son lo que más impacta el desarrollo del lenguaje.',
0, 3),

('El pañuelo que aparece', 'Sorpresa visual', '🧣', 'enveloping', 'Sensory', 5,
ARRAY['Un pañuelo de tela ligera o muselina'],
'Sostén un pañuelo sobre su cara a 30 cm. Déjalo caer suavemente por un segundo y quítalo: "¡Hola!"

Repite. ¿Se sorprende cada vez? ¿Anticipa? ¿Mueve los brazos antes de que caiga?

Prueba con telas de distintas texturas. Siempre quita rápido — es sobre la sorpresa del aparecer/desaparecer.',
'Esto es el inicio del schema de enveloping y la base de la permanencia del objeto: las cosas existen aunque no las vea. Cada "aparición" fortalece la conexión entre memoria y percepción.',
0, 3),

('Concierto de texturas', 'Safari sensorial guiado', '🖐️', 'transforming', 'Sensory', 10,
ARRAY['3-4 telas: algodón, terciopelo, toalla, seda'],
'Roza suavemente la mejilla de tu bebé con cada tela. Nombra: "Esto es suuuuave" (despacio). "¡Esto tiene textura!" (con énfasis).

¿Cuál le gusta más? ¿Cuál lo sorprende? Prueba en manos, pies. Distintas partes del cuerpo tienen distinta sensibilidad.

Dale tiempo entre texturas — su cerebro necesita procesar.',
'La piel es el órgano sensorial más grande. Cada textura nueva crea una categoría en su cerebro: suave, rugoso, frío, cálido. Esta clasificación táctil es precursora del pensamiento categórico.',
0, 3),

('Móvil de alto contraste', 'Entrenamiento visual casero', '⬛', 'trajectory', 'Visual', 10,
ARRAY['Cartulina blanca y negra', 'Tijeras', 'Hilo', 'Una percha'],
'Recorta formas simples en blanco y negro: círculos, espirales, rayas. Cuélgalos a 30 cm sobre tu bebé.

¿Qué forma atrae más su mirada? ¿Sigue las formas cuando se mueven? Cada pocos días, cambia una forma. Lo "nuevo" captura más atención.

Las espirales y patrones de tablero son los más atractivos para recién nacidos.',
'Los recién nacidos ven mejor contrastes altos porque sus conos aún maduran. Su visión alcanza 25-30 cm. Cada vez que enfoca y sigue un objeto, fortalece las vías entre retina y corteza visual.',
0, 3),

-- ============================================================
-- 3-6 MONTHS: Sensory Discoverer
-- Focus: reaching, grasping, cause-effect emerging
-- ============================================================

('Alcanza y agarra', 'El primer "yo puedo"', '🎯', 'trajectory', 'Motor', 10,
ARRAY['Un juguete colorido o sonajero'],
'Sostén un juguete al alcance de su mano. Espera. No se lo pongas — deja que intente alcanzarlo.

Si lo toca, celebra: "¡Lo alcanzaste!" Si lo golpea y se mueve: acaba de descubrir causa y efecto.

Varía la posición: izquierda, derecha, arriba. Cada posición requiere planificación motora diferente.',
'La transición de manotear a alcanzar con intención es uno de los saltos cognitivos más grandes del primer año. Tu bebé pasa de "las cosas pasan" a "YO hago que pasen." Es el nacimiento de la agencia.',
3, 6),

('El espejo mágico', 'Descubrimiento social', '🪞', 'positioning', 'Social-Emotional', 10,
ARRAY['Un espejo irrompible'],
'Coloca un espejo frente a tu bebé. ¿Mira su reflejo? ¿Sonríe? ¿Intenta tocar al "otro bebé"?

Siéntate a su lado para que vea tu reflejo también. Haz caras: saca la lengua, abre los ojos, sonríe.

Tapa el espejo y destápalo: "¡Aquí estamos!" Permanencia del objeto + juego social.',
'A esta edad no sabe que es él en el espejo — eso no ocurre hasta los 18-24 meses. Pero el espejo muestra un rostro que responde perfectamente a cada movimiento. Es serve and return visual perfecto.',
3, 6),

('Lluvia de sonidos', 'Causa y efecto sonoro', '🎵', 'trajectory', 'Sensory', 10,
ARRAY['Sonajero, cuchara de madera, papel arrugado, cascabel'],
'Pon cada objeto en su mano. Cuando sacuda y haga sonido: "¡Hiciste música!"

¿Repite el movimiento? Eso es causa y efecto intencional. Prueba dos objetos sonoros — ¿elige uno? ¿Alterna?

Golpea un ritmo simple y espera. ¿Intenta imitarte?',
'Entre los 3-6 meses, tu bebé repite acciones que producen efectos interesantes (Piaget: reacciones circulares secundarias). Cada sonido producido y repetido es un experimento de causa y efecto que fortalece su sentido de agencia.',
3, 6),

('Burbujas voladoras', 'Tracking visual y asombro', '🫧', 'trajectory', 'Visual', 10,
ARRAY['Jabón para burbujas'],
'Sopla burbujas frente a tu bebé. ¿Las sigue con los ojos? ¿Sigue una o salta entre varias?

Sopla una grande y lenta. ¿La sigue hasta que estalla? Esa es atención sostenida.

Cuando pueda manotear, sopla burbujas a su alcance. El momento que toca una y estalla: causa y efecto + sorpresa + permanencia del objeto.',
'Las burbujas combinan tres estímulos: movimiento (trayectoria), brillo (atención visual), y desaparición (permanencia del objeto). Cada burbuja que sigue fortalece la conexión visión-atención fundamental para toda exploración futura.',
3, 6),

('La montaña de tummy time', 'Fortalecimiento con propósito', '⛰️', 'trajectory', 'Motor', 10,
ARRAY['Toalla enrollada', 'Juguete motivador'],
'Coloca una toalla enrollada bajo su pecho durante tummy time. Pon un juguete justo fuera de su alcance.

¿Estira los brazos? ¿Levanta la cabeza? No lo acerques inmediatamente — esa frustración productiva es motor de motivación.

Cuando haga esfuerzo: "¡Casi llegas!" Si se frustra mucho, acerca un poco.',
'El tummy time no es solo ejercicio — es un problema cognitivo. "Quiero ese juguete, ¿cómo llego?" requiere planificación motora, persistencia y resolución de problemas.',
3, 6),

-- ============================================================
-- 6-9 MONTHS: Active Explorer
-- Focus: sitting play, object exploration, early mobility
-- ============================================================

('La caja de tesoros', 'Meter y sacar sin fin', '📦', 'enclosure', 'Cognitive', 15,
ARRAY['Recipiente con boca ancha', '5-6 objetos variados'],
'Pon objetos dentro del recipiente. Ponlo frente a tu bebé.

¿Mete la mano y saca cosas? ¿Voltea todo? ¿Intenta meter cosas de vuelta?

Modela: pon uno adentro despacio — "adentro." Sácalo — "afuera." Varía el contenedor: boca ancha vs. estrecha.',
'Meter y sacar objetos es crucial a esta edad. Tu bebé aprende: dentro/fuera, lleno/vacío, visible/escondido. Conceptos espaciales y matemáticos pre-verbales. Forma temprana del schema de enclosure.',
6, 9),

('Tambores de cocina', 'Orquesta de causa y efecto', '🥁', 'trajectory', 'Sensory', 10,
ARRAY['Ollas y tupperware boca abajo', 'Cucharas de madera y metal'],
'Pon ollas boca abajo. Dale una cuchara de madera. ¿Golpea? ¡Celebra! ¿Golpea más fuerte? "¡Ese fue fuerte!"

Agrega cuchara de metal — ¿nota que el sonido cambia? Pon un trapo sobre una olla — el sonido se amortigua. "¡Cambió!"

Modela un ritmo simple (toc-toc). ¿Intenta imitarte?',
'Cada golpe es un experimento triple: motor (coordinación), acústico (¿qué sonido?), y causa-efecto. La variación espontánea — más fuerte, más suave, otro lugar — es experimentación científica genuina.',
6, 9),

('El juego de pasar', 'De mano en mano', '🤲', 'transporting', 'Motor', 10,
ARRAY['3-4 objetos de distintos tamaños'],
'Ofrécele un objeto. Cuando lo tome, ofrece otro en la otra mano. ¿Puede sostener dos? ¿Pasa el primero a la otra mano?

Con dos manos ocupadas, ofrece un tercero. ¿Suelta uno? ¿Lo guarda entre las piernas?

Varía tamaños: pelota grande requiere dos manos — ¿qué hace con lo que tenía?',
'Pasar objetos de una mano a otra (transferencia manual) requiere planificación bilateral: "muevo esto AQUÍ para agarrar ESO." Inicio del transporting schema y coordinación bimanual.',
6, 9),

('Peek-a-boo avanzado', 'El juego que construye cerebros', '🙈', 'enveloping', 'Cognitive', 10,
ARRAY['Tela o pañuelo', 'Juguete pequeño'],
'**Nivel 1:** Cubre tu cara. "¿Dónde estoy?" Destapa. "¡Aquí!"
**Nivel 2:** Cubre SU cara. ¿Puede quitarse la tela?
**Nivel 3:** Cubre un juguete mientras mira. ¿Lo busca?
**Nivel 4:** Cubre el juguete, espera 3 segundos. ¿Todavía lo busca?

Cada nivel trabaja una habilidad distinta.',
'Peek-a-boo trabaja permanencia del objeto, memoria de trabajo, predicción, y regulación emocional. Por eso nunca se aburren: cada repetición refina una habilidad diferente.',
6, 9),

('Safari de texturas', 'Exploración sensorial intensiva', '🧸', 'transforming', 'Sensory', 15,
ARRAY['Esponja, cepillo suave, papel aluminio, peluche, fruta fría'],
'Pon objetos a su alcance. ¿Cuál toca primero? ¿Cuál lleva a la boca? ¿Cuál tira?

Nombra sensaciones: "Áspero." "Frío." "Suuuave." Ofrece contrastes: frío después de tibio, suave después de rugoso.',
'A esta edad la boca sigue siendo el sensor más preciso, pero las manos ganan terreno. Cada textura crea una categoría sensorial. Lo fascinante: no solo registra — compara con las anteriores. Inicio del pensamiento clasificatorio.',
6, 9),

-- ============================================================
-- 9-12 MONTHS: Early Scientist
-- Focus: intentional experimentation, pulling up, pointing
-- ============================================================

('La torre para destruir', 'Construir es bueno. Destruir es genial.', '🏗️', 'trajectory', 'Cognitive', 10,
ARRAY['Bloques blandos o tupperware apilable'],
'Construye una torre de 3-4 bloques. Espera. ¿La tumba? "¡CRASH! ¡Se cayó!"

Construye otra. ¿Puede poner un bloque encima? Modela despacio. ¿Te imita?

El ciclo construir-destruir ES el objetivo. Destruir requiere causa y efecto, timing, coordinación. Tan rico como construir.',
'Destruir no es agresión — es experimentación con fuerza, gravedad y transformación. Tu bebé aprende que sus acciones tienen consecuencias predecibles. Necesita ver la torre muchas veces antes de intentar construirla.',
9, 12),

('Tesoro escondido', 'Memoria de trabajo', '🔍', 'enveloping', 'Cognitive', 10,
ARRAY['2-3 vasos opacos', 'Juguete pequeño'],
'Muestra el juguete. Ponlo bajo un vaso mientras mira. "¿Dónde está?"

¿Levanta el correcto? Ahora usa dos vasos. Avanzado: mueve los vasos lentamente. ¿Sigue el correcto?

Si busca donde lo encontró la última vez (no donde lo viste esconder): es el "error A-no-B" — normal y fascinante.',
'Este juego trabaja permanencia del objeto (Piaget substage 4-5) y memoria de trabajo. El error A-no-B desaparece gradualmente entre 10-12 meses conforme la corteza prefrontal madura.',
9, 12),

('Laberinto de almohadas', 'Navegación espacial', '🏔️', 'trajectory', 'Motor', 15,
ARRAY['Almohadas, cojines del sofá', 'Juguete motivador'],
'Construye un mini circuito con almohadas. Pon el juguete al final. Deja que lo navegue: gateando, trepando, rodeando.

No ayudes inmediatamente. ¿Pasa por encima? ¿Rodea? ¿Cambia de ruta?

Hazlo más complejo: agrega un cojín alto, un "túnel" con manta sobre sillas.',
'La navegación espacial activa el hipocampo. Cada decisión de ruta es resolución espacial: planificación, evaluación de riesgo, persistencia. La movilidad independiente es uno de los mayores catalizadores de desarrollo cognitivo del primer año.',
9, 12),

('Conecta y desconecta', 'Ingeniería temprana', '🔗', 'connecting', 'Fine Motor', 10,
ARRAY['Duplo grandes, pop beads, o vasos que encajan'],
'Conecta dos piezas despacio mientras mira. Sepáralos. "¡Se separaron!"

¿Intenta conectarlos? Separar es más fácil que unir — ambos son connecting schema.

Dale cosas con tapa: tupperware, cajas. ¿Puede poner la tapa? ¿Quitarla?',
'El schema de connecting — unir y separar — es la base del pensamiento de ingeniería: ¿cómo se sostienen las cosas juntas? Cada tupperware destapado es un problema de ingeniería resuelto.',
9, 12),

('Cuchara viajera', 'Transporte con herramientas', '🥄', 'transporting', 'Cognitive', 10,
ARRAY['2 recipientes', 'Cucharas', 'Cereal seco o pasta'],
'Pon un recipiente con cereal y otro vacío al lado. Dale una cuchara. ¿Intenta mover contenido de uno a otro?

Si usa las manos: perfecto. El objetivo es transportar, no la herramienta. Varía materiales: agua es más difícil que cereal.',
'Transportar materiales combina: motora fina, espacial, cuantitativa y causa-efecto. Tu bebé hace pre-matemáticas sin saberlo. La cuchara como herramienta agrega complejidad cognitiva.',
9, 12),

-- ============================================================
-- 12-18 MONTHS: Little Physicist
-- All schemas highly active
-- Focus: walking transforms everything, intentional experimentation
-- ============================================================

('Laboratorio de rampas', 'Física con cartón', '🏹', 'trajectory', 'Cognitive', 20,
ARRAY['Cartón o libro grueso', 'Pelotas de distintos tamaños', 'Carritos'],
'Apoya cartón contra el sofá para hacer rampa. Suelta una pelota. "¡Mira cómo rueda!"

Experimenten:
- Rampa inclinada vs. plana: ¿qué cambia?
- Pelota grande vs. chica: ¿cuál más rápido?
- Carrito vs. pelota: ¿cuál llega más lejos?
- Pon un vaso al final como objetivo. ¿Puede atinarle?',
'Cada variación es un experimento controlado: cambia UNA variable y observa. Esto es el método científico. Está en "reacciones circulares terciarias" de Piaget — experimentación deliberada, no repetición.',
12, 18),

('El gran transporte', 'Mudanza por la casa', '🚚', 'transporting', 'Gross Motor', 15,
ARRAY['Bolsa, canasta o carrito de arrastre', 'Objetos variados'],
'Dale una bolsa: "¿Me ayudas a llevar estos bloques a la cocina?"

Deja que llene, cargue, transporte. ¿Llena hasta que sea pesado? ¿Hace varios viajes?

Misiones: "¿Llevas este libro a papá?" "¿Traes tu oso del cuarto?" Cada misión es planificación + ejecución.',
'El transporting explota al caminar: manos libres + movilidad. Cada misión involucra planificación, cuantificación, evaluación de peso, y satisfacción de completar tarea. Pre-matemáticas y función ejecutiva.',
12, 18),

('Pintura con agua', 'Arte que desaparece', '🎨', 'transforming', 'Sensory', 15,
ARRAY['Balde con agua', 'Brochas gruesas', 'Superficie oscura'],
'Dale brocha y balde. Modela: pinta una línea en el piso. "¡Mira!"

Deja que pinte libremente. Observa: ¿trazos largos (trayectoria)? ¿Círculos (rotación)? ¿Cubre todo (enveloping)?

La magia: el agua se seca y desaparece. "¡Se fue! ¿Hacemos más?" Transformación visible en tiempo real. Cero manchas.',
'Elimina restricciones del arte y deja puro placer de exploración. La transformación visible (agua aparece, luego desaparece) fascina a esta edad. Los trazos revelan su schema dominante.',
12, 18),

('Abre y cierra todo', 'La obsesión por las puertas', '🚪', 'connecting', 'Fine Motor', 10,
ARRAY['Cajas con distintos tipos de cierre, tupperware, bolsas con zipper'],
'Reúne contenedores con distintos cierres: tapa a presión, tapa de rosca, zipper, velcro, botón.

Pon un objeto interesante dentro de cada uno. ¿Puede abrirlo? Cada cierre es un problema de ingeniería diferente.

Cuando domine uno, introduce otro más complejo. Rosca es más difícil que presión. Botón más que zipper.',
'Cada tipo de cierre requiere un movimiento diferente: presionar, girar, tirar, pellizcar. Tu hijo está construyendo un repertorio de soluciones mecánicas. Es literalmente ingeniería para principiantes.',
12, 18),

('Encajables de cocina', 'Matemáticas con tupperware', '🔶', 'positioning', 'Cognitive', 15,
ARRAY['Tupperware de 4-5 tamaños distintos'],
'Pon los tupperware frente a tu hijo. ¿Los apila? ¿Los mete uno dentro del otro?

No muestres la solución. Si el grande no entra en el chico, observa: ¿prueba otro? ¿Cambia estrategia?

"¡Ese es muy grande! ¿Cuál más?" Celebra intentos, no solo éxitos.',
'Apilar y anidar son problemas de seriación (orden por tamaño) — pre-matemática fundamental. Cada intento fallido es una lección sobre comparación de magnitudes que no se puede enseñar con palabras.',
12, 18),

('Girar, girar, girar', 'Rotación con todo el cuerpo', '🔄', 'rotation', 'Motor', 10,
ARRAY['Spinning tops, tapas de rosca, un plato de plástico'],
'Da vueltas en círculo con tu hijo (tomados de las manos). ¡Paren! El mundo sigue girando. Risas.

Dale objetos que giran: spinning tops, ruedas de juguete. ¿Puede hacer girar una tapa?

En el agua: haz un remolino en un balde. ¿Intenta hacerlo él?',
'El schema de rotación incluye tanto observar cosas girar como girar el propio cuerpo. Cada experiencia de rotación construye comprensión de equilibrio, centrifugación, y cómo los objetos se ven diferentes desde distintos ángulos.',
12, 18),

-- ============================================================
-- 18-24 MONTHS: World Builder
-- Focus: language explosion, pretend play, independence
-- ============================================================

('Cocina de barro', 'El laboratorio de pociones', '🧪', 'transforming', 'Cognitive', 20,
ARRAY['Tierra, agua, hojas, palos, recipientes viejos, cucharas'],
'Sal al jardín o parque. Pon tierra en un recipiente. Agrega agua. "¿Qué pasa?"

Deja que mezcle con las manos o cucharas. Agrega hojas, piedritas, palos. "¡Estás haciendo una poción!"

¿Cambia la consistencia si agrega más agua? ¿Más tierra? Cada mezcla es un experimento de estados de la materia.',
'El schema de transforming está en su apogeo: mezclar, aplastar, disolver. Tu hijo está explorando cómo los materiales cambian cuando se combinan — la base de la química. La textura del barro (ni líquido ni sólido) es especialmente fascinante.',
18, 24),

('La tienda de todo', 'Juego simbólico con transporte', '🏪', 'transporting', 'Language', 20,
ARRAY['Objetos de la casa como "productos"', 'Bolsas', 'Una mesa como "tienda"'],
'Arma una "tienda" con objetos de la casa en una mesa. Tu hijo es el comprador.

"¿Qué necesitamos?" Deja que elija, ponga en bolsa, y transporte a otro lugar.

Puedes ser el vendedor: "¿Quieres manzanas? Son 2." Introduce números naturalmente. El transporte ida y vuelta es el corazón del juego.',
'Este juego combina transporting schema con juego simbólico (las cosas "representan" otras), lenguaje transaccional, y pre-matemáticas. La representación simbólica — un bloque "es" una manzana — es uno de los logros cognitivos más complejos de esta edad.',
18, 24),

('Envolver regalos', 'Enveloping con propósito', '🎁', 'enveloping', 'Fine Motor', 15,
ARRAY['Papel de periódico o reciclado', 'Cinta adhesiva', 'Objetos pequeños para envolver'],
'Pon papel y cinta a su disposición. Dale un juguete: "¿Lo envolvemos para regalárselo a mamá/papá?"

No importa cómo quede. Cada intento de envolver requiere: planificación espacial, motricidad fina, comprensión de superficie.

Cuando lo "regale" y la persona lo abra: ¡la emoción de revelar! Eso es teoría de la mente: "yo sé lo que hay adentro, ellos no."',
'Envolver combina el schema de enveloping con teoría de la mente — entender que otros no saben lo que tú sabes. Cuando tu hijo envuelve un "regalo", está practicando el concepto de perspectiva: yo tengo información que el otro no tiene.',
18, 24),

('Traza tu sombra', 'Descubrimiento de posición', '🔦', 'positioning', 'Cognitive', 15,
ARRAY['Sol o linterna', 'Tiza o papel grande'],
'En un día soleado, muéstrale su sombra. "¡Mira, ahí estás!"

¿Puede pisar su sombra? ¿La de mamá/papá? Muévete y observa cómo la sombra cambia de posición.

Con linterna en interior: haz sombras con las manos en la pared. ¿Puede imitar las formas? ¿Descubre que mover la linterna cambia el tamaño?',
'Las sombras son una exploración fascinante de posición, perspectiva, y relación espacial. La sombra está conectada al cuerpo pero se mueve de formas inesperadas. Descubrir esta relación es un ejercicio de razonamiento causal.',
18, 24),

('Puentes y caminos', 'Ingeniería con bloques', '🌉', 'connecting', 'Cognitive', 20,
ARRAY['Bloques, libros, cartón, carritos o muñecos'],
'Pon dos bloques separados: "¿Puedes hacer un puente para que pase el carrito?"

Deja que pruebe. ¿Pone algo encima? ¿Se cae? "¡Se cayó! ¿Cómo lo hacemos más fuerte?"

Escala: haz un camino largo con bloques o libros. ¿Puede hacer que un carrito recorra todo el camino sin caerse?',
'Construir puentes requiere resolver un problema de ingeniería real: dos puntos de apoyo y una superficie que los conecta. Tu hijo está aprendiendo sobre distribución de peso, equilibrio, y estabilidad estructural.',
18, 24),

('Carreras de agua', 'Trayectoria líquida', '💧', 'trajectory', 'Cognitive', 15,
ARRAY['Tubos de cartón, embudos, botellas cortadas, agua', 'Cinta adhesiva'],
'Arma un sistema de "tuberías" con tubos de cartón y botellas cortadas pegados a una pared o valla (con cinta).

Vierte agua arriba. ¿Llega abajo? ¿Dónde se pierde? ¿Cómo redirigimos?

Deja que tu hijo vierta y observe. Cada ajuste es ingeniería hidráulica.',
'Esta actividad lleva el schema de trayectoria a un nivel de complejidad mayor: el niño no solo observa cómo cae el agua sino que intenta controlar su dirección. Es planificación, predicción, y ajuste — las bases del pensamiento científico.',
18, 24);
