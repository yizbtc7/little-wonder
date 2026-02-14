-- Added from user-provided seed file (15 Explore articles)

CREATE TABLE IF NOT EXISTS public.explore_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'research', 'guide')),
  domain TEXT,
  summary TEXT,
  body TEXT NOT NULL,
  age_min_months INTEGER NOT NULL DEFAULT 0,
  age_max_months INTEGER NOT NULL DEFAULT 36,
  language TEXT NOT NULL DEFAULT 'es',
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.explore_articles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.explore_articles ADD COLUMN IF NOT EXISTS read_time_minutes INTEGER NOT NULL DEFAULT 3;

DELETE FROM public.explore_articles
WHERE language = 'es' AND age_min_months <= 24 AND age_max_months >= 12;

-- ============================================================
-- LITTLE WONDER: Explore Articles Seed
-- Age range: 12-24 months
-- 15 articles: 6 Articles, 5 Guides, 4 Research
-- Language: Spanish (MVP)
-- ============================================================

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS explore_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'research', 'guide')),
  domain TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  age_min_months INTEGER NOT NULL DEFAULT 0,
  age_max_months INTEGER NOT NULL DEFAULT 36,
  language TEXT NOT NULL DEFAULT 'es',
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ARTICLES (6) — "What's happening right now"
-- ============================================================

INSERT INTO explore_articles (title, emoji, type, domain, summary, body, age_min_months, age_max_months, language, read_time_minutes) VALUES

-- ARTICLE 1
('Por qué tu hijo repite todo una y otra y otra vez', '🔁', 'article', 'Cognitive', 
'La repetición no es aburrimiento — es el motor más potente de aprendizaje que existe.',
'Tiras la cuchara. La recojo. La tiras otra vez. La recojo. La tiras *otra vez*.

Antes de perder la paciencia, considera esto: lo que parece un loop infinito es en realidad el método científico en acción.

## Qué está pasando en su cerebro

Chris Athey, la investigadora que estudió el juego infantil durante décadas en el Froebel Project, descubrió algo fascinante: los niños no "saltan" de actividad en actividad al azar. **Repiten patrones específicos** — los llamó *schemas* — porque cada repetición refina una conexión neuronal.

Cuando tu hijo tira la cuchara por vigésima vez, cada lanzamiento le enseña algo ligeramente distinto:
- ¿Cae igual si la suelto suave vs. fuerte?
- ¿Hace el mismo sonido en el piso vs. en la alfombra?
- ¿Mamá/Papá reacciona igual cada vez?

No es un lanzamiento. Son **veinte experimentos diferentes** que se ven iguales desde afuera.

## La ciencia de la mielina

Cada vez que una acción se repite, el cerebro envuelve esa conexión neuronal en una capa de mielina — una sustancia que acelera la transmisión de señales. Es como pasar de internet dial-up a fibra óptica. La repetición *literalmente* hace que el cerebro sea más rápido y eficiente.

## Qué puedes hacer

En lugar de detener la repetición, **varía ligeramente el contexto**. Si tira la cuchara, ofrécele una pelota blanda. Mismo impulso (trajectory schema), nueva información. Narrar también ayuda: "¡Cayó! ¿Escuchaste ese sonido?"

## Lo que importa recordar

La próxima vez que tu hijo haga lo mismo por centésima vez, recuerda: no está atrapado. Está *construyendo*. Y cada repetición es un ladrillo más en el edificio más impresionante del universo — su cerebro.',
12, 24, 'es', 4),

-- ARTICLE 2
('El laboratorio secreto de la boca', '👄', 'article', 'Sensory',
'Cuando todo va a la boca, tu hijo está usando su sensor más preciso.',
'¿Por qué todo — absolutamente todo — termina en la boca?

Porque la boca es, con diferencia, el instrumento de medición más sofisticado que tiene tu hijo.

## Más sensible que las manos

La boca tiene más terminaciones nerviosas por centímetro cuadrado que casi cualquier otra parte del cuerpo. Cuando tu hijo se mete un bloque en la boca, está obteniendo información que sus manos todavía no pueden darle: temperatura exacta, textura microscópica, dureza, forma tridimensional, peso.

Es como si tuviera un laboratorio portátil instalado en la cara.

## El mapa sensorial del cerebro

En neurociencia existe el "homúnculo sensorial" — un mapa del cerebro donde cada parte del cuerpo tiene un espacio proporcional a su sensibilidad. La boca y los labios ocupan un espacio *enorme* comparado con, digamos, la espalda. Tu hijo está usando su herramienta más poderosa.

## Cuándo cambia

Entre los 18 y 24 meses, notarás que la exploración oral disminuye gradualmente. No es que pierda curiosidad — es que sus manos se vuelven lo suficientemente hábiles para explorar con la misma precisión. El laboratorio se muda de la boca a los dedos.

## Qué puedes hacer

Ofrece variedad de texturas seguras para explorar: una cuchara fría de metal, un bloque de madera suave, una pelota de goma con textura. Narrar lo que observas: "Esa cuchara está fría, ¿verdad? Y es dura." Estás conectando sensación con lenguaje.

## Lo que importa recordar

La boca no es un problema que resolver — es una herramienta que celebrar. Tu hijo está catalogando el mundo físico con la precisión de un científico.',
12, 20, 'es', 3),

