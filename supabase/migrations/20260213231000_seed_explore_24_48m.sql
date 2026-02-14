-- ============================================================
-- EXPLORE CONTENT SEED: 24-48 MONTHS (4 bands)
-- Spanish + English | Articles + Brain Cards + Daily Tips
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 24-30 MONTHS (2 - 2.5 years)
-- Theme: Language explosion, autonomy battles, pretend play begins
-- ────────────────────────────────────────────────────────────

-- BRAIN CARDS (ES)
INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('💬', 'La explosión del vocabulario', 'Entre los 24 y 30 meses, el cerebro de {child_name} está adquiriendo entre 2 y 5 palabras NUEVAS cada día. Incluso las palabras que no dice aún las está archivando. Cada conversación contigo es combustible directo para este motor de lenguaje.', 'Lenguaje', 24, 30, 'es'),
('🎭', 'El juego simbólico despega', 'Cuando {child_name} finge que un bloque es un teléfono o le da de comer a un peluche, está haciendo algo cognitivamente extraordinario: mantener dos realidades simultáneas — lo que el objeto ES y lo que REPRESENTA. Esta es la base del pensamiento abstracto.', 'Imaginación', 24, 30, 'es'),
('🚫', 'El poder del "no"', 'El "no" constante de {child_name} no es rebeldía — es uno de los logros más importantes del desarrollo. Está descubriendo que es una persona separada con preferencias propias. Erikson lo llama la crisis de autonomía vs. vergüenza. Cada "no" es práctica de agencia.', 'Socio-Emocional', 24, 30, 'es');

-- BRAIN CARDS (EN)
INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('💬', 'The Vocabulary Explosion', 'Between 24 and 30 months, {child_name}''s brain is acquiring 2 to 5 NEW words every single day. Even words they don''t say yet are being filed away. Every conversation with you is direct fuel for this language engine.', 'Language', 24, 30, 'en'),
('🎭', 'Pretend Play Takes Off', 'When {child_name} pretends a block is a phone or feeds a stuffed animal, they''re doing something cognitively extraordinary: holding two realities at once — what the object IS and what it REPRESENTS. This is the foundation of abstract thinking.', 'Imagination', 24, 30, 'en'),
('🚫', 'The Power of "No"', '{child_name}''s constant "no" isn''t defiance — it''s one of the most important developmental achievements. They''re discovering they''re a separate person with their own preferences. Erikson calls this autonomy vs. shame. Every "no" is agency practice.', 'Social-Emotional', 24, 30, 'en');

-- DAILY TIPS (ES + EN)
INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Cuando {child_name} diga "yo solo/a", respira y déjale intentar — aunque tarde 5 veces más. La autonomía se construye en esos momentos de paciencia tuya.', 24, 30, 'es'),
('When {child_name} says "me do it," take a breath and let them try — even if it takes 5 times longer. Autonomy is built in those moments of your patience.', 24, 30, 'en');

