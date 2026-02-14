-- ============================================================
-- EXPLORE CONTENT SEED: 96-144 MONTHS (4 bands)
-- Spanish + English | Articles + Brain Cards + Daily Tips
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 96-108 MONTHS (8 - 9 years)
-- Theme: Abstract thinking begins, passion projects, social hierarchy
-- ────────────────────────────────────────────────────────────

-- BRAIN CARDS (ES)
INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('💡', 'Pensamiento abstracto emergente', '{child_name} empieza a pensar en cosas que no puede ver ni tocar: justicia, amistad, el futuro. Puede hacer razonamientos del tipo "si... entonces..." sin necesidad de manipular objetos físicos. Las ideas se convierten en juguetes.', 'Cognitivo', 96, 108, 'es'),
('🔥', 'La era de las pasiones', 'Si {child_name} se obsesiona con un tema (dinosaurios, espacio, cocina, programación), aliméntalo. Las investigaciones de Renninger muestran que un "interés individual bien desarrollado" a esta edad predice motivación académica y profesional a largo plazo.', 'Motivación', 96, 108, 'es'),
('👑', 'Jerarquías sociales y pertenencia', '{child_name} ahora entiende las dinámicas de grupo: quién es "popular," quién es excluido, a qué grupo pertenece. Esto puede ser doloroso pero es desarrollo social normal. Tu trabajo es ser puerto seguro, no resolver cada conflicto social por él/ella.', 'Social', 96, 108, 'es');

-- BRAIN CARDS (EN)
INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('💡', 'Abstract Thinking Emerges', '{child_name} is starting to think about things they can''t see or touch: justice, friendship, the future. They can reason "if... then..." without physical objects. Ideas become toys.', 'Cognitive', 96, 108, 'en'),
('🔥', 'The Passion Era', 'If {child_name} obsesses over a topic (dinosaurs, space, cooking, coding), feed it. Renninger''s research shows a "well-developed individual interest" at this age predicts long-term academic and professional motivation.', 'Motivation', 96, 108, 'en'),
('👑', 'Social Hierarchies and Belonging', '{child_name} now understands group dynamics: who''s "popular," who''s excluded, where they fit. This can be painful but it''s normal social development. Your job is to be safe harbor, not solve every social conflict.', 'Social', 96, 108, 'en');

-- DAILY TIPS
INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Pregúntale a {child_name}: "Si pudieras aprender todo sobre un tema durante un mes entero, ¿qué elegirías?" Escucha con curiosidad genuina. Su respuesta te dice qué intereses están cristalizando.', 96, 108, 'es'),
('Ask {child_name}: "If you could learn everything about one topic for a whole month, what would you choose?" Listen with genuine curiosity. Their answer tells you which interests are crystallizing.', 96, 108, 'en');

-- ARTICLES (ES)
INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🔥', 'Intereses intensos: el motor del aprendizaje profundo', 'article', 'Motivación', 'Cuando tu hijo se obsesiona con un tema, su cerebro entra en un estado de aprendizaje óptimo que no se puede replicar artificialmente.', 'A los 8-9 años, muchos niños desarrollan lo que Hidi y Renninger llaman "interés individual emergente": una fascinación persistente por un tema específico. {child_name} puede querer leer TODO sobre tiburones, ver documentales, dibujarlos, hablar de ellos sin parar.

**Por qué importa tanto:**
Cuando un niño está en un estado de interés individual, su cerebro procesa la información relacionada más eficientemente, retiene más, y persiste más ante la dificultad. Es dopamina natural que ningún programa puede replicar.

**El modelo de cuatro fases (Renninger):**
1. Interés situacional disparado (algo llama la atención)
2. Interés situacional mantenido (vuelven al tema)
3. Interés individual emergente (buscan información solos) — {child_name} puede estar aquí
4. Interés individual desarrollado (auto-sostenido, resistente a obstáculos)