-- ARTICLE 3
('Cuando "¡NO!" es en realidad un gran avance', '✊', 'article', 'Social-Emotional',
'Ese "no" desafiante no es rebeldía — es tu hijo descubriendo que es una persona separada.',
'La primera vez fue casi gracioso. La decimoquinta vez en una hora, menos.

"¡NO!"

A todo. A la comida que ayer le encantaba. A ponerse los zapatos. A lavarse las manos. No, no, no.

## Lo que realmente está pasando

Erik Erikson, uno de los psicólogos del desarrollo más influyentes del siglo XX, describió esta etapa como **Autonomía vs. Vergüenza**: el período donde el niño descubre que es una persona independiente con voluntad propia.

Ese "no" no es rebeldía. Es tu hijo practicando la habilidad más importante de su vida: **tener voluntad propia**.

Piénsalo así: hasta hace poco, tu hijo no sabía que podía estar en desacuerdo contigo. Que su mente y la tuya son *diferentes*. Que puede querer algo distinto a lo que tú quieres. Eso es un salto cognitivo enorme.

## La autonomía como cimiento

Los niños que pueden decir "no" y ser escuchados desarrollan algo que los psicólogos llaman **agency** — la sensación de que pueden influir en su mundo. Esta sensación es la base de:
- La persistencia (seguir intentando cuando algo es difícil)
- La creatividad (proponer ideas propias)
- La resiliencia (recuperarse de frustraciones)

## Qué puedes hacer

**Ofrece opciones legítimas** en lugar de batallas. No "¿quieres ponerte los zapatos?" (la respuesta será no). Mejor: "¿zapatos rojos o zapatos azules?" Dos opciones, ambas aceptables para ti, pero que le dan control real.

Cuando el "no" es sobre algo no negociable (seguridad, por ejemplo), valida el sentimiento sin ceder: "Entiendo que no quieres el cinturón. Yo voy a ponértelo porque es importante para estar seguro. Puedes estar enojado — eso está bien."

## Lo que importa recordar

Cada "no" es una práctica de independencia. Y un niño que practica decir no en un ambiente seguro y amoroso aprende *cuándo y cómo* decir no — una habilidad que lo protegerá el resto de su vida.',
14, 30, 'es', 4),

-- ARTICLE 4
('El diccionario invisible que crece 5 veces más rápido de lo que ves', '💬', 'article', 'Language',
'Tu hijo entiende muchísimo más de lo que puede decir. Su vocabulario invisible es enorme.',
'Quizás dice 10 palabras. Quizás 20. Tal vez solo "mamá", "papá", "agua", y "no".

Pero aquí está lo extraordinario: **entiende entre 50 y 200 palabras**. Probablemente más.

## El vocabulario receptivo

Los lingüistas distinguen entre vocabulario *expresivo* (lo que puede decir) y vocabulario *receptivo* (lo que entiende). En esta etapa, el receptivo es entre 3 y 10 veces mayor que el expresivo.

¿La prueba? Dile "¿dónde está tu oso?" y mira lo que pasa. No necesita decir "oso" para buscarlo con la mirada, señalarlo, o ir a buscarlo. Eso es comprensión.

## La explosión que viene

Entre los 18 y 24 meses, la mayoría de los niños experimentan lo que los investigadores llaman la "explosión de vocabulario" — pasan de aprender 1-3 palabras por semana a aprender 1-3 palabras *por día*. En algunos casos, más.

Lo fascinante es que esta explosión no sale de la nada. Se viene construyendo durante meses, en silencio, mientras tu hijo acumula ese vocabulario invisible.

## Cada palabra que dices cuenta

Un estudio del MIT encontró que los niños que experimentan más "turnos conversacionales" — no simplemente más palabras, sino más intercambios de ida y vuelta — muestran mayor activación en el área de Broca, la región del cerebro responsable del lenguaje.

No necesitas hablar sin parar. Necesitas *responder*.

Cuando señala algo: "¡Sí, viste un pájaro! Un pájaro azul. Está en el árbol."
Cuando balbucea: responde como si fuera una conversación. Pausa. Espera. Deja que "conteste."

## Lo que importa recordar

El silencio de tu hijo no es vacío — está lleno de comprensión. Cada palabra que dices se está archivando en una biblioteca enorme e invisible que un día, muy pronto, va a abrirse de par en par.',
12, 24, 'es', 4),