-- ARTICLES (ES)
INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('💣', 'Las rabietas son tormentas cerebrales', 'article', 'Socio-Emocional', 'El cerebro de un niño de 2 años literalmente no puede regular emociones intensas todavía.', 'A los 2 años, la corteza prefrontal — la parte del cerebro responsable de regular emociones — está apenas en construcción. Cuando {child_name} tiene una rabieta, no es manipulación ni mal comportamiento. Es una tormenta neurológica real: el sistema límbico (emociones) se activa con toda su fuerza y no hay "freno" cortical desarrollado aún.

**Lo que la ciencia dice:**
Las investigaciones de Adele Diamond muestran que el control inhibitorio — la capacidad de pausar una reacción emocional — no madura significativamente hasta los 3-4 años, y sigue desarrollándose hasta la adolescencia.

**Lo que esto significa para ti:**
Tu trabajo NO es prevenir las rabietas (imposible), sino ser el regulador externo. Cuando te mantienes calmado/a durante la tormenta, literalmente le estás enseñando a su cerebro cómo se siente la regulación. Tu calma es su modelo.

**Lo que puedes hacer:**
Baja a su nivel, valida la emoción ("Estás muy enojado/a porque querías la galleta"), y espera. No razones en medio de la tormenta — el cerebro racional no está disponible. Después, cuando la calma vuelva, ahí sí puedes hablar sobre lo que pasó.', 4, 24, 30, 'es'),

('🗣️', 'De 50 palabras a 300: el milagro del lenguaje', 'article', 'Lenguaje', 'Tu hijo/a está en la fase más rápida de adquisición de lenguaje de toda su vida.', 'Entre los 24 y 30 meses, el vocabulario de {child_name} puede pasar de 50 a más de 300 palabras. Pero lo más fascinante no son las palabras — son las combinaciones. Las primeras frases de dos palabras ("más leche", "mamá zapato") son un salto cognitivo enorme: significan que {child_name} entiende que las palabras tienen RELACIONES entre sí.

**La investigación clave:**
Un estudio del MIT (2018) descubrió que lo que más impulsa el desarrollo del lenguaje no es la cantidad de palabras que escucha un niño, sino los TURNOS conversacionales. Cuando tú dices algo, ellos responden, tú contestas — esos intercambios activan el área de Broca más que cualquier otra experiencia lingüística.

**Técnica poderosa: la expansión**
Cuando {child_name} dice "perro grande", tú expandes: "¡Sí! Es un perro muy grande y tiene pelo marrón." No corrijas — expande. Esto modela gramática sin presionar, y cada expansión le da 3-4 palabras nuevas en contexto.', 5, 24, 30, 'es'),

('🧸', 'El juego simbólico: por qué un palo puede ser una espada', 'guide', 'Cognitivo', 'El juego de "hacer como si" es una de las hazañas cognitivas más complejas de la infancia temprana.', 'Cuando {child_name} finge que una caja es un carro o que un plátano es un teléfono, está demostrando "función simbólica" — la capacidad de usar una cosa para representar otra. Esto es EXACTAMENTE la misma habilidad que necesitará para entender que las letras representan sonidos y que los números representan cantidades.

**Cómo apoyarlo:**
- Proporciona materiales abiertos: cajas, telas, bloques, cucharas. Cuanto menos definido el objeto, más trabaja la imaginación.
- Cuando te inviten al juego, sigue SU guion. Si dicen que la silla es un barco, tú eres marinero.
- Narrar el juego simbólico lo potencia: "Veo que estás cocinando una sopa para el oso."

**Lo que NO hacer:**
No corrijas la "lógica" del juego imaginario. Si el dinosaurio vuela, el dinosaurio vuela. La coherencia no es el punto — la flexibilidad mental sí.

**Dato fascinante:**
Los niños que participan en más juego simbólico a los 2-3 años muestran mejor teoría de la mente (comprensión de que otros tienen pensamientos diferentes) a los 4-5 años.', 5, 24, 30, 'es'),

('🧠', 'La memoria que construye identidad', 'research', 'Cognitivo', 'A esta edad empiezan los primeros recuerdos autobiográficos — los que formarán su historia personal.', 'Alrededor de los 2 años, {child_name} está comenzando a formar memorias autobiográficas — recuerdos de experiencias personales que persisten en el tiempo. Esto es diferente de la memoria de procedimiento (cómo caminar) o la memoria semántica (qué es un perro).

**Por qué importa:**
Las investigaciones de Katherine Nelson muestran que los padres que practican "narrativa elaborativa" — hablar sobre eventos pasados con detalle ("¿Te acuerdas cuando fuimos al parque y viste el pato grande?") — tienen hijos con memorias autobiográficas más ricas y tempranas.

**La conexión con identidad:**
Estos primeros recuerdos se convierten en los ladrillos de la narrativa personal. "Yo soy alguien que fue al parque y vio patos" es el comienzo de "yo soy alguien que ama la naturaleza." La identidad se construye sobre memoria.

**Cómo nutrir esto:**
Habla sobre el pasado reciente: "Esta mañana desayunamos pancakes, ¿te acuerdas?" Mira fotos juntos y narra. Esto entrena el hipocampo y construye las bases de la autobiografía.', 6, 24, 30, 'es'),

('⚡', 'Autonomía: la batalla que necesitas perder', 'article', 'Socio-Emocional', 'Cada vez que tu hijo insiste en hacerlo solo, está construyendo la base de la confianza en sí mismo.', 'Erikson identificó que la tarea principal de los 18 meses a los 3 años es resolver la crisis de AUTONOMÍA vs. VERGÜENZA. Cada vez que {child_name} insiste en ponerse los zapatos solo/a (aunque estén al revés), en elegir su ropa, o en servirse el agua — está practicando autonomía.

**La paradoja:**
Si interviendes demasiado ("déjame hacerlo yo que es más rápido"), el mensaje implícito es "no eres capaz." Si nunca pones límites, el mensaje es "nadie te contiene." El punto dulce está en OFRECER OPCIONES dentro de límites: "¿Quieres la camiseta azul o la roja?" — no "¿Qué quieres ponerte?" (demasiado abierto) ni "Ponte esta" (cero autonomía).

**Estrategia práctica:**
Identifica 3 momentos del día donde puedes dar control total: elegir el snack, elegir el libro antes de dormir, elegir si ir al parque o al jardín. Esos 3 momentos construyen más confianza que cualquier elogio.', 4, 24, 30, 'es');

-- ARTICLES (EN)
INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('💣', 'Tantrums Are Brain Storms', 'article', 'Social-Emotional', 'A 2-year-old''s brain literally cannot regulate intense emotions yet.', 'At age 2, the prefrontal cortex — the part of the brain responsible for emotion regulation — is barely under construction. When {child_name} has a tantrum, it''s not manipulation or bad behavior. It''s a real neurological storm: the limbic system (emotions) fires at full force with no developed cortical "brake" yet.

**What the science says:**
Adele Diamond''s research shows that inhibitory control — the ability to pause an emotional reaction — doesn''t significantly mature until 3-4 years, and continues developing through adolescence.

**What this means for you:**
Your job is NOT to prevent tantrums (impossible), but to be the external regulator. When you stay calm during the storm, you''re literally teaching their brain what regulation feels like.

**What you can do:**
Get down to their level, validate ("You''re really angry because you wanted the cookie"), and wait. Don''t reason mid-storm — the rational brain isn''t available. After calm returns, then you can talk about what happened.', 4, 24, 30, 'en'),

('🗣️', 'From 50 Words to 300: The Language Miracle', 'article', 'Language', 'Your child is in the fastest language acquisition phase of their entire life.', 'Between 24 and 30 months, {child_name}''s vocabulary can jump from 50 to over 300 words. But the most fascinating thing isn''t the words — it''s the combinations. Those first two-word phrases ("more milk," "mama shoe") are a huge cognitive leap: they mean {child_name} understands that words have RELATIONSHIPS.

**Key research:**
An MIT study (2018) found that what drives language development most isn''t word quantity but CONVERSATIONAL TURNS. When you say something, they respond, you reply — those exchanges activate Broca''s area more than any other linguistic experience.

**Powerful technique: expansion**
When {child_name} says "big dog," you expand: "Yes! That''s a very big dog with brown fur." Don''t correct — expand. This models grammar without pressure.', 5, 24, 30, 'en'),

('🧸', 'Symbolic Play: Why a Stick Can Be a Sword', 'guide', 'Cognitive', 'Pretend play is one of the most cognitively complex feats of early childhood.', 'When {child_name} pretends a box is a car or a banana is a phone, they''re demonstrating "symbolic function" — using one thing to represent another. This is EXACTLY the same skill needed to understand that letters represent sounds and numbers represent quantities.

**How to support it:**
- Provide open-ended materials: boxes, fabrics, blocks, spoons. The less defined, the more imagination works.
- When invited to play, follow THEIR script.
- Narrate symbolic play: "I see you''re cooking soup for the bear."

**Fascinating fact:**
Children who engage in more symbolic play at 2-3 show better theory of mind at 4-5.', 5, 24, 30, 'en'),

('🧠', 'The Memory That Builds Identity', 'research', 'Cognitive', 'At this age, the first autobiographical memories begin — the ones that will form their personal story.', 'Around age 2, {child_name} is beginning to form autobiographical memories — personal experience memories that persist over time.

**Key research:**
Katherine Nelson''s studies show that parents who practice "elaborative narration" — discussing past events in detail — have children with richer, earlier autobiographical memories.

**How to nurture this:**
Talk about the recent past: "This morning we had pancakes, remember?" Look at photos together and narrate. This trains the hippocampus and builds the foundation of autobiography.', 6, 24, 30, 'en'),

('⚡', 'Autonomy: The Battle You Need to Lose', 'article', 'Social-Emotional', 'Every time your child insists on doing it alone, they''re building the foundation of self-confidence.', 'Erikson identified that the main task from 18 months to 3 years is resolving AUTONOMY vs. SHAME. Every time {child_name} insists on putting on shoes alone (even backwards) — they''re practicing autonomy.

**The sweet spot:**
Offer CHOICES within limits: "Blue shirt or red shirt?" Not "What do you want to wear?" (too open) or "Wear this" (zero autonomy).

**Practical strategy:**
Identify 3 daily moments where you can give full control: choosing the snack, choosing the bedtime book, choosing park or garden. Those 3 moments build more confidence than any praise.', 4, 24, 30, 'en');


-- ────────────────────────────────────────────────────────────
-- 30-36 MONTHS (2.5 - 3 years)
-- Theme: "Why?" explosion, theory of mind, order sensitivity
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('❓', 'La máquina de los "por qué"', '{child_name} puede preguntar "¿por qué?" decenas de veces al día. No es para molestarte — está construyendo modelos causales del mundo. Cada "¿por qué?" es un intento genuino de entender cómo funciona la realidad. Tómalo en serio: estás frente a un científico en formación.', 'Pensamiento Científico', 30, 36, 'es'),
('📏', 'La era del orden', 'Si {child_name} se desespera porque cortaste el sándwich "mal" o porque alguien se sentó en "su" silla, está en un período sensible de ORDEN (Montessori). El orden externo le da seguridad interna. No es rigidez — es cómo su cerebro organiza un mundo que aún es impredecible.', 'Cognitivo', 30, 36, 'es'),
('👫', 'El juego paralelo evoluciona', '{child_name} está pasando del juego paralelo (al lado de otros niños) al juego asociativo (con otros niños). Empieza a notar, imitar, y reaccionar a lo que hacen los demás. Es el nacimiento de la vida social compleja.', 'Social', 30, 36, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('❓', 'The "Why?" Machine', '{child_name} might ask "why?" dozens of times a day. They''re not annoying you — they''re building causal models of the world. Each "why?" is a genuine attempt to understand how reality works. Take it seriously: you''re with a scientist in training.', 'Scientific Thinking', 30, 36, 'en'),
('📏', 'The Age of Order', 'If {child_name} melts down because you cut the sandwich "wrong" or someone sat in "their" chair, they''re in a sensitive period for ORDER (Montessori). External order gives internal security. It''s not rigidity — it''s how their brain organizes an unpredictable world.', 'Cognitive', 30, 36, 'en'),
('👫', 'Parallel Play Evolves', '{child_name} is transitioning from parallel play (beside other kids) to associative play (with other kids). They''re starting to notice, imitate, and react to what others do. This is the birth of complex social life.', 'Social', 30, 36, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Cuando {child_name} pregunte "¿por qué?", antes de responder prueba devolver la pregunta: "¿Tú por qué crees?" Esto activa su razonamiento en lugar de solo recibir datos.', 30, 36, 'es'),
('When {child_name} asks "why?", before answering try returning the question: "Why do YOU think?" This activates their reasoning instead of just receiving information.', 30, 36, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('❓', 'La fase del "¿por qué?": el motor de la ciencia', 'article', 'Cognitivo', 'Cada "¿por qué?" es una investigación científica en miniatura.', 'Alrededor de los 2.5 años, {child_name} entra en una de las fases más intensas de curiosidad de toda la infancia: la fase del "¿por qué?". Un estudio clásico de Chouinard (2007) documentó que niños de esta edad hacen un promedio de 76 preguntas por hora durante conversaciones.

**No todas las preguntas son iguales:**
Las investigaciones distinguen entre preguntas de "etiqueta" ("¿qué es eso?") y preguntas de "explicación" ("¿por qué llueve?"). A los 30 meses, {child_name} está transitando de las primeras a las segundas — un salto cognitivo enorme.

**Cómo responder:**
- Toma cada pregunta en serio, incluso la número 47 del día.
- Está bien decir "no sé, ¡vamos a averiguarlo juntos!"
- Devuelve la pregunta: "¿Tú qué crees?" Esto activa su razonamiento causal.
- Si la misma pregunta se repite, probablemente la respuesta anterior no satisfizo su modelo mental. Intenta explicar diferente.', 5, 30, 36, 'es'),

('🫣', 'Mentiras, fantasía, y la verdad sobre la verdad', 'article', 'Socio-Emocional', 'Las primeras "mentiras" de tu hijo son en realidad un logro cognitivo impresionante.', 'Cuando {child_name} dice que no se comió la galleta (con chocolate en la cara), no está siendo deshonesto/a en el sentido adulto. Está demostrando un avance cognitivo fascinante: la comprensión de que tú y él/ella pueden tener conocimientos DIFERENTES.

**La ciencia detrás:**
Para "mentir", un niño necesita: (1) entender que tú no sabes lo que él sabe, (2) construir una narrativa alternativa, y (3) presentarla convincentemente. Eso requiere teoría de la mente + función ejecutiva + lenguaje. ¡Es impresionante!

**Qué hacer:**
No castigues la "mentira" — es el cerebro practicando perspectiva. En vez de "¡no mientas!", prueba: "Mmm, veo chocolate en tu cara. ¿Qué pasó?" Esto modela honestidad sin vergüenza.', 4, 30, 36, 'es'),

('📋', 'Rituales y rutinas: por qué el orden importa tanto', 'guide', 'Desarrollo General', 'No es terquedad — es un período sensible de orden que da seguridad.', 'Si {child_name} insiste en que las cosas se hagan siempre igual — el mismo plato, el mismo camino al parque, los zapatos en el mismo orden — está en pleno período sensible de orden, identificado por Montessori como uno de los más intensos entre los 2 y 4 años.

**Por qué pasa:**
El mundo es abrumadoramente complejo para un cerebro de 2.5 años. El orden externo (rutinas, secuencias, lugares fijos) reduce la carga cognitiva y proporciona una base de seguridad desde la cual explorar lo nuevo.

**Cómo apoyarlo:**
- Mantén rutinas predecibles para las transiciones: despertar, comida, baño, dormir.
- Avisa ANTES de los cambios: "Después de este libro, nos vamos a bañar."
- Cuando el orden se rompe (y se va a romper), valida: "Sé que querías el plato azul. Es difícil cuando las cosas cambian."

**La recompensa a largo plazo:**
Los niños que viven períodos de orden satisfechos desarrollan mejor capacidad de planificación, secuenciación, y organización — funciones ejecutivas clave.', 5, 30, 36, 'es'),

('🎪', 'Juego de roles: más que disfrazarse', 'research', 'Cognitivo', 'Cuando juega a ser doctor, bombero o mamá, practica empatía, lenguaje y resolución de problemas.', 'El juego de roles (o juego sociodramático) emerge con fuerza entre los 2.5 y 3 años. Cuando {child_name} juega a ser doctor, a cocinar, o a ser mamá/papá de un muñeco, está haciendo mucho más que imitar.

**Lo que practica simultáneamente:**
- **Lenguaje:** Adopta registros de habla diferentes ("ahora tómese la medicina" vs. cómo habla normalmente)
- **Regulación emocional:** Practica emociones en un espacio seguro
- **Teoría de la mente:** Se pone literalmente en el lugar de otro
- **Planificación:** Construye narrativas con inicio, desarrollo, y fin
- **Negociación social:** "Tú eres el paciente y yo la doctora"

**Dato de investigación:**
Un metaanálisis de Lillard et al. (2013) encontró que el juego de roles está consistentemente correlacionado con mejores habilidades de lenguaje, regulación emocional, y funciones ejecutivas.

**Cómo nutrir el juego de roles:**
Proporciona materiales abiertos: ropa vieja, sombreros, cajas, utensilios de cocina reales (seguros). Cuando te inviten, sigue SU guion — resiste dirigir la historia.', 6, 30, 36, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('❓', 'The "Why?" Phase: The Engine of Science', 'article', 'Cognitive', 'Every "why?" is a miniature scientific investigation.', 'Around 2.5 years, {child_name} enters one of the most intense curiosity phases of childhood. Chouinard (2007) documented that children this age ask an average of 76 questions per hour during conversations.

**How to respond:**
- Take every question seriously, even #47.
- "I don''t know, let''s find out together!" is a perfect answer.
- Return the question: "What do YOU think?"
- If the same question repeats, your previous answer probably didn''t satisfy their mental model.', 5, 30, 36, 'en'),

('🫣', 'Lies, Fantasy, and the Truth About Truth', 'article', 'Social-Emotional', 'Your child''s first "lies" are actually an impressive cognitive achievement.', 'When {child_name} says they didn''t eat the cookie (with chocolate on their face), they''re not being dishonest in the adult sense. They''re demonstrating a fascinating cognitive advance: understanding that you and they can have DIFFERENT knowledge.

**To "lie," a child needs:** (1) theory of mind, (2) narrative construction, (3) convincing presentation. That requires perspective-taking + executive function + language. Impressive!

**What to do:**
Don''t punish the "lie." Try: "Hmm, I see chocolate on your face. What happened?" This models honesty without shame.', 4, 30, 36, 'en'),

('📋', 'Rituals and Routines: Why Order Matters So Much', 'guide', 'General Development', 'It''s not stubbornness — it''s a sensitive period for order that provides security.', 'If {child_name} insists things always happen the same way — same plate, same path to the park — they''re in Montessori''s sensitive period for order, most intense between 2 and 4.

**Why it happens:**
The world is overwhelmingly complex for a 2.5-year-old brain. External order reduces cognitive load and provides a security base.

**How to support it:**
- Keep predictable routines for transitions.
- Warn BEFORE changes: "After this book, it''s bath time."
- When order breaks, validate: "I know you wanted the blue plate."

**Long-term payoff:**
Children with satisfied order periods develop better planning, sequencing, and organization — key executive functions.', 5, 30, 36, 'en'),

('🎪', 'Role Play: More Than Dressing Up', 'research', 'Cognitive', 'Playing doctor, firefighter, or parent practices empathy, language, and problem-solving.', 'Sociodramatic play emerges strongly between 2.5 and 3 years. When {child_name} plays doctor or pretends to cook, they''re simultaneously practicing language registers, emotional regulation, theory of mind, planning, and social negotiation.

**Research:**
Lillard et al. (2013) meta-analysis found role play consistently correlates with better language, emotional regulation, and executive functions.

**How to nurture it:**
Provide open-ended materials: old clothes, hats, boxes, real (safe) kitchen utensils. When invited, follow THEIR script.', 6, 30, 36, 'en');


-- ────────────────────────────────────────────────────────────
-- 36-42 MONTHS (3 - 3.5 years)
-- Theme: Theory of mind, friendship, counting with meaning
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🧩', 'La revolución del pensamiento', '{child_name} está empezando a entender que otras personas piensan diferente a él/ella. Esto se llama "teoría de la mente" y transforma TODO: la empatía, las amistades, la comunicación, y hasta el humor. Es uno de los avances más importantes de la infancia.', 'Cognitivo', 36, 42, 'es'),
('🔢', 'Contar con significado', 'Cuando {child_name} cuenta "1, 2, 3, 5, 8" no está equivocándose — está practicando la SECUENCIA. El siguiente paso, entender que "3" SIGNIFICA tres objetos (correspondencia uno-a-uno), llegará pronto. Cuenta todo con él/ella: escalones, uvas, dedos.', 'Matemáticas', 36, 42, 'es'),
('🤝', 'Las primeras amistades reales', '{child_name} está pasando de "juego al lado de otros" a "juego CON otros." Las primeras amistades verdaderas están naciendo — con preferencias, conflictos, negociaciones, y reparaciones. Cada pelea por un juguete es una clase magistral de habilidades sociales.', 'Social', 36, 42, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🧩', 'The Thinking Revolution', '{child_name} is beginning to understand that other people think differently. This is called "theory of mind" and it transforms EVERYTHING: empathy, friendships, communication, and even humor. One of childhood''s most important advances.', 'Cognitive', 36, 42, 'en'),
('🔢', 'Counting With Meaning', 'When {child_name} counts "1, 2, 3, 5, 8" they''re not making mistakes — they''re practicing SEQUENCE. Understanding that "3" MEANS three objects (one-to-one correspondence) comes next. Count everything together: stairs, grapes, fingers.', 'Mathematics', 36, 42, 'en'),
('🤝', 'First Real Friendships', '{child_name} is shifting from playing beside others to playing WITH others. First true friendships are forming — with preferences, conflicts, negotiations, and repairs. Every toy fight is a masterclass in social skills.', 'Social', 36, 42, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Hoy cuenta cosas con {child_name}: escalones, galletas, juguetes. La correspondencia uno-a-uno (señalar cada objeto al contar) es la base de TODAS las matemáticas futuras.', 36, 42, 'es'),
('Today, count things with {child_name}: stairs, crackers, toys. One-to-one correspondence (pointing at each object while counting) is the foundation of ALL future mathematics.', 36, 42, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🧠', 'Teoría de la mente: el superpoder que está naciendo', 'article', 'Cognitivo', 'Tu hijo está descubriendo que otras personas tienen pensamientos y sentimientos diferentes a los suyos.', 'Entre los 3 y 4 años, {child_name} desarrolla "teoría de la mente" — la capacidad de entender que otras personas tienen creencias, deseos y conocimientos diferentes. Es el avance cognitivo más transformador de la primera infancia.

**La prueba clásica:**
En el test de Sally-Anne, se le muestra a un niño que Sally pone una canica en una canasta y se va. Anne mueve la canica a una caja. ¿Dónde buscará Sally? Antes de los 3-4 años, los niños dicen "en la caja" — porque ELLOS saben que está ahí. Después de desarrollar teoría de la mente, dicen "en la canasta" — porque entienden lo que Sally CREE.

**Cómo se manifiesta en la vida diaria:**
- Intentos de consolar a alguien triste
- Mentiras más elaboradas (requieren modelar lo que el otro sabe)
- Humor: ¡los chistes requieren predecir lo que el otro espera!
- Negociación: "Si me das ese juguete, te presto este"

**Cómo nutrirlo:**
Lee cuentos y pregunta: "¿Cómo crees que se siente este personaje? ¿Por qué hizo eso?" Habla sobre emociones propias: "Estoy un poco frustrado/a porque se me cayó el café."', 5, 36, 42, 'es'),

('⚔️', 'Conflictos entre niños: tu guía de no-intervención', 'guide', 'Social', 'Cada pelea por un juguete es una oportunidad de aprendizaje social que la intervención adulta a menudo interrumpe.', 'La investigación de Michael Tomasello demuestra que los niños de 3 años son capaces de negociar, compartir, y resolver conflictos — PERO necesitan oportunidades para practicar. Cuando un adulto interviene inmediatamente ("¡hay que compartir!"), priva al niño de la práctica.

**Cuándo NO intervenir (supervisar, pero dejar):**
- Disputas verbales por turnos o juguetes
- Negociaciones en curso ("yo primero, luego tú")
- Frustraciones menores que el niño puede manejar

**Cuándo SÍ intervenir:**
- Agresión física
- Un niño claramente abrumado y pidiendo ayuda
- Desequilibrio de poder persistente

**Si intervienes, guía en vez de resolver:**
En vez de "dale el juguete", prueba: "Veo que los dos quieren el camión. ¿Qué podemos hacer?" Esto enseña resolución de problemas en vez de obediencia.', 5, 36, 42, 'es'),

('🔢', 'Matemáticas escondidas en la vida cotidiana', 'article', 'Matemáticas', 'Tu hijo ya hace matemáticas todo el día — solo que no se ven como ecuaciones.', 'Cuando {child_name} compara "el tuyo es más grande", cuando reparte galletas "una para ti, una para mí", cuando nota que faltan piezas en un rompecabezas — está haciendo matemáticas. Las investigaciones de Clements & Sarama (2009) muestran que los conceptos matemáticos tempranos son el predictor más fuerte de rendimiento académico posterior — ¡más que la lectura!

**Matemáticas escondidas en cada día:**
- Cocina: medir, contar, "necesitamos 3 huevos"
- Mesa: "pon un tenedor para cada persona" (correspondencia uno-a-uno)
- Vestirse: "primero calcetines, luego zapatos" (secuenciación)
- Caminar: "¿hay más perros o gatos en esta cuadra?" (comparación)

**Lo que NO hacer:**
No conviertas cada momento en una "lección." Incorpora naturalmente: "¿me pasas DOS servilletas?" es suficiente. La presión mata la curiosidad matemática.', 5, 36, 42, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🧠', 'Theory of Mind: The Superpower Being Born', 'article', 'Cognitive', 'Your child is discovering that other people have thoughts and feelings different from theirs.', 'Between 3 and 4, {child_name} develops theory of mind — understanding that others have different beliefs, desires, and knowledge.

**The classic test (Sally-Anne):**
Before developing theory of mind, children say Sally will look where the marble actually is. After, they understand where Sally BELIEVES it is.

**How to nurture it:**
Read stories and ask: "How do you think this character feels?" Talk about your own emotions: "I''m a bit frustrated because I spilled my coffee."', 5, 36, 42, 'en'),

('⚔️', 'Kid Conflicts: Your Guide to Not Intervening', 'guide', 'Social', 'Every toy fight is a social learning opportunity that adult intervention often interrupts.', 'Michael Tomasello''s research shows 3-year-olds can negotiate, share, and resolve conflicts — but need practice opportunities.

**When NOT to intervene:** verbal disputes, negotiations in progress, minor frustrations.
**When to intervene:** physical aggression, a child clearly overwhelmed, persistent power imbalance.
**If you do intervene, guide don''t solve:** "I see you both want the truck. What can we do?"', 5, 36, 42, 'en'),

('🔢', 'Hidden Math in Everyday Life', 'article', 'Mathematics', 'Your child is already doing math all day — it just doesn''t look like equations.', 'Clements & Sarama (2009) show early math concepts are the strongest predictor of later academic achievement — more than reading!

**Hidden math every day:**
- Cooking: measuring, counting, "we need 3 eggs"
- Table: "put one fork for each person" (one-to-one correspondence)
- Dressing: "socks first, then shoes" (sequencing)
- Walking: "are there more dogs or cats on this block?" (comparison)', 5, 36, 42, 'en');


-- ────────────────────────────────────────────────────────────
-- 42-48 MONTHS (3.5 - 4 years)
-- Theme: Stories, self-regulation games, drawing as thinking
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📖', 'La era de las historias', '{child_name} está empezando a pensar en NARRATIVAS: principio, medio, y final. Cuando te cuenta algo que pasó en el día (aunque sea desordenado), está construyendo pensamiento narrativo — la base de la comprensión lectora, la planificación, y la identidad.', 'Lenguaje', 42, 48, 'es'),
('🎨', 'Los dibujos son pensamientos', 'Cada dibujo de {child_name} es un mapa de su pensamiento actual. Los "renacuajos" (círculos con líneas = personas) muestran qué es importante para su cerebro: caras y extremidades. No corrijas — pregunta: "¿Me cuentas sobre tu dibujo?"', 'Cognitivo', 42, 48, 'es'),
('🛑', 'Aprendiendo a frenar', '{child_name} está en pleno desarrollo del control inhibitorio — la capacidad de PARAR un impulso. Juegos como Simón Dice, Luz Roja/Luz Verde, y "estatuas" son entrenamiento puro de funciones ejecutivas. Cada partida fortalece su corteza prefrontal.', 'Funciones Ejecutivas', 42, 48, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📖', 'The Story Era', '{child_name} is beginning to think in NARRATIVES: beginning, middle, end. When they tell you about their day (however jumbled), they''re building narrative thinking — the foundation of reading comprehension, planning, and identity.', 'Language', 42, 48, 'en'),
('🎨', 'Drawings Are Thoughts', 'Every drawing is a map of {child_name}''s current thinking. "Tadpole people" (circles with lines) show what matters to their brain: faces and limbs. Don''t correct — ask: "Tell me about your drawing?"', 'Cognitive', 42, 48, 'en'),
('🛑', 'Learning to Brake', '{child_name} is actively developing inhibitory control — the ability to STOP an impulse. Games like Simon Says, Red Light/Green Light, and Freeze Dance are pure executive function training. Each round strengthens their prefrontal cortex.', 'Executive Functions', 42, 48, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Juega "Simón Dice" con {child_name} hoy. Parece simple, pero requiere: escuchar, recordar la regla, inhibir el impulso de moverse. Es gimnasia para la corteza prefrontal.', 42, 48, 'es'),
('Play Simon Says with {child_name} today. Seems simple, but requires: listening, remembering the rule, inhibiting the impulse to move. It''s a workout for the prefrontal cortex.', 42, 48, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🎮', 'Juegos de reglas: el gimnasio invisible del cerebro', 'article', 'Funciones Ejecutivas', 'Simón Dice, escondidas, y juegos de mesa no son diversión pasiva — son el entrenamiento más potente para el cerebro.', 'La investigación de Adele Diamond es contundente: las funciones ejecutivas (control inhibitorio, memoria de trabajo, flexibilidad cognitiva) predicen el éxito escolar y vital mejor que el IQ. Y se entrenan con JUEGO.

**Simón Dice** requiere: escuchar instrucción + recordar la regla (solo si dice "Simón dice") + inhibir el impulso de actuar sin la frase clave. Eso es control inhibitorio + memoria de trabajo en una sola actividad.

**Escondidas** requiere: planificación (dónde esconderme), control de impulsos (no reírme), memoria de trabajo (recordar dónde ya busqué), y flexibilidad (cambiar de estrategia si me encuentran rápido).

**El hallazgo clave de Diamond:**
Las funciones ejecutivas mejoran con actividades que traen alegría Y desafío — actividades que los niños QUIEREN repetir. El entrenamiento por repetición aburrida NO funciona. El juego sí.', 5, 42, 48, 'es'),

('✏️', 'La evolución del dibujo: ventana al pensamiento', 'guide', 'Cognitivo', 'Los dibujos de tu hijo revelan exactamente en qué nivel de abstracción opera su cerebro.', 'Entre los 3.5 y 4 años, los dibujos de {child_name} pasan de garabatos a "renacuajos" — figuras humanas con un círculo (cabeza) y líneas (piernas). Esto no es arte primitivo — es una proeza cognitiva.

**Las etapas del dibujo (Viktor Lowenfeld):**
- **Garabato controlado** (2-3 años): líneas con intención, no aleatorias
- **Forma con nombre** (3-4 años): "esto es mamá" aunque no se parezca
- **Pre-esquemática** (4-5 años): figuras reconocibles, detalles crecientes
- **Esquemática** (6-7 años): línea base, cielo arriba, sol en esquina

**NUNCA preguntes "¿qué es?"** Pregunta "¿me cuentas sobre tu dibujo?" La primera pregunta implica que debería SER algo. La segunda honra el proceso.

**Los colores importan menos de lo que crees:**
A esta edad, el color se elige por disponibilidad o preferencia, NO por representación. Un sol morado es perfectamente normal.', 4, 42, 48, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🎮', 'Rule Games: The Brain''s Invisible Gym', 'article', 'Executive Functions', 'Simon Says, hide-and-seek, and board games aren''t passive fun — they''re the most potent brain training.', 'Adele Diamond''s research is clear: executive functions predict school and life success better than IQ. And they''re trained through PLAY.

**Simon Says** requires: listening + remembering the rule + inhibiting the impulse to act without the key phrase. That''s inhibitory control + working memory in one activity.

**Diamond''s key finding:**
Executive functions improve with activities that bring joy AND challenge — activities children WANT to repeat. Boring drill doesn''t work. Play does.', 5, 42, 48, 'en'),

('✏️', 'The Evolution of Drawing: Window Into Thinking', 'guide', 'Cognitive', 'Your child''s drawings reveal exactly what level of abstraction their brain operates at.', 'Between 3.5 and 4, drawings evolve from scribbles to "tadpole people" — circles with lines. This is a cognitive achievement, not primitive art.

**NEVER ask "what is it?"** Ask "tell me about your drawing?" The first implies it should BE something. The second honors the process.

**Colors matter less than you think:**
At this age, color is chosen by availability or preference, NOT representation. A purple sun is perfectly normal.', 4, 42, 48, 'en');
