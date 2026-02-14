-- ============================================================
-- EXPLORE CONTENT SEED: 48-96 MONTHS (5 bands)
-- Spanish + English | Articles + Brain Cards + Daily Tips
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 48-54 MONTHS (4 - 4.5 years)
-- Theme: Complex pretend play, early literacy, empathy deepens
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🏰', 'El arquitecto de mundos', '{child_name} ya no solo imita la realidad — la INVENTA. Los mundos imaginarios que crea tienen reglas internas, personajes con motivaciones, y narrativas que duran días. Esto es pensamiento abstracto de alto nivel. Cada mundo imaginario es un modelo mental completo.', 'Imaginación', 48, 54, 'es'),
('📝', 'Las letras cobran vida', '{child_name} empieza a notar que las letras están EN TODAS PARTES — en carteles, cajas de cereal, pantallas. Esa fascinación es un período sensible de lectoescritura. No fuerces lecciones: señala letras en el mundo real y deja que la curiosidad haga el trabajo.', 'Lectoescritura', 48, 54, 'es'),
('💪', 'La mentalidad de "yo puedo"', 'A los 4, {child_name} empieza a compararse con otros: "Ella dibuja mejor que yo." Aquí se siembra la mentalidad de crecimiento o la mentalidad fija. Elogia el ESFUERZO ("trabajaste mucho en eso"), no el resultado ("qué bonito dibujo"). La diferencia es enorme.', 'Socio-Emocional', 48, 54, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🏰', 'The World Architect', '{child_name} no longer just imitates reality — they INVENT it. Their imaginary worlds have internal rules, characters with motivations, and narratives that last days. This is high-level abstract thinking. Every imaginary world is a complete mental model.', 'Imagination', 48, 54, 'en'),
('📝', 'Letters Come Alive', '{child_name} is starting to notice letters are EVERYWHERE — on signs, cereal boxes, screens. That fascination is a sensitive period for literacy. Don''t force lessons: point out letters in the real world and let curiosity do the work.', 'Literacy', 48, 54, 'en'),
('💪', 'The "I Can" Mindset', 'At 4, {child_name} starts comparing: "She draws better than me." This is where growth or fixed mindset is planted. Praise EFFORT ("you worked hard"), not outcome ("nice drawing"). The difference is enormous.', 'Social-Emotional', 48, 54, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Hoy cuando {child_name} te muestre algo que hizo, en vez de decir "¡qué bonito!" prueba: "Cuéntame cómo lo hiciste." Esto celebra el proceso, no solo el producto.', 48, 54, 'es'),
('Today when {child_name} shows you something they made, instead of "how pretty!" try: "Tell me how you did it." This celebrates process, not just product.', 48, 54, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🌱', 'Mentalidad de crecimiento: se siembra ahora', 'article', 'Socio-Emocional', 'Cómo elogias a tu hijo hoy determina cómo enfrentará los retos toda su vida.', 'La investigación de Carol Dweck en Stanford demostró que hay dos tipos de mentalidad: fija ("soy inteligente o no") y de crecimiento ("puedo mejorar con esfuerzo"). Lo fascinante es que la mentalidad se SIEMBRA en la infancia temprana, principalmente a través de cómo los adultos elogian.

**Elogio que crea mentalidad fija:** "Eres muy inteligente", "Eres un artista natural", "Qué bonito dibujo."
**Elogio que crea mentalidad de crecimiento:** "Trabajaste mucho en eso", "Noto que probaste de varias formas", "¡No te rendiste aunque fue difícil!"

**La diferencia en acción:**
Los niños elogiados por inteligencia EVITAN retos nuevos (no quieren arriesgar su etiqueta). Los elogiados por esfuerzo BUSCAN retos (saben que el esfuerzo es lo que vale).

**Cómo cambiar tu lenguaje:**
- "Eres tan listo/a" → "Pensaste mucho para resolver eso"
- "Qué bonito" → "Cuéntame sobre los colores que elegiste"
- "¡Perfecto!" → "Se nota que practicaste"', 5, 48, 54, 'es'),

('📖', 'Leer juntos: más allá de las palabras', 'guide', 'Lectoescritura', 'La lectura compartida a los 4 años predice el rendimiento académico hasta la secundaria.', 'Un metaanálisis de Bus et al. encontró que la lectura compartida entre padres e hijos es el predictor más consistente de éxito en lectoescritura. Pero no es SOLO leer — es CÓMO lees.

**Lectura dialógica (el estándar de oro):**
En vez de leer el texto y pasar la página, haz PAUSAS:
- "¿Qué crees que va a pasar?"
- "¿Cómo se siente este personaje? ¿Por qué?"
- "¿A ti te ha pasado algo así?"
- "Mira esta palabra — empieza con la misma letra que tu nombre"

**Frecuencia vs. duración:**
10 minutos de lectura atenta todos los días supera a 1 hora el fin de semana. La consistencia importa más que la cantidad.

**Deja que elijan:**
Si {child_name} quiere leer el mismo libro 20 veces, celebra. La repetición construye vocabulario, predicción, y comprensión narrativa. Cada vez que "leen" un libro conocido, están practicando fluencia.', 5, 48, 54, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🌱', 'Growth Mindset: It''s Planted Now', 'article', 'Social-Emotional', 'How you praise today determines how they''ll face challenges for life.', 'Carol Dweck''s Stanford research showed two mindset types: fixed ("I''m smart or not") and growth ("I can improve with effort"). Mindset is PLANTED in early childhood through how adults praise.

**Fixed mindset praise:** "You''re so smart", "Natural artist", "Beautiful drawing."
**Growth mindset praise:** "You worked hard on that", "You tried different ways", "You didn''t give up!"

**How to shift your language:**
- "You''re so clever" → "You really thought that through"
- "How pretty" → "Tell me about the colors you chose"
- "Perfect!" → "I can tell you practiced"', 5, 48, 54, 'en'),

('📖', 'Reading Together: Beyond the Words', 'guide', 'Literacy', 'Shared reading at age 4 predicts academic performance through middle school.', 'Bus et al. meta-analysis: shared reading is the most consistent predictor of literacy success. But it''s not just reading — it''s HOW.

**Dialogic reading (gold standard):**
Instead of reading text and turning pages, PAUSE:
- "What do you think will happen?"
- "How does this character feel? Why?"
- "Has something like this happened to you?"

**Frequency vs. duration:**
10 attentive minutes daily beats 1 hour on weekends. Consistency over quantity.', 5, 48, 54, 'en');


-- ────────────────────────────────────────────────────────────
-- 54-60 MONTHS (4.5 - 5 years)
-- Theme: Pre-school readiness, complex friendships, big questions
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🌍', 'Las preguntas existenciales', '{child_name} puede empezar a hacer preguntas profundas: "¿Por qué nos morimos?", "¿Dónde estaba yo antes de nacer?" No entres en pánico — son señales de un cerebro que piensa en abstracto. Responde honestamente, en términos simples, y está bien decir "no sé."', 'Cognitivo', 54, 60, 'es'),
('✂️', 'La motricidad fina florece', 'Recortar, colorear dentro de las líneas, abotonar, atar cordones — {child_name} está refinando su motricidad fina a un nivel que permite tareas cada vez más complejas. Cada tarea que "le cuesta" es exactamente la que más necesita practicar.', 'Motor', 54, 60, 'es'),
('🎲', 'Juegos con reglas complejas', '{child_name} ahora puede entender Y respetar reglas de juegos más complejos: esperar turno, seguir secuencias, aceptar perder. Cada juego de mesa es un entrenamiento de funciones ejecutivas, regulación emocional, y habilidades sociales — todo a la vez.', 'Funciones Ejecutivas', 54, 60, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🌍', 'The Existential Questions', '{child_name} may start asking deep questions: "Why do we die?", "Where was I before I was born?" Don''t panic — these signal abstract thinking. Answer honestly, simply, and it''s okay to say "I don''t know."', 'Cognitive', 54, 60, 'en'),
('✂️', 'Fine Motor Flourishes', 'Cutting, coloring inside lines, buttoning, tying — {child_name} is refining fine motor skills to handle increasingly complex tasks. Every task that "is hard" is exactly the one that needs the most practice.', 'Motor', 54, 60, 'en'),
('🎲', 'Complex Rule Games', '{child_name} can now understand AND follow complex game rules: waiting turns, following sequences, accepting losing. Every board game trains executive functions, emotional regulation, and social skills — all at once.', 'Executive Functions', 54, 60, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Si {child_name} pierde un juego y se frustra, resiste la tentación de dejarle ganar siempre. Perder con apoyo emocional construye resiliencia. "Es difícil perder, yo también me frustro a veces."', 54, 60, 'es'),
('If {child_name} loses a game and gets frustrated, resist always letting them win. Losing with emotional support builds resilience. "It''s hard to lose, I get frustrated too sometimes."', 54, 60, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🏫', '¿Está listo/a para la escuela? La pregunta equivocada', 'article', 'Desarrollo General', 'La verdadera preparación escolar no es saber letras y números — es saber regularse, colaborar, y persistir.', 'Los estudios longitudinales son claros: los predictores más fuertes de éxito escolar NO son las habilidades académicas (saber contar, reconocer letras), sino las habilidades SOCIO-EMOCIONALES: capacidad de esperar turno, seguir instrucciones de varios pasos, manejar frustración, y colaborar con otros.

**Lo que realmente importa para la escuela:**
1. **Regulación emocional:** ¿Puede calmarse después de una frustración?
2. **Funciones ejecutivas:** ¿Puede seguir instrucciones de 2-3 pasos?
3. **Habilidades sociales:** ¿Puede jugar cooperativamente?
4. **Autonomía:** ¿Puede ir al baño, comer, vestirse con mínima ayuda?
5. **Curiosidad:** ¿Hace preguntas? ¿Le interesa aprender?

**Cómo preparar sin presionar:**
- Juegos de mesa = turnos + reglas + perder con gracia
- Cocinar juntos = secuenciación + medición + paciencia
- Juego libre con otros niños = negociación + colaboración
- Leer juntos = comprensión + vocabulario + concentración

Lo académico (letras, números) vendrá naturalmente si las bases socio-emocionales están sólidas.', 6, 54, 60, 'es'),

('🫂', 'Empatía avanzada: cuando tu hijo consuela a otros', 'article', 'Socio-Emocional', 'A los 4-5 años, la empatía pasa de "yo también lloro cuando lloras" a "¿qué puedo hacer para ayudarte?"', 'Cerca de los 5 años, {child_name} desarrolla lo que los investigadores llaman "empatía prosocial" — no solo sentir lo que siente el otro, sino querer ACTUAR para ayudar. Es un salto enorme desde la empatía reactiva de los 2 años.

**Etapas de empatía (Martin Hoffman):**
1. **Contagio emocional** (0-1 año): llora cuando otro bebé llora
2. **Empatía egocéntrica** (1-2 años): ofrece SU osito al niño que llora
3. **Empatía por el otro** (3-4 años): intenta dar lo que el OTRO necesita
4. **Empatía abstracta** (5+ años): entiende que grupos enteros pueden sufrir

**Cómo nutrirla:**
- Habla sobre emociones de personajes en libros y películas
- Modela empatía: "El vecino está enfermo, le vamos a llevar sopa"
- No fuerces "pide perdón" — mejor: "¿Cómo crees que se sintió cuando pasó eso?"', 5, 54, 60, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🏫', 'Is My Child "Ready" for School? The Wrong Question', 'article', 'General Development', 'Real school readiness isn''t knowing letters and numbers — it''s self-regulation, collaboration, and persistence.', 'Longitudinal studies are clear: the strongest predictors of school success are NOT academic skills but SOCIO-EMOTIONAL ones: turn-taking, multi-step instructions, frustration management, and collaboration.

**What really matters:**
1. Emotional regulation: Can they calm down after frustration?
2. Executive functions: Can they follow 2-3 step instructions?
3. Social skills: Can they play cooperatively?
4. Autonomy: Bathroom, eating, dressing with minimal help?
5. Curiosity: Do they ask questions? Want to learn?

Academics come naturally if socio-emotional foundations are solid.', 6, 54, 60, 'en'),

('🫂', 'Advanced Empathy: When Your Child Comforts Others', 'article', 'Social-Emotional', 'At 4-5, empathy shifts from "I cry when you cry" to "what can I do to help you?"', 'Near age 5, {child_name} develops "prosocial empathy" — not just feeling what others feel, but wanting to ACT to help.

**Hoffman''s empathy stages:**
1. Emotional contagion (0-1): cries when another baby cries
2. Egocentric empathy (1-2): offers THEIR teddy to crying child
3. Other-oriented empathy (3-4): tries to give what the OTHER needs
4. Abstract empathy (5+): understands whole groups can suffer

**How to nurture it:**
Discuss emotions in books/movies. Model empathy. Don''t force "say sorry" — try: "How do you think they felt?"', 5, 54, 60, 'en');


-- ────────────────────────────────────────────────────────────
-- 60-72 MONTHS (5 - 6 years)
-- Theme: Reading takes off, moral reasoning, collections/classification
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📚', 'El despegue de la lectura', 'El cerebro de {child_name} está conectando sonidos con letras a una velocidad asombrosa. No todos despegan al mismo tiempo — el rango normal es enorme (4-7 años). Si {child_name} aún no lee, NO hay retraso. Si ya lee, no asumas que "va adelantado" — cada cerebro tiene su calendario.', 'Lectoescritura', 60, 72, 'es'),
('⚖️', 'El sentido de justicia', '"¡Eso no es justo!" es la frase favorita a esta edad — y con razón. {child_name} está desarrollando razonamiento moral: entiende reglas, equidad, y reciprocidad. Las discusiones sobre justicia son filosofía práctica. Tómalas en serio.', 'Moral', 60, 72, 'es'),
('🔬', 'El coleccionista científico', 'Si {child_name} colecciona piedras, estampas, bichos, o tapas de botella, está CLASIFICANDO — una operación cognitiva fundamental. Cada colección es un ejercicio de categorización, comparación, y pensamiento sistemático.', 'Cognitivo', 60, 72, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📚', 'Reading Takes Off', '{child_name}''s brain is connecting sounds to letters at remarkable speed. Not everyone takes off at the same time — normal range is huge (4-7 years). No reading yet? No delay. Already reading? Don''t assume "advanced" — every brain has its own timeline.', 'Literacy', 60, 72, 'en'),
('⚖️', 'The Sense of Justice', '"That''s not fair!" is the favorite phrase at this age — and rightly so. {child_name} is developing moral reasoning: understanding rules, equity, and reciprocity. Fairness discussions are practical philosophy. Take them seriously.', 'Moral', 60, 72, 'en'),
('🔬', 'The Scientific Collector', 'If {child_name} collects rocks, stamps, bugs, or bottle caps, they''re CLASSIFYING — a fundamental cognitive operation. Every collection is an exercise in categorization, comparison, and systematic thinking.', 'Cognitive', 60, 72, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Si {child_name} tiene una colección (piedras, figuritas, lo que sea), pregúntale cómo la organizaría. Por color, tamaño, tipo — cualquier criterio. Clasificar es pre-álgebra.', 60, 72, 'es'),
('If {child_name} has a collection (rocks, figures, anything), ask how they''d organize it. By color, size, type — any criterion. Classifying is pre-algebra.', 60, 72, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('📖', 'El timeline de la lectura: calma, cada cerebro tiene su ritmo', 'article', 'Lectoescritura', 'El rango normal para aprender a leer es de 4 a 7 años. Presionar antes de tiempo puede ser contraproducente.', 'En Finlandia — país con los mejores resultados de lectura del mundo — la instrucción formal de lectura no empieza hasta los 7 años. Y sus niños terminan leyendo MEJOR que los de países donde se empieza a los 4. ¿Por qué?

**Lo que la ciencia dice:**
La lectura requiere la maduración de varias áreas cerebrales simultáneamente: procesamiento fonológico, memoria visual, atención sostenida, y comprensión lingüística. Estas áreas maduran a ritmos diferentes en cada niño.

**Señales de que el cerebro está listo (no se fuerzan, se observan):**
- Reconoce su nombre escrito
- Nota que las palabras tienen partes (sílabas, sonidos iniciales)
- Pretende "leer" libros conocidos
- Pregunta "¿qué dice ahí?"

**Lo que SÍ hacer antes de que lea:**
- Rimas, canciones, juegos de palabras (conciencia fonológica)
- Leer juntos MUCHO
- Letras en el ambiente (señalar carteles, escribir su nombre)
- NO fichas, NO drills, NO presión', 5, 60, 72, 'es'),

('🧭', 'Juicio moral: cuando las reglas importan', 'research', 'Moral', 'A los 5-6 años, tu hijo no solo sigue reglas — las EVALÚA. Y eso cambia todo.', 'Piaget describió que entre los 5 y 7 años, los niños pasan de una moral heterónoma ("las reglas son las reglas") a una moral de cooperación ("las reglas deben ser justas"). {child_name} ya no acepta reglas solo porque un adulto las dijo — necesita que tengan SENTIDO.

**Kohlberg profundizó:**
A esta edad, la motivación moral es principalmente: "¿Qué gano yo?" y "¿Es justo?" Esto NO es egoísmo — es la base sobre la cual se construirá la moral más abstracta de la adolescencia.

**Cómo nutrir el razonamiento moral:**
- Cuando {child_name} diga "no es justo", resiste la tentación de invalidar. Pregunta: "¿Por qué no te parece justo? ¿Qué sería justo?"
- Usa dilemas de historias: "¿Qué debería hacer el personaje? ¿Por qué?"
- Sé consistente con las reglas Y flexible con las razones.', 6, 60, 72, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('📖', 'The Reading Timeline: Every Brain Has Its Rhythm', 'article', 'Literacy', 'The normal range for learning to read is 4 to 7 years. Pushing too early can backfire.', 'In Finland — the country with the world''s best reading scores — formal reading instruction doesn''t start until age 7. Their children end up reading BETTER than those in countries starting at 4.

**Signs the brain is ready (observe, don''t force):**
- Recognizes their written name
- Notices words have parts (syllables, initial sounds)
- Pretends to "read" familiar books
- Asks "what does that say?"

**What TO do before reading clicks:** Rhymes, songs, word games, reading together A LOT, letters in the environment. NO worksheets, NO drills, NO pressure.', 5, 60, 72, 'en'),

('🧭', 'Moral Reasoning: When Rules Matter', 'research', 'Moral', 'At 5-6, your child doesn''t just follow rules — they EVALUATE them.', 'Piaget described that between 5-7, children shift from heteronomous morality ("rules are rules") to cooperative morality ("rules should be fair"). {child_name} no longer accepts rules just because an adult said so — they need to make SENSE.

**How to nurture moral reasoning:**
- When they say "that''s not fair," ask: "Why not? What would be fair?"
- Use story dilemmas: "What should the character do? Why?"
- Be consistent with rules AND flexible with reasons.', 6, 60, 72, 'en');


-- ────────────────────────────────────────────────────────────
-- 72-84 MONTHS (6 - 7 years)
-- Theme: Industry begins, reading fluency, project thinking
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🏗️', 'La era de los proyectos', '{child_name} ahora puede mantener un proyecto durante días o semanas: construir un fuerte, crear un cómic, armar una colección. Esta capacidad de planificar, ejecutar, y completar es Erikson''s "industria" — y es la base de la productividad adulta.', 'Funciones Ejecutivas', 72, 84, 'es'),
('📐', 'Pensamiento lógico concreto', 'El cerebro de {child_name} está entrando en lo que Piaget llamó "operaciones concretas." Ahora puede entender conservación (la misma cantidad de agua en vasos diferentes), reversibilidad, y clasificación jerárquica. La lógica se enciende.', 'Cognitivo', 72, 84, 'es'),
('🤔', 'Metacognición: pensar sobre pensar', '{child_name} empieza a ser consciente de su PROPIO pensamiento. "No me acuerdo", "esto es difícil para mí", "ya lo entendí" — estas frases indican metacognición emergente. Es un superpoder para el aprendizaje.', 'Cognitivo', 72, 84, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🏗️', 'The Project Era', '{child_name} can now sustain a project for days or weeks: building a fort, creating a comic, assembling a collection. This capacity to plan, execute, and complete is Erikson''s "industry" — the foundation of adult productivity.', 'Executive Functions', 72, 84, 'en'),
('📐', 'Concrete Logical Thinking', '{child_name}''s brain is entering Piaget''s "concrete operations." They can now understand conservation, reversibility, and hierarchical classification. Logic turns on.', 'Cognitive', 72, 84, 'en'),
('🤔', 'Metacognition: Thinking About Thinking', '{child_name} is becoming aware of their OWN thinking. "I don''t remember", "this is hard for me", "I get it now" — these indicate emerging metacognition. A learning superpower.', 'Cognitive', 72, 84, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Pregúntale a {child_name} sobre su estrategia: "¿Cómo decidiste resolver eso?" o "¿Qué harías diferente la próxima vez?" Esto activa la metacognición — pensar sobre el propio pensamiento.', 72, 84, 'es'),
('Ask {child_name} about their strategy: "How did you decide to solve that?" or "What would you do differently next time?" This activates metacognition — thinking about their own thinking.', 72, 84, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🏆', 'Industria vs. Inferioridad: la tarea de los 6-12', 'article', 'Socio-Emocional', 'Erikson identificó que la tarea central de esta edad es sentirse competente — y cómo respondes a sus logros y fracasos lo determina.', '{child_name} está entrando en lo que Erikson llamó la crisis de INDUSTRIA vs. INFERIORIDAD. La pregunta central es: "¿Soy capaz?"

**Lo que construye industria:**
- Proyectos que completan con éxito (aunque sean pequeños)
- Reconocimiento del esfuerzo y la persistencia
- Oportunidades de contribuir a la familia ("eres responsable de poner la mesa")
- Dominio progresivo de habilidades (un instrumento, un deporte, cocinar)

**Lo que crea inferioridad:**
- Comparaciones constantes ("mira cómo lo hace tu hermano")
- Expectativas imposibles o perfeccionismo del adulto
- No dejar fallar (si siempre intervienes, el mensaje es "no puedes solo/a")
- Sobrecargar de actividades estructuradas sin tiempo para proyectos propios

**El equilibrio:**
Tu trabajo es ayudar a {child_name} a encontrar al menos un área donde sienta dominio genuino — no porque se lo digas, sino porque lo EXPERIMENTA.', 5, 72, 84, 'es'),

('🧪', 'El pensamiento científico real empieza ahora', 'guide', 'Cognitivo', 'A los 6-7 años, tu hijo puede hacer experimentos REALES con variables, hipótesis, y conclusiones.', '{child_name} ya no solo explora por explorar — puede formular una pregunta, hacer una predicción, probar, y sacar conclusiones. El pensamiento científico formal empieza aquí.

**Experimentos reales para casa:**
- "¿Las plantas crecen mejor con luz o sin luz?" → plantar dos semillas, una tapada, medir
- "¿Qué se disuelve en agua?" → sal, azúcar, arena, piedra → tabla de resultados
- "¿Qué pelota rebota más alto?" → probar desde la misma altura → medir

**La clave: no dar la respuesta.**
Pregunta: "¿Qué crees que va a pasar? ¿Por qué?" DESPUÉS del experimento: "¿Pasó lo que esperabas? ¿Qué fue diferente?"

Este proceso (hipótesis → experimentación → observación → conclusión) es EXACTAMENTE el método científico. A los 6-7 años, pueden hacerlo con apoyo.', 5, 72, 84, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🏆', 'Industry vs. Inferiority: The 6-12 Task', 'article', 'Social-Emotional', 'Erikson identified the central task: feeling competent. How you respond to achievements and failures determines it.', '{child_name} is entering Erikson''s INDUSTRY vs. INFERIORITY crisis. The central question: "Am I capable?"

**What builds industry:** Projects they complete, effort recognition, contributing to family, progressive skill mastery.
**What creates inferiority:** Constant comparisons, impossible expectations, never letting them fail, overscheduling.

**Your job:** Help them find at least one area of genuine mastery — not because you tell them, but because they EXPERIENCE it.', 5, 72, 84, 'en'),

('🧪', 'Real Scientific Thinking Starts Now', 'guide', 'Cognitive', 'At 6-7, your child can do REAL experiments with variables, hypotheses, and conclusions.', '{child_name} can now formulate questions, make predictions, test, and draw conclusions.

**Real home experiments:**
- "Do plants grow better with or without light?" → plant two seeds, cover one, measure
- "What dissolves in water?" → salt, sugar, sand, stone → results table
- "Which ball bounces highest?" → test from same height → measure

**The key: don''t give the answer.** Ask before: "What do you think will happen?" After: "Did it match? What was different?"', 5, 72, 84, 'en');


-- ────────────────────────────────────────────────────────────
-- 84-96 MONTHS (7 - 8 years)
-- Theme: Deep friendships, reading for pleasure, independence grows
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📗', 'Leer por placer', 'Si {child_name} elige leer por gusto — ¡celebra! El salto de "decodificar" (leer las palabras) a "comprender" (vivir la historia) está ocurriendo. No importa QUÉ lea (cómics, manuales de videojuegos, revistas). Toda lectura voluntaria construye vocabulario y comprensión.', 'Lectoescritura', 84, 96, 'es'),
('👥', 'Las amistades profundas', '{child_name} ahora forma amistades basadas en confianza mutua, secretos compartidos, y lealtad — no solo proximidad. Los conflictos entre amigos son más dolorosos porque hay más en juego. Cada resolución de conflicto construye inteligencia social.', 'Social', 84, 96, 'es'),
('⏰', 'Gestión del tiempo emergente', '{child_name} empieza a entender la planificación temporal: "primero esto, después aquello, mañana lo otro." Ayúdale a visualizar con listas, calendarios sencillos, o cronogramas. Esto es función ejecutiva en acción — y se practica, no se nace con ella.', 'Funciones Ejecutivas', 84, 96, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('📗', 'Reading for Pleasure', 'If {child_name} chooses to read for fun — celebrate! The leap from "decoding" (reading words) to "comprehending" (living the story) is happening. It doesn''t matter WHAT they read (comics, game guides, magazines). All voluntary reading builds vocabulary.', 'Literacy', 84, 96, 'en'),
('👥', 'Deep Friendships', '{child_name} now forms friendships based on mutual trust, shared secrets, and loyalty — not just proximity. Friend conflicts hurt more because there''s more at stake. Every resolution builds social intelligence.', 'Social', 84, 96, 'en'),
('⏰', 'Emerging Time Management', '{child_name} is starting to understand temporal planning: "first this, then that, tomorrow the other." Help them visualize with lists, simple calendars, or schedules. This is executive function in action.', 'Executive Functions', 84, 96, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('¿{child_name} tiene una tarea o proyecto? En vez de decirle cómo organizarse, pregunta: "¿Cuál es tu plan?" y deja que lidere. Interviene solo si pide ayuda.', 84, 96, 'es'),
('Does {child_name} have a task or project? Instead of telling them how to organize, ask: "What''s your plan?" and let them lead. Step in only if they ask.', 84, 96, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('📱', 'Pantallas: la pregunta no es cuánto sino cómo', 'article', 'Desarrollo General', 'La investigación más reciente muestra que el CONTENIDO y el CONTEXTO importan más que el tiempo de pantalla.', 'El debate de pantallas se ha centrado en "cuántas horas" — pero la investigación actual (Przybylski & Weinstein, 2017) sugiere que la CALIDAD importa más que la CANTIDAD.

**Lo que la ciencia realmente dice:**
- Contenido pasivo (ver videos sin interacción) tiene efectos diferentes a contenido activo (crear, construir, resolver)
- Ver contenido JUNTOS y hablar sobre él transforma la experiencia (co-viewing)
- El desplazamiento de actividades importa: ¿las pantallas reemplazan juego libre, lectura, o sueño?
- La relación es curvilínea, no lineal: un poco no hace daño, demasiado sí

**Preguntas útiles en vez de cronómetro:**
1. ¿Qué DEJA de hacer {child_name} por estar en pantallas?
2. ¿Es contenido pasivo o activo/creativo?
3. ¿Lo ve solo/a o pueden compartirlo?
4. ¿Afecta su sueño, humor, o deseo de hacer otras cosas?

Si {child_name} crea mundos en Minecraft, graba videos, o programa — eso es muy diferente a scroll infinito de videos.', 6, 84, 96, 'es'),

('🧠', 'El cerebro lector: qué pasa cuando lee', 'research', 'Cognitivo', 'La lectura reorganiza físicamente el cerebro, creando conexiones que no existían antes.', 'Cuando {child_name} lee, su cerebro realiza una hazaña que ningún otro animal puede: convertir símbolos visuales en sonidos, en significado, en imágenes mentales, en emociones — en milisegundos. La neurocientífica Maryanne Wolf describe la lectura como "el reciclaje neuronal" más impresionante del cerebro humano.

**Lo que pasa neurológicamente:**
El cerebro NO nació para leer (no hay "área de lectura" genética). Para leer, recluta áreas de reconocimiento visual, procesamiento auditivo, lenguaje, y comprensión — y las CONECTA de forma nueva. Esta reorganización es visible en neuroimágenes.

**Lectura por placer vs. obligación:**
Las investigaciones de Stanovich demuestran el "efecto Mateo": los niños que leen por placer leen más, lo cual mejora su vocabulario, lo cual hace que la lectura sea más fácil y placentera, lo cual hace que lean más. El ciclo positivo se retroalimenta.

**Cómo alimentar el ciclo:**
- Libros accesibles en TODAS partes (cama, carro, baño, mochila)
- Modela lectura: que te VEA leyendo por placer
- Visita la biblioteca como un evento especial
- NUNCA uses la lectura como castigo o recompensa', 6, 84, 96, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('📱', 'Screens: The Question Isn''t How Much But How', 'article', 'General Development', 'The latest research shows CONTENT and CONTEXT matter more than screen time.', 'The screen debate focused on "how many hours" — but current research (Przybylski & Weinstein, 2017) suggests QUALITY matters more than QUANTITY.

**Useful questions instead of a timer:**
1. What does {child_name} STOP doing because of screens?
2. Is it passive or active/creative content?
3. Are they watching alone or can you share it?
4. Does it affect sleep, mood, or desire for other activities?

Creating worlds in Minecraft, recording videos, or programming is very different from infinite video scrolling.', 6, 84, 96, 'en'),

('🧠', 'The Reading Brain: What Happens When They Read', 'research', 'Cognitive', 'Reading physically reorganizes the brain, creating connections that didn''t exist before.', 'When {child_name} reads, their brain does something no other animal can: convert visual symbols into sounds, meaning, mental images, and emotions — in milliseconds. Maryanne Wolf describes reading as the brain''s most impressive "neural recycling."

**The Matthew Effect:** Children who read for pleasure read more → better vocabulary → reading becomes easier → they read more. The positive cycle feeds itself.

**How to fuel the cycle:**
- Books accessible EVERYWHERE
- Model reading: let them SEE you reading for pleasure
- Library visits as special events
- NEVER use reading as punishment or reward', 6, 84, 96, 'en');