-- ARTICLE 5
('Tu cara es su brújula', '🧭', 'article', 'Social-Emotional',
'Cuando tu hijo te mira antes de tocar algo nuevo, está leyendo tu cara como un GPS emocional.',
'Nota este momento: tu hijo ve algo nuevo — un perro, un juguete que hace ruido, una persona desconocida — y antes de acercarse o alejarse, **te mira a ti**.

Eso tiene nombre: se llama **referencia social**. Y es una de las habilidades más sofisticadas del primer año de vida.

## Leyendo emociones para sobrevivir

Mary Ainsworth y John Bowlby, los pioneros de la teoría del apego, demostraron que los bebés usan la expresión facial del cuidador como guía para evaluar si algo es seguro o peligroso.

- Tu cara calmada y curiosa = "esto es seguro, puedo explorar"
- Tu cara tensa o asustada = "esto es peligroso, mejor me alejo"

Tu hijo no está pidiendo permiso. Está **leyendo datos** para tomar una decisión.

## Por qué tu calma importa tanto

Aquí viene la parte importante: si tú reaccionas con ansiedad ante algo inofensivo (un insecto, un perro amigable, un charco), tu hijo *calibra* su sistema de alarma usando tu reacción. Con el tiempo, puede desarrollar cautela excesiva ante cosas que no son realmente peligrosas.

Esto no significa que debas fingir. Significa que tu **curiosidad genuina** ante el mundo es literalmente contagiosa.

## El ciclo explorar–volver

Los investigadores del apego describen un ciclo predecible:
1. Tu hijo se aventura a explorar algo nuevo
2. Cada cierto tiempo, voltea a verte (o vuelve físicamente)
3. Si recibe una señal de seguridad (tu cara, tu voz), se aventura más lejos
4. Si algo lo asusta, corre de vuelta

Tú eres la base. Tu presencia tranquila es lo que le permite ser valiente.

## Lo que importa recordar

Tu cara es el primer libro que tu hijo aprendió a leer. Y lo sigue consultando cientos de veces al día. Una cara curiosa y calmada es el mejor permiso para explorar que puedes darle.',
8, 20, 'es', 4),

-- ARTICLE 6
('Por qué desarma todo lo que le das', '🔧', 'article', 'Cognitive',
'Desarmar no es destruir — es ingeniería inversa en su forma más pura.',
'Le regalaron un juguete nuevo. En 30 segundos, está intentando quitarle las ruedas.

¿Destrucción? No. **Ingeniería inversa**.

## El schema de connecting

Chris Athey identificó el "schema de connecting" — la fascinación por cómo las cosas se unen y se separan. Los niños en esta fase están obsesionados con:
- Unir piezas de tren
- Pegar cinta adhesiva en todo
- Atar cordones a objetos
- Y sí, *separar* cosas que están unidas

Unir y separar son la misma investigación vista desde dos ángulos.

## Qué está aprendiendo

Cada vez que desarma algo, tu hijo está respondiendo preguntas de ingeniería:
- ¿Cómo se sostiene esta pieza?
- ¿Qué pasa si quito esta parte?
- ¿Puedo volver a armarlo?
- ¿Qué hay adentro?

Estas son exactamente las preguntas que se hacen los ingenieros, los mecánicos, los cirujanos. La curiosidad por el funcionamiento interno de las cosas empieza aquí.

## Qué puedes hacer

Dale cosas **diseñadas para desarmar**: bloques de encastre, juguetes con piezas que se separan, cajas con tapas, frascos con tapa de rosca. Si te preocupa que rompa cosas, el truco es darle cosas que *se pueden* desarmar sin romperse.

La cinta adhesiva es oro para esta etapa. Barata, infinita, y perfecta para explorar connecting.

## Lo que importa recordar

El niño que desarma todo hoy es el adulto que entiende cómo funcionan las cosas mañana. No está rompiendo — está preguntando "¿cómo funciona esto?" con las manos.',
12, 30, 'es', 3),

-- ============================================================
-- GUIDES (5) — "What to do"
-- ============================================================