**Cómo nutrir sin secuestrar:**
- Proporciona recursos: libros, documentales, experiencias
- Conecta con expertos o comunidades
- NO conviertas la pasión en tarea o lección
- Celebra la profundidad: "¡Sabes más de volcanes que la mayoría de adultos!"', 6, 96, 108, 'es'),

('👥', 'Bullying, exclusión, y tu rol como padre', 'guide', 'Social', 'Cómo respondes cuando tu hijo/a es excluido/a determina si desarrolla resiliencia o retraimiento.', 'A los 8-9 años, las dinámicas sociales se vuelven más complejas y a veces dolorosas.

**Lo que la investigación dice:**
- El factor protector #1 contra el bullying es tener al menos UN amigo cercano
- Los niños que pueden nombrar sus emociones manejan mejor los conflictos sociales
- La intervención adulta excesiva puede empeorar la situación social del niño entre pares

**Tu rol como puerto seguro:**
1. ESCUCHA primero, sin soluciones inmediatas: "Cuéntame qué pasó"
2. Valida: "Eso suena realmente difícil"
3. Pregunta qué necesitan: "¿Quieres que te ayude a pensar qué hacer, o solo que te escuche?"
4. Ayuda a practicar respuestas (role-play): "¿Qué podrías decir si vuelve a pasar?"

**Cuándo intervenir directamente:**
- Agresión física
- Cyberbullying persistente
- Cambios significativos de humor, sueño, o apetito
- Pide ayuda explícitamente', 6, 96, 108, 'es'),

('🧩', 'Del pensamiento concreto al abstracto', 'research', 'Cognitivo', 'El cerebro de tu hijo está haciendo la transición más importante desde que aprendió a hablar.', 'Piaget describió la transición de operaciones concretas a formales como el salto de "pensar sobre cosas" a "pensar sobre pensamientos."

**Lo que ahora puede hacer:**
- Resolver problemas mentalmente sin manipular objetos
- Entender metáforas: "llueven ideas" no es literal
- Planificar varios pasos hacia adelante
- Considerar múltiples perspectivas de un mismo evento
- Razonar "si... entonces..." con abstracciones

**Cómo notarlo en la vida diaria:**
- Humor más sofisticado (juegos de palabras, ironía)
- Interés en justicia más allá de lo personal
- Capacidad de debatir con lógica
- Planifica proyectos multi-paso sin ayuda

**Cómo estimularlo:**
- Juegos de estrategia (ajedrez, juegos de mesa complejos)
- Debates familiares sobre noticias, películas, dilemas
- Proyectos con planificación: "¿Cómo organizarías una venta de limonada?"
- Pedirle que enseñe algo a un hermano menor o amigo', 6, 96, 108, 'es');

-- ARTICLES (EN)
INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🔥', 'Intense Interests: The Engine of Deep Learning', 'article', 'Motivation', 'When your child obsesses over a topic, their brain enters an optimal learning state that cannot be artificially replicated.', 'At 8-9, many children develop what Hidi and Renninger call "emerging individual interest": a persistent fascination beyond the moment.

**Why it matters:**
In a state of individual interest, the brain processes related information more efficiently, retains more, and persists through difficulty. Natural dopamine no program can replicate.

**How to nurture without hijacking:**
- Provide resources: books, documentaries, experiences
- Connect with experts or communities
- DON''T turn passion into homework or lessons
- Celebrate depth: "You know more about volcanoes than most adults!"', 6, 96, 108, 'en'),

('👥', 'Bullying, Exclusion, and Your Role as Parent', 'guide', 'Social', 'How you respond when your child is excluded determines whether they develop resilience or withdrawal.', 'At 8-9, social dynamics become complex and sometimes painful.

**Research says:**
- The #1 protective factor: at least ONE close friend
- Children who can name emotions handle social conflicts better
- Excessive adult intervention can worsen social standing

**Your role as safe harbor:**
1. LISTEN first, no immediate solutions
2. Validate: "That sounds really hard"
3. Ask what they need: "Want help thinking, or just need me to listen?"
4. Practice responses through role-play

**When to intervene directly:** Physical aggression, persistent cyberbullying, significant behavior changes, explicit request for help.', 6, 96, 108, 'en'),

('🧩', 'From Concrete to Abstract Thinking', 'research', 'Cognitive', 'Your child''s brain is making the most important transition since learning to talk.', 'Piaget described the shift from concrete to formal operations as moving from "thinking about things" to "thinking about thoughts."

**What they can now do:** Solve problems mentally, understand metaphors, plan multiple steps ahead, consider multiple perspectives, reason with abstractions.

**How to spot it daily:** More sophisticated humor, interest in justice, logical debate ability, multi-step planning.

**How to stimulate:** Strategy games (chess, complex board games), family debates about news and movies, multi-step projects, teaching younger siblings.', 6, 96, 108, 'en');


-- ────────────────────────────────────────────────────────────
-- 108-120 MONTHS (9 - 10 years)
-- Theme: Pre-adolescent identity, critical thinking, responsibility
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🪞', 'La identidad toma forma', '{child_name} empieza a definirse más allá de "me gusta el fútbol": piensa en qué tipo de persona es, qué valores tiene, qué le importa. Lo que reflejas ("eres alguien que no se rinde") se convierte en auto-concepto.', 'Identidad', 108, 120, 'es'),
('🔍', 'Pensamiento crítico natural', '{child_name} empieza a cuestionar: "¿Eso es verdad?" "¿Cómo sabes?" Esto NO es insolencia, es pensamiento crítico naciente. Exactamente lo que necesitará para navegar un mundo lleno de información y desinformación.', 'Cognitivo', 108, 120, 'es'),
('🏠', 'Responsabilidad real', '{child_name} ahora puede manejar responsabilidades con consecuencias reales: cuidar una mascota, administrar una mesada, cocinar algo simple. Cada responsabilidad cumplida construye auto-eficacia.', 'Funciones Ejecutivas', 108, 120, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🪞', 'Identity Takes Shape', '{child_name} is defining themselves beyond "I like soccer": thinking about what kind of person they are, what values matter. What you reflect ("you''re someone who doesn''t give up") becomes self-concept.', 'Identity', 108, 120, 'en'),
('🔍', 'Natural Critical Thinking', '{child_name} is questioning: "Is that true?" "How do you know?" This is NOT disrespect, it''s nascent critical thinking. Exactly what they need for a world full of information.', 'Cognitive', 108, 120, 'en'),
('🏠', 'Real Responsibility', '{child_name} can handle real responsibilities with real consequences: pet care, managing an allowance, cooking a simple meal. Each one builds self-efficacy.', 'Executive Functions', 108, 120, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Dale a {child_name} una responsabilidad nueva esta semana, una que sea real. Preparar el desayuno del sábado, planear una actividad familiar, gestionar un pequeño presupuesto. La competencia real construye confianza real.', 108, 120, 'es'),
('Give {child_name} a new real responsibility this week. Making Saturday breakfast, planning a family activity, managing a small budget. Real competence builds real confidence.', 108, 120, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🪞', 'Auto-concepto: la historia que tu hijo se cuenta sobre sí mismo', 'article', 'Identidad', 'A los 9-10 años, la narrativa interna se solidifica y tú eres co-autor.', 'Alrededor de los 9-10, {child_name} está construyendo activamente una narrativa de identidad: "Soy el tipo de persona que..." Esta se forma a partir de experiencias + las interpretaciones que los adultos importantes les dan.

**El poder del reflejo parental:**
Cuando dices "eres alguien que siempre encuentra una solución", se incorpora al auto-concepto. Cuando dices "siempre olvidas todo", también.

**Cómo co-escribir una narrativa positiva:**
- Señala patrones: "He notado que cuando te apasiona algo, investigas a fondo"
- Conecta pasado con presente: "¿Te acuerdas cuando aprendiste a nadar y al principio tenías miedo?"
- Valida complejidad: "Puedes ser bueno/a en matemáticas Y en arte"

**La trampa de las etiquetas:**
Evita etiquetas fijas (el deportista, la inteligente). Limitan la exploración. Mejor: "Una de tus fortalezas es..."', 5, 108, 120, 'es'),

('💰', 'Pensamiento económico: más que una mesada', 'guide', 'Funciones Ejecutivas', 'Gestionar dinero real enseña matemáticas, planificación, y gratificación diferida, todo a la vez.', 'A los 9-10, {child_name} puede entender conceptos económicos: ahorro, presupuesto, costo de oportunidad.

**Cómo estructurar una mesada educativa:**
- Cantidad fija semanal (no atada a tareas del hogar)
- Tres categorías: gastar, ahorrar, dar
- Dejar que cometa errores (comprar algo que no vale la pena ES la lección)
- NO rescatar cuando se acaba: la consecuencia natural enseña más que cualquier sermón

**Proyectos emprendedores:**
- Venta de limonada: costos vs. ingresos
- Poner precio a juguetes viejos
- Presupuesto para un regalo: investigar, comparar, decidir

Cada decisión económica activa planificación, inhibición de impulsos, y pensamiento a futuro.', 5, 108, 120, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🪞', 'Self-Concept: The Story Your Child Tells About Themselves', 'article', 'Identity', 'At 9-10, the internal narrative solidifies and you are co-author.', 'Around 9-10, {child_name} is building an identity narrative: "I''m the kind of person who..."

**How to co-write a positive narrative:**
- Point out patterns: "When you''re passionate, you research deeply"
- Connect past to present: "Remember when learning to swim scared you?"
- Validate complexity: "You can be good at math AND art"

**The label trap:** Avoid fixed labels (the athlete, the smart one). Better: "One of your strengths is..."', 5, 108, 120, 'en'),

('💰', 'Economic Thinking: More Than an Allowance', 'guide', 'Executive Functions', 'Managing real money teaches math, planning, and delayed gratification all at once.', 'At 9-10, {child_name} can understand basic economics: saving, budgeting, opportunity cost.

**Educational allowance structure:**
- Fixed weekly amount (not tied to chores)
- Three categories: spend, save, give
- Let them make mistakes (the bad purchase IS the lesson)
- DON''T rescue when it runs out

**Entrepreneurial projects:** Lemonade stands (costs vs. revenue), pricing old toys, budgeting for a gift.', 5, 108, 120, 'en');


-- ────────────────────────────────────────────────────────────
-- 120-132 MONTHS (10 - 11 years)
-- Theme: Pre-puberty awareness, deep projects, moral complexity
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🌊', 'Pre-adolescencia: los cambios se acercan', 'El cuerpo y cerebro de {child_name} se preparan para la pubertad. Los cambios de humor, la sensibilidad social, y la necesidad de privacidad son NORMALES y biológicos. Mantén la comunicación abierta: esta es la base de confianza que necesitarás en la adolescencia.', 'Socio-Emocional', 120, 132, 'es'),
('🎯', 'Proyectos con propósito', '{child_name} ahora puede sostener proyectos de largo aliento con motivación interna: escribir un cuento, construir algo complejo, aprender un instrumento a nivel intermedio. Lo que necesita de ti: no dirección, sino INTERÉS GENUINO en lo que hace.', 'Motivación', 120, 132, 'es'),
('⚖️', 'Complejidad moral', '{child_name} entiende que las situaciones morales no siempre tienen respuestas claras. "Está mal mentir, pero ¿y si es para no lastimar?" Este razonamiento es pensamiento moral avanzado. Acompáñalo con diálogo, no respuestas absolutas.', 'Moral', 120, 132, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🌊', 'Pre-Adolescence: Changes Approach', '{child_name}''s body and brain are preparing for puberty. Mood shifts, heightened social sensitivity, and need for privacy are NORMAL and biological. Keep communication open: this trust is what you''ll need during adolescence.', 'Social-Emotional', 120, 132, 'en'),
('🎯', 'Purposeful Projects', '{child_name} can now sustain long-term projects with internal motivation: writing a story, complex building, intermediate instrument skills. What they need: not direction, but GENUINE INTEREST.', 'Motivation', 120, 132, 'en'),
('⚖️', 'Moral Complexity', '{child_name} understands moral situations don''t always have clear answers. "Lying is wrong, but what if it''s to not hurt someone?" This is advanced moral thinking. Accompany with dialogue, not absolute answers.', 'Moral', 120, 132, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Plantea un dilema moral en la cena: "Un amigo te pide que lo cubras con una mentira. ¿Qué harías? ¿Por qué?" No juzgues la respuesta, explora el razonamiento. Estás entrenando pensamiento ético.', 120, 132, 'es'),
('Pose a moral dilemma at dinner: "A friend asks you to cover for them with a lie. What would you do? Why?" Don''t judge the answer, explore the reasoning. You''re training ethical thinking.', 120, 132, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🌊', 'Pre-pubertad: lo que está pasando por dentro', 'article', 'Desarrollo General', 'Los cambios de la pubertad empiezan ANTES de lo que piensas, y hablar temprano construye confianza.', 'La pubertad no empieza con el primer cambio visible. Las hormonas se activan 1-2 años ANTES de los signos externos. A los 10-11, {child_name} puede experimentar cambios internos que aún no son visibles pero que afectan humor, energía, y sensibilidad social.

**Lo que puede estar pasando:**
- Cambios de humor más intensos y repentinos
- Mayor necesidad de privacidad
- Sensibilidad aumentada a la opinión de pares
- Interés (o ansiedad) sobre cambios corporales
- Comparación con compañeros

**Cómo hablar sobre esto:**
- Normaliza: "Los cambios son normales y le pasan a todos"
- Sé concreto/a: usa términos reales, no eufemismos
- Hazlo gradual: muchas conversaciones cortas en vez de una gran charla
- Pregunta qué sabe y qué le preocupa ANTES de dar información

**El mensaje central:**
"Tu cuerpo está haciendo exactamente lo que debe hacer. Si tienes preguntas, siempre puedes hablar conmigo."', 6, 120, 132, 'es'),

('🧭', 'Autonomía digital: preparando la independencia online', 'guide', 'Funciones Ejecutivas', 'En vez de solo restringir, enseña a tomar buenas decisiones digitales.', 'A los 10-11, {child_name} necesita desarrollar juicio digital propio, porque pronto tendrá acceso sin supervisión.

**El enfoque de andamiaje digital:**
1. Transparencia: Explica POR QUÉ existen las reglas
2. Gradualidad: Aumenta libertades conforme demuestra buen juicio
3. Pensamiento crítico: "¿Crees que esto es verdad? ¿Cómo verificarías?"
4. Huella digital: "¿Lo publicarías en la pared de tu escuela?"
5. Empatía online: "¿Cómo se sentiría la persona que lee esto?"

**Conversaciones clave:**
- Privacidad: qué NO compartir nunca
- Extraños: las personas online no siempre son quienes dicen ser
- Bienestar: "Si algo te hace sentir incómodo/a online, no es tu culpa"

El objetivo NO es controlar, es construir el juicio para cuando no estés mirando.', 6, 120, 132, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🌊', 'Pre-Puberty: What''s Happening Inside', 'article', 'General Development', 'Puberty changes begin BEFORE you think, and talking early builds trust.', 'Puberty doesn''t start with the first visible change. Hormones activate 1-2 years BEFORE external signs.

**What may be happening:**
- More intense mood shifts
- Greater need for privacy
- Heightened sensitivity to peer opinion
- Interest (or anxiety) about body changes

**How to talk about it:**
- Normalize: "Changes are normal and happen to everyone"
- Be concrete: real terms, not euphemisms
- Make it gradual: many short conversations rather than one big talk
- Ask what they know and worry about BEFORE giving information

**Core message:** "Your body is doing exactly what it should. Questions or worries? You can always talk to me."', 6, 120, 132, 'en'),

('🧭', 'Digital Autonomy: Preparing for Online Independence', 'guide', 'Executive Functions', 'Instead of just restricting, teach good digital decisions.', 'At 10-11, they need their own digital judgment because unsupervised access is coming soon.

**The digital scaffolding approach:**
1. Transparency: Explain WHY rules exist
2. Gradual freedom as good judgment grows
3. Critical thinking: "Is this true? How would you verify?"
4. Digital footprint: "Would you post this on your school wall?"
5. Online empathy: "How would the reader feel?"

The goal isn''t control but building judgment for when you''re not watching.', 6, 120, 132, 'en');


-- ────────────────────────────────────────────────────────────
-- 132-144 MONTHS (11 - 12 years)
-- Theme: Identity exploration, peer influence, transition to teen
-- ────────────────────────────────────────────────────────────

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🔀', 'La identidad en experimentación', '{child_name} puede cambiar de estilo, grupo de amigos, o intereses rápidamente. No es inestabilidad, es EXPLORACIÓN de identidad (Erikson). Necesitan probar diferentes versiones de sí mismos. Tu trabajo: no entrar en pánico.', 'Identidad', 132, 144, 'es'),
('🧲', 'La fuerza de los pares', 'La opinión de los amigos pesa más que la tuya en muchos temas, y eso es biológicamente normal. No compitas con los pares. Asegúrate de que {child_name} sepa que tu hogar es un espacio donde siempre será aceptado/a tal como es.', 'Social', 132, 144, 'es'),
('🚀', 'Pensamiento sobre el futuro', '{child_name} empieza a imaginar su futuro: "¿Qué quiero ser?" No presiones respuestas. A los 11-12, lo importante es EXPLORAR muchas opciones, no decidirse por una. La curiosidad sobre el futuro es más valiosa que un plan.', 'Motivación', 132, 144, 'es');

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language) VALUES
('🔀', 'Identity in Experimentation', '{child_name} may change styles, friend groups, or interests rapidly. Not instability: identity EXPLORATION (Erikson). They need to try different versions of themselves. Your job: don''t panic.', 'Identity', 132, 144, 'en'),
('🧲', 'The Power of Peers', 'Friends'' opinions now outweigh yours on many topics, and that''s biologically normal. Don''t compete with peers. Make sure {child_name} knows home is a space where they''re always accepted as they are.', 'Social', 132, 144, 'en'),
('🚀', 'Thinking About the Future', '{child_name} is imagining their future: "What do I want to be?" Don''t push for answers. At 11-12, what matters is EXPLORING many options, not deciding. Curiosity about the future beats having a plan.', 'Motivation', 132, 144, 'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language) VALUES
('Comparte una historia de tu propia adolescencia con {child_name}: una vez que tuviste dudas, cometiste un error, o cambiaste de opinión. Tu vulnerabilidad construye confianza para que ellos compartan las suyas.', 132, 144, 'es'),
('Share a story from your own adolescence with {child_name}: a time you had doubts, made a mistake, or changed your mind. Your vulnerability builds trust for them to share theirs.', 132, 144, 'en');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🔀', 'La crisis de identidad no es crisis, es exploración', 'article', 'Identidad', 'Erikson describió la adolescencia temprana como un laboratorio de identidad. Los cambios rápidos son el cerebro haciendo su trabajo.', 'A los 11-12, {child_name} puede pasar por cambios que te desconciertan: un mes quiere ser veterinario, al siguiente youtuber. Se viste diferente, habla diferente, escucha música que te desconcierta.

**Erikson lo llamó moratoria de identidad:**
Un período donde el adolescente NECESITA experimentar con diferentes roles, valores, y estilos antes de comprometerse con una identidad. La exploración es el proceso. Cortarla prematuramente crea identidad frágil.

**Lo que puedes hacer:**
- Mantén límites claros sobre seguridad, sé flexible sobre expresión
- Muestra interés genuino en nuevos intereses, aunque parezcan pasajeros
- Comparte TUS dudas de cuando tenías su edad
- Cuidado con "te lo dije" cuando abandona un interés

**La regla de oro:**
Tu relación con {child_name} es más importante que ganar cualquier discusión sobre gustos, estilo, o intereses. Elige tus batallas.', 6, 132, 144, 'es'),

('🧠', 'El cerebro adolescente: manual de instrucciones', 'research', 'Cognitivo', 'La neurociencia explica por qué tu hijo toma riesgos, busca novedad, y valora tanto a sus amigos.', 'El cerebro adolescente no es un cerebro adulto defectuoso. Es un cerebro brillantemente diseñado para separarse de los padres y funcionar independientemente.

**Tres datos clave de la neurociencia adolescente:**

1. **El sistema límbico (emociones) madura ANTES que la corteza prefrontal (juicio).** Resultado: emociones intensas + freno débil = decisiones impulsivas. No es irresponsabilidad, es biología.

2. **El sistema de recompensa es hipersensible a novedad y pares.** La dopamina responde más a estímulos sociales y novedosos que en adultos. Por eso los amigos se vuelven tan importantes.

3. **La poda sináptica está en pleno proceso.** El cerebro elimina conexiones no usadas y fortalece las usadas. Lo que {child_name} practica ahora (instrumento, deporte, pensamiento crítico, empatía) se consolida. Lo que no practica se debilita.

**Implicación práctica:**
No puedes acelerar la maduración de la corteza prefrontal. Pero puedes ser el freno externo mientras madura, con empatía: "Entiendo que te pareció buena idea en el momento. ¿Qué harías diferente ahora?"', 6, 132, 144, 'es');

INSERT INTO explore_articles (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language) VALUES
('🔀', 'The Identity Crisis Isn''t a Crisis, It''s Exploration', 'article', 'Identity', 'Erikson described early adolescence as an identity laboratory. Rapid interest changes are the brain doing its job.', 'At 11-12, {child_name} may go through puzzling changes: one month wanting to be a vet, the next a YouTuber. Different clothes, different music, different speech.

**Erikson called this identity moratorium:** A period where adolescents NEED to experiment with roles, values, and styles before committing. Exploration IS the process. Cutting it short creates fragile identity.

**What you can do:**
- Clear safety boundaries, flexible expression boundaries
- Genuine interest in new interests, even if seemingly fleeting
- Share YOUR doubts from that age to normalize exploration
- Avoid "I told you so" when interests change

**The golden rule:** Your relationship is more important than winning any argument about taste, style, or interests. Choose your battles wisely.', 6, 132, 144, 'en'),

('🧠', 'The Adolescent Brain: An Owner''s Manual', 'research', 'Cognitive', 'Neuroscience explains why your child takes risks, seeks novelty, and values friends so much.', 'The adolescent brain isn''t a defective adult brain. It''s brilliantly designed to separate from parents and function independently.

**Three key neuroscience facts:**

1. **The limbic system (emotions) matures BEFORE the prefrontal cortex (judgment).** Result: intense emotions + weak brake = impulsive decisions. Not irresponsibility: biology.

2. **The reward system is hypersensitive to novelty and peers.** Dopamine responds more to social and novel stimuli than in adults. That''s why friends become so important.

3. **Synaptic pruning is in full swing.** The brain is eliminating unused connections and strengthening used ones. What {child_name} practices now (instrument, sport, critical thinking, empathy) consolidates. What they don''t practice weakens.

**Practical implication:** You can''t accelerate prefrontal maturation. But you can be the external brake while it matures, with empathy: "I understand it seemed like a good idea. What would you do differently now?"', 6, 132, 144, 'en');