-- GUIDE 1
('Los 8 schemas de juego: guía práctica para padres', '🧩', 'guide', 'Play',
'Aprende a identificar los patrones de juego de tu hijo y verás su genio en acción.',
'Imagina que pudieras leer la mente de tu hijo. Saber exactamente qué está investigando cuando tira la comida, gira las ruedas del carrito, o llena y vacía un balde 47 veces.

Puedes. Se llaman **schemas de juego**.

## Qué son los schemas

Los schemas son patrones repetitivos de comportamiento a través de los cuales los niños exploran conceptos fundamentales del mundo físico. Fueron identificados por Chris Athey en el Froebel Early Education Project.

No son aleatorios. Cuando tu hijo repite una acción obsesivamente, está en medio de una investigación profunda.

## Los 8 schemas

### 1. 🏹 Trayectoria
**Lo que ves:** Tirar cosas, patear, lanzar, verter agua, correr en línea recta.
**Lo que aprende:** Gravedad, fuerza, dirección, causa y efecto.
**Cómo apoyarlo:** Pelotas, rampas para carros, juegos con agua y embudos.

### 2. 🔄 Rotación
**Lo que ves:** Girar sobre sí mismo, fascinar con ruedas, abrir y cerrar grifos.
**Lo que aprende:** Equilibrio, coordinación, física rotacional.
**Cómo apoyarlo:** Spinning tops, batir ingredientes, rodar plastilina.

### 3. 📦 Enclosure (Encerrar)
**Lo que ves:** Construir corrales para animales, dibujar círculos, esconderse bajo mesas.
**Lo que aprende:** Límites, área, dentro/fuera, perímetro.
**Cómo apoyarlo:** Bloques para construir muros, fuertes con almohadas, cajas.

### 4. 🎁 Enveloping (Envolver)
**Lo que ves:** Envolver juguetes en telas, esconderse bajo mantas, cubrir dibujos enteros de un color.
**Lo que aprende:** Permanencia del objeto, superficie, transformación.
**Cómo apoyarlo:** Papel para envolver, peek-a-boo, pintura con los dedos.

### 5. 🚚 Transporting
**Lo que ves:** Llenar bolsas, cargar cosas de un lugar a otro, empujar carritos cargados.
**Lo que aprende:** Cantidad, peso, capacidad, planificación.
**Cómo apoyarlo:** Carretillas, bolsas, juegos de "delivery" por la casa.

### 6. 🔗 Connecting
**Lo que ves:** Unir trenes, usar cinta adhesiva, atar cordones, desarmar cosas.
**Lo que aprende:** Ingeniería, integridad estructural, relación parte-todo.
**Cómo apoyarlo:** Bloques de construcción, trenes con rieles, arte con pegamento y cinta.

### 7. 🎨 Transforming
**Lo que ves:** Mezclar colores, combinar arena y agua, aplastar plastilina, fascinar con hielo derritiéndose.
**Lo que aprende:** Química básica, estados de la materia, irreversibilidad.
**Cómo apoyarlo:** Cocinar juntos, experimentos con agua y colorante, plastilina.

### 8. 📐 Positioning
**Lo que ves:** Alinear carros en fila perfecta, ordenar por color, colocar objetos en posiciones específicas.
**Lo que aprende:** Orden, secuencia, clasificación, patrones, simetría.
**Cómo apoyarlo:** Actividades de clasificación, rompecabezas, colecciones de naturaleza.

## Cómo identificar el schema de tu hijo

Observa durante una semana. ¿Qué hace repetidamente? ¿Tira cosas? Es trayectoria. ¿Llena y vacía contenedores? Es transporting. ¿Gira todo? Es rotación.

Un niño puede tener más de un schema activo, y los schemas cambian con el tiempo. Lo importante es **identificar el patrón actual** y alimentarlo con materiales y experiencias que lo extiendan.

## Lo que importa recordar

Cuando identificas el schema de tu hijo, dejas de ver comportamiento "molesto" y empiezas a ver genio en acción. No está haciendo un desastre — está haciendo ciencia.',
10, 36, 'es', 6),

-- GUIDE 2
('5 actividades para pequeños que tiran todo', '🏹', 'guide', 'Trajectory',
'Si tu hijo lanza, tira y deja caer todo, estas actividades canalizan ese impulso.',
'Tu hijo lanza la cuchara. Tira los bloques. Deja caer la comida al suelo y mira cómo cae. Una. Y otra. Y otra vez.

Está en el **schema de trayectoria** — y en lugar de luchar contra él, puedes alimentarlo.

## Por qué tira cosas

Cada lanzamiento es un experimento de física: gravedad, velocidad, dirección, fuerza, causa y efecto. Es la misma curiosidad que impulsa a un científico, expresada con las herramientas que tiene: sus manos y todo lo que alcanza.

## 5 actividades que alimentan la trayectoria

### 1. Pelotas al balde
**Necesitas:** Un balde o caja grande, pelotas de distintos tamaños.
**Qué hacer:** Pon el balde a 1 metro de distancia. Deja que lance pelotas adentro. Cuando acierte, acerca más o aleja más el balde.
**Qué aprende:** Puntería, distancia, fuerza.
**Narrar:** "¡Adentro! ¿Puedes hacerlo desde más lejos?"

### 2. Cascada de vasos
**Necesitas:** Vasos de plástico, agua, una bandeja.
**Qué hacer:** Llena un vaso y deja que vierta agua de un vaso a otro. Agrega embudos si tienes.
**Qué aprende:** Flujo, gravedad, volumen, coordinación mano-ojo.
**Narrar:** "Mira cómo cae el agua. ¿Qué pasa si lo haces más rápido?"

### 3. Rampas caseras
**Necesitas:** Un libro o cartón inclinado contra el sofá, carritos o pelotas.
**Qué hacer:** Inclina el cartón y deja que ruede objetos por la rampa. Prueba con distintas pendientes.
**Qué aprende:** Velocidad, inclinación, fricción, gravedad.
**Narrar:** "Este carro fue rápido. ¿Qué pasa si ponemos la rampa más alta?"

### 4. Piedras al charco
**Necesitas:** Un charco (o un balde con agua) y piedras de distintos tamaños.
**Qué hacer:** Deja que tire piedras al agua. Observen juntos el splash.
**Qué aprende:** Peso, tamaño, relación entre fuerza del lanzamiento y tamaño del splash.
**Narrar:** "¡Gran splash! Esa piedra era pesada. ¿Qué pasa con una chiquita?"

### 5. Pintar con movimiento
**Necesitas:** Papel grande en el piso, esponjas, rodillos, pintura lavable.
**Qué hacer:** Deja que haga trazos largos, salpique, y ruede el rodillo de un lado a otro.
**Qué aprende:** Líneas, arcos, marcas, causa y efecto visual.
**Narrar:** "Hiciste una línea larguísima. Mira el camino que hizo el rodillo."

## La regla de oro

No muestres cómo hacerlo primero. La investigadora Laura Schulz del MIT demostró que cuando un adulto muestra cómo funciona algo, el niño aprende esa función específica pero **explora menos**. Pon los materiales, da espacio, y observa qué hace tu hijo con ellos.

## Lo que importa recordar

No estás "dejándolo tirar cosas." Estás dándole un laboratorio de física con materiales apropiados. El impulso es el mismo — el contexto cambia todo.',
10, 24, 'es', 4),

-- GUIDE 3
('Cómo hablarle para construir su cerebro', '🗣️', 'guide', 'Language',
'No necesitas hablar más — necesitas responder mejor. La guía del serve and return.',
'No necesitas un programa especial de estimulación de lenguaje. No necesitas flashcards, apps, ni videos educativos.

Necesitas hacer una cosa: **responder**.

## La ciencia del serve and return

El Harvard Center on the Developing Child identificó que el mecanismo más poderoso para construir arquitectura cerebral se llama "serve and return" — servir y devolver, como en el tenis.

Tu hijo "sirve": señala algo, balbucea, te mira, hace un gesto.
Tú "devuelves": respondes con palabras, contacto visual, un gesto.

Ese intercambio — repetido miles de veces — literalmente construye las conexiones neuronales que sustentan el lenguaje, la cognición y la regulación emocional.

## Los 5 pasos

### 1. Nota el servicio
Tu hijo señala un perro. Mira hacia el cielo. Te trae un juguete. Cualquier bid for attention es un "serve."

### 2. Devuelve el servicio
Responde: contacto visual, una sonrisa, acerca lo que señala, di algo.

### 3. Dale nombre
"¡Sí, un perro! Un perro grande y café." Nombrar conecta el lenguaje con la experiencia.

### 4. Toma turnos y espera
Después de hablar, **haz una pausa**. Dale tiempo para procesar y responder. El silencio no es vacío — es procesamiento. Cuenta hasta 5 en tu cabeza.

### 5. Practica finales y comienzos
Cuando tu hijo se voltea hacia algo nuevo, síguelo. Su nuevo foco es un nuevo "serve."

## Lo que NO necesitas hacer

- No necesitas hablar sin parar (es agotador e inefectivo)
- No necesitas corregir pronunciación ("no se dice ''aba'', se dice ''agua''" — esto desanima)
- No necesitas enseñar vocabulario con ejercicios

Solo necesitas **notar, responder, nombrar, esperar**. En la vida cotidiana, durante lo que ya estás haciendo.

## Expande en vez de corregir

Cuando dice "aba" → responde "¡Sí, agua! ¿Quieres agua?"
Cuando dice "eto" → "Sí, ese es tu gato. Un gato suave."
Cuando señala sin palabras → "Viste el avión. ¡Va rápido por el cielo!"

Estás modelando sin corregir. Expandiendo sin presionar.

## Lo que importa recordar

Un estudio del MIT demostró que lo que más impacta el desarrollo del lenguaje no es la *cantidad* de palabras que escucha tu hijo, sino la cantidad de *turnos conversacionales* — los intercambios de ida y vuelta. Calidad sobre cantidad. Siempre.',
8, 36, 'es', 5),

-- GUIDE 4
('Actividades para el schema de transportar', '🚚', 'guide', 'Transporting',
'Si tu hijo carga, llena, vacía y mueve cosas de un lado a otro, estas ideas son para ustedes.',
'¿Tu hijo llena bolsas con juguetes y las carga por toda la casa? ¿Vacía un cajón, lo llena de otras cosas, y lo mueve a otro cuarto? ¿Empuja carritos cargados con bloques?

Está en el **schema de transporting** — y está aprendiendo matemáticas sin saberlo.

## Qué está aprendiendo

Cada vez que transporta objetos, tu hijo explora:
- **Cantidad**: ¿cuántos caben? ¿necesito más?
- **Peso**: esto es pesado, esto es liviano
- **Capacidad**: lleno, vacío, medio lleno
- **Planificación**: primero lleno, después muevo, después vacío
- **Clasificación**: inconscientemente agrupa lo que transporta

## 5 actividades para transportadores

### 1. El cartero de la casa
**Necesitas:** Sobres (pueden ser vacíos), una bolsa.
**Qué hacer:** Haz "cartas" para cada miembro de la familia. Tu hijo las entrega.
**Narrar:** "¿Puedes llevarle esta carta a papá? Está en la cocina."

### 2. Mudanza de juguetes
**Necesitas:** Una caja, un carro de arrastre, o una bolsa.
**Qué hacer:** "Vamos a mudar a los animales a su nueva casa" — de un cuarto a otro.
**Narrar:** "Llevas tres animales. ¿Caben más? ¡Esa jirafa es grande!"

### 3. Supermercado casero
**Necesitas:** Frutas/objetos en una "tienda", una bolsa de compras.
**Qué hacer:** Arma una tiendita. Tu hijo "compra" y transporta a la "casa."
**Narrar:** "¿Qué necesitamos? ¿Manzanas? Ponlas en la bolsa."

### 4. Ayudante de jardín
**Necesitas:** Un balde, hojas, piedras, palos.
**Qué hacer:** Recolectar tesoros del jardín y transportarlos a un punto.
**Narrar:** "¡Encontraste una hoja roja! Ponla en el balde con las demás."

### 5. Baño con trasvase
**Necesitas:** Vasos, botellas, coladores, embudos en la bañera.
**Qué hacer:** Deja que traslade agua de un recipiente a otro.
**Narrar:** "Estás llenando la botella. ¿Ya está llena? Ahora ponla en el vaso grande."

## Lo que importa recordar

Tu hijo no está haciendo desorden — está haciendo logística. Las mismas habilidades que usa para mover bloques de un cuarto a otro son las que usará para organizar ideas, planificar proyectos, y resolver problemas complejos.',
12, 30, 'es', 4),

-- GUIDE 5
('Qué hacer cuando tu hijo tiene un meltdown', '🌊', 'guide', 'Social-Emotional',
'Los berrinches no son manipulación — son un cerebro que siente más de lo que puede procesar.',
'Estás en el supermercado. Tu hijo quiere el cereal con el dinosaurio. Dices que no. Y de repente: el mundo se termina.

Gritos. Lágrimas. Tirarse al piso. Miradas de otros adultos.

Respira. Esto no es un fracaso tuyo ni de tu hijo. Es neurociencia.

## Por qué pasan los meltdowns

El cerebro de tu hijo tiene un acelerador potente (la amígdala, que genera emociones intensas) pero frenos muy débiles (la corteza prefrontal, que regula esas emociones). La corteza prefrontal no estará completamente desarrollada hasta los **25 años**.

Tu hijo no *elige* perder el control. **No puede no perderlo.** Es como pedirle que corra un maratón con piernas de 18 meses.

## Qué NO funciona

- **Razonar:** "Pero si ya tienes cereal en casa" — la parte racional del cerebro no está accesible durante un meltdown.
- **Amenazar:** "Si no paras, nos vamos" — agrega más estrés a un sistema ya sobrecargado.
- **Ignorar:** puede funcionar a corto plazo, pero no enseña regulación emocional.

## Qué SÍ funciona

### 1. Co-regulación
Tu calma es su regulación externa. Baja tu cuerpo a su nivel. Habla despacio y suave. Tu sistema nervioso regulado ayuda a regular el suyo.

### 2. Validar sin ceder
"Estás muy enojado porque querías ese cereal. Lo entiendo. Es difícil cuando queremos algo y no podemos tenerlo." No necesitas comprar el cereal. Solo necesitas reconocer el sentimiento.

### 3. Esperar
La tormenta pasa. Siempre pasa. Tu trabajo no es detenerla — es estar presente mientras pasa.

### 4. Nombrar después
Cuando se calme, nombra lo que pasó: "Sentiste mucha frustración. Es una emoción grande. Y se fue pasando." Estás construyendo vocabulario emocional.

## Lo que importa recordar

Cada meltdown que acompañas con calma es una lección de regulación emocional. Tu hijo está aprendiendo: "Las emociones grandes vienen y van. Y hay alguien que me acompaña mientras pasan." Eso es resiliencia en construcción.',
14, 36, 'es', 5),

-- ============================================================
-- RESEARCH (4) — "Why it works"
-- ============================================================

-- RESEARCH 1
('Tu voz construye su cerebro (la ciencia del MIT)', '🧠', 'research', 'Neuroscience',
'Investigadores del MIT descubrieron que los turnos conversacionales impactan más que la cantidad de palabras.',
'En 2018, un equipo de investigadores del MIT liderado por Rachel Romeo publicó un estudio que cambió lo que sabíamos sobre el desarrollo del lenguaje infantil.

## El descubrimiento

Usando neuroimagen (fMRI), el equipo midió la actividad cerebral de niños de 4 a 6 años mientras procesaban lenguaje. Luego compararon esa actividad con grabaciones de las interacciones que esos niños tenían en casa.

El hallazgo: lo que más predecía la activación del área de Broca (la región clave para el lenguaje) no era la cantidad de palabras que el niño escuchaba, sino **la cantidad de turnos conversacionales** — los intercambios de ida y vuelta entre adulto y niño.

## Qué significa esto

Un padre que habla sin parar frente a su hijo (un monólogo) tiene menos impacto que un padre que tiene breves intercambios de ida y vuelta, incluso con balbuceos.

La clave no es *input* — es *interacción*.

## Serve and return en acción

Este hallazgo valida directamente el modelo de "serve and return" del Harvard Center on the Developing Child. Cada intercambio — por breve que sea — fortalece las conexiones sinápticas que construyen la arquitectura del lenguaje.

El estudio del MIT fue especialmente importante porque demostró que este efecto era **independiente del nivel socioeconómico**. No importa cuántos libros tengas o cuánto dinero ganes. Lo que importa es si respondes cuando tu hijo te habla.

## Lo que importa recordar

No necesitas ser elocuente. No necesitas narrar todo el día. Solo necesitas responder. Cada ida y vuelta — cada "serve and return" — es una conexión neuronal que se fortalece.',
0, 36, 'es', 4),

-- RESEARCH 2
('El juego guiado supera a la instrucción directa', '🎯', 'research', 'Pedagogy',
'40 años de investigación confirman: los niños aprenden más cuando guías sin dirigir.',
'¿Es mejor dejar que los niños jueguen solos, guiar su juego, o enseñarles directamente?

En 2022, un meta-análisis publicado en *Child Development* (Skene et al.) analizó 39 estudios y dio una respuesta clara.

## Los tres enfoques

**Juego libre:** El niño elige qué, cómo, y por cuánto tiempo. El adulto solo provee materiales y seguridad.

**Juego guiado:** El adulto prepara el ambiente y hace preguntas que extienden el pensamiento, pero el niño dirige la exploración.

**Instrucción directa:** El adulto demuestra, explica, y el niño sigue las instrucciones.

## Lo que encontraron

El juego guiado superó tanto al juego libre como a la instrucción directa en medidas de aprendizaje específico: pensamiento espacial, vocabulario, conceptos matemáticos.

¿Por qué? Porque combina lo mejor de ambos mundos: la motivación intrínseca del juego libre con la intencionalidad de la instrucción.

## La espada de doble filo (Schulz, MIT)

Laura Schulz del MIT añadió un matiz crucial: cuando un adulto muestra directamente cómo funciona un juguete, el niño aprende esa función eficientemente pero **explora menos**. Los niños que descubren funciones solos exploran más ampliamente y encuentran características que el adulto ni mostró.

Implicación: no muestres cómo se juega. **Prepara el escenario y observa.**

## Qué significa para ti

En vez de "mira, así se apilan los bloques" → pon los bloques frente a tu hijo y espera.
En vez de "el triángulo va aquí" → "¿dónde crees que va?"
En vez de dirigir → pregunta, observa, extiende.

## Lo que importa recordar

Tu rol no es enseñar. Es crear las condiciones para que tu hijo descubra. Esa diferencia — sutil pero profunda — es la diferencia entre un niño que cumple instrucciones y un niño que piensa por sí mismo.',
0, 36, 'es', 4),

-- RESEARCH 3
('El apego seguro es combustible para la curiosidad', '🔒', 'research', 'Attachment',
'Bowlby y Ainsworth demostraron que los niños que se sienten seguros exploran más y mejor.',
'Puede parecer contradictorio: un niño que está "pegado" a ti, que llora cuando te vas, que te busca constantemente... ¿es el mismo niño que debería explorar con valentía?

Sí. Y la ciencia explica por qué.

## La teoría del apego

John Bowlby y Mary Ainsworth demostraron en los años 60 y 70 que la relación entre seguridad emocional y exploración no es contradictoria — es **causal**.

Un niño que confía en que su cuidador estará ahí cuando lo necesite puede aventurarse más lejos, tomar más riesgos cognitivos, y recuperarse más rápido de frustraciones.

El apego seguro no crea dependencia — crea **una plataforma de lanzamiento**.

## El ciclo explorar–volver

Los investigadores observaron un patrón predecible en niños con apego seguro:
1. El niño se aleja a explorar
2. Periódicamente mira hacia atrás (o vuelve físicamente)
3. Recibe confirmación de seguridad (una mirada, una sonrisa)
4. Se aventura más lejos

Los niños con apego inseguro, en cambio, o no se alejan (demasiado ansiosos) o se alejan sin mirar atrás (evitando la conexión). Ambos extremos reducen la calidad de la exploración.

## "Spoiling" es un mito

Responder a tu bebé cuando llora no lo "malcría". La investigación es consistente: los bebés que son respondidos de manera consistente lloran *menos* a largo plazo, no más. La respuesta rápida y confiable construye un modelo interno de "el mundo es seguro" que libera recursos cognitivos para explorar.

## La ansiedad por separación es señal de salud

Cuando tu hijo de 8-14 meses llora al dejarlo en la guardería o con un familiar, no es una señal de problema. Es una señal de **apego saludable**. Significa que su cerebro ha identificado correctamente quién es su persona segura.

## Lo que importa recordar

Cada vez que respondes a un llanto, que te agachas cuando te busca, que ofreces una sonrisa cuando voltea a verte, estás llenando el tanque de combustible que le permite ser curioso. La seguridad y la exploración no compiten — se alimentan mutuamente.',
0, 24, 'es', 5),

-- RESEARCH 4
('Por qué los premios matan la curiosidad', '🏆', 'research', 'Motivation',
'Stickers, estrellas y premios por portarse bien pueden hacer más daño que bien a la motivación.',
'Tu hijo dibuja porque le encanta dibujar. Le das una estrellita cada vez que dibuja. Un mes después, dejas de dar estrellitas. ¿Qué pasa?

Deja de dibujar.

## El efecto de sobrejustificación

En los años 70, los psicólogos Mark Lepper, David Greene y Richard Nisbett hicieron un experimento clásico. Tomaron niños que *naturalmente* amaban dibujar y los dividieron en tres grupos:

- **Grupo 1:** Les prometieron un certificado por dibujar
- **Grupo 2:** Les dieron un certificado sorpresa después de dibujar
- **Grupo 3:** Ni certificado ni promesa

Semanas después, midieron quién seguía dibujando por su cuenta. Los niños del Grupo 1 — los que esperaban la recompensa — dibujaban **significativamente menos** que los otros dos grupos.

## Por qué pasa esto

La Teoría de la Autodeterminación (Deci & Ryan) explica que los humanos tenemos tres necesidades psicológicas básicas:
- **Autonomía:** Sentir que elijo lo que hago
- **Competencia:** Sentir que puedo hacerlo
- **Conexión:** Sentir que importo

Cuando introduces una recompensa externa por algo que el niño ya disfruta, cambias su motivación interna ("dibujo porque me gusta") por una externa ("dibujo para obtener la estrella"). Y cuando la estrella desaparece, la motivación también.

## Qué significa para tu familia

Esto no quiere decir que nunca reconozcas logros. La diferencia está en cómo:

❌ "Si ordenas tus juguetes, te doy un sticker" → motivación extrínseca
✅ "¡Wow, ordenaste todo! Mira cuánto espacio hay para jugar ahora" → notar el resultado natural

❌ Tablas de estrellas por explorar
✅ Sentarse juntos a mirar sus dibujos y hablar sobre ellos

## Lo que importa recordar

Tu hijo nació curioso. No necesitas premiarlo por explorar — necesitas no darle razones para dejar de hacerlo. La curiosidad es su propia recompensa. Protégela.',
0, 36, 'es', 4);
