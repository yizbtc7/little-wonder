const AGE_BANDS = [
  {
    age_min: 0,
    age_max: 4,
    variants: [
      { domain_es: 'Desarrollo Temprano', domain_en: 'Early Development', schema_target: 'trajectory', focus_es: 'seguimiento visual y vínculo', focus_en: 'visual tracking and bonding' },
      { domain_es: 'Conexión Afectiva', domain_en: 'Attachment', schema_target: 'positioning', focus_es: 'turnos vocales y contacto emocional', focus_en: 'vocal turn-taking and emotional attunement' },
      { domain_es: 'Sensorial', domain_en: 'Sensory', schema_target: 'enveloping', focus_es: 'texturas suaves y regulación', focus_en: 'gentle textures and regulation' },
      { domain_es: 'Motricidad Inicial', domain_en: 'Early Motor', schema_target: 'rotation', focus_es: 'línea media y orientación corporal', focus_en: 'midline orientation and body awareness' },
    ],
  },
  {
    age_min: 4,
    age_max: 8,
    variants: [
      { domain_es: 'Exploración Sensorial', domain_en: 'Sensory Exploration', schema_target: 'enclosure', focus_es: 'causa y efecto con objetos cotidianos', focus_en: 'cause and effect with household objects' },
      { domain_es: 'Motricidad Gruesa', domain_en: 'Gross Motor', schema_target: 'trajectory', focus_es: 'alcanzar, rodar y perseguir', focus_en: 'reaching, rolling, and chasing' },
      { domain_es: 'Lenguaje Temprano', domain_en: 'Early Language', schema_target: 'positioning', focus_es: 'balbuceo conversacional y ritmo', focus_en: 'conversational babbling and rhythm' },
      { domain_es: 'Curiosidad Científica', domain_en: 'Scientific Curiosity', schema_target: 'transforming', focus_es: 'explorar sonido, luz y movimiento', focus_en: 'exploring sound, light, and movement' },
    ],
  },
  {
    age_min: 8,
    age_max: 14,
    variants: [
      { domain_es: 'Pensamiento Científico', domain_en: 'Scientific Thinking', schema_target: 'transporting', focus_es: 'experimentación motora y curiosidad', focus_en: 'motor experimentation and curiosity' },
      { domain_es: 'Resolución de Problemas', domain_en: 'Problem Solving', schema_target: 'connecting', focus_es: 'encajar, abrir y cerrar', focus_en: 'fit, open, and close tasks' },
      { domain_es: 'Atención y Memoria', domain_en: 'Attention & Memory', schema_target: 'enclosure', focus_es: 'buscar objetos y anticipar', focus_en: 'object search and anticipation' },
      { domain_es: 'Juego de Causa-Efecto', domain_en: 'Cause-Effect Play', schema_target: 'trajectory', focus_es: 'tirar, golpear y repetir', focus_en: 'drop, tap, and repeat experiments' },
    ],
  },
  {
    age_min: 14,
    age_max: 24,
    variants: [
      { domain_es: 'Autonomía', domain_en: 'Autonomy', schema_target: 'connecting', focus_es: 'lenguaje, límites y autorregulación', focus_en: 'language, boundaries, and co-regulation' },
      { domain_es: 'Juego Simbólico Inicial', domain_en: 'Early Pretend Play', schema_target: 'transforming', focus_es: 'representación y roles simples', focus_en: 'symbolic representation and simple roles' },
      { domain_es: 'Ingeniería Casera', domain_en: 'Home Engineering', schema_target: 'positioning', focus_es: 'apilar, equilibrar y ajustar', focus_en: 'stacking, balancing, and adjusting' },
      { domain_es: 'Movimiento y Exploración', domain_en: 'Movement Exploration', schema_target: 'transporting', focus_es: 'llevar objetos con propósito', focus_en: 'carrying objects with purpose' },
    ],
  },
  {
    age_min: 24,
    age_max: 30,
    variants: [
      { domain_es: 'Aprendizaje Activo', domain_en: 'Active Learning', schema_target: 'transforming', focus_es: 'juego simbólico y solución de problemas', focus_en: 'symbolic play and problem solving' },
      { domain_es: 'Lenguaje y Narrativa', domain_en: 'Language & Narrative', schema_target: 'connecting', focus_es: 'historias cortas con acciones', focus_en: 'short stories with actions' },
      { domain_es: 'Regulación Emocional', domain_en: 'Emotional Regulation', schema_target: 'positioning', focus_es: 'rutinas de calma y transición', focus_en: 'calm routines and transitions' },
      { domain_es: 'Ciencia en Casa', domain_en: 'Home Science', schema_target: 'trajectory', focus_es: 'predicción y experimentos simples', focus_en: 'prediction and simple experiments' },
    ],
  },
  {
    age_min: 30,
    age_max: 36,
    variants: [
      { domain_es: 'Social', domain_en: 'Social', schema_target: 'positioning', focus_es: 'colaboración, turnos y empatía', focus_en: 'collaboration, turn-taking, and empathy' },
      { domain_es: 'Juego Cooperativo', domain_en: 'Cooperative Play', schema_target: 'connecting', focus_es: 'roles compartidos y negociación', focus_en: 'shared roles and negotiation' },
      { domain_es: 'Motricidad Fina', domain_en: 'Fine Motor', schema_target: 'enclosure', focus_es: 'precisión y control bilateral', focus_en: 'precision and bilateral control' },
      { domain_es: 'Exploración Matemática', domain_en: 'Math Exploration', schema_target: 'transforming', focus_es: 'comparar, clasificar y seriación', focus_en: 'compare, classify, and sequence' },
    ],
  },
  {
    age_min: 36,
    age_max: 48,
    variants: [
      { domain_es: 'Creatividad', domain_en: 'Creativity', schema_target: 'none', focus_es: 'expresión creativa con materiales simples', focus_en: 'creative expression with simple materials' },
      { domain_es: 'Cuento y Drama', domain_en: 'Story & Drama', schema_target: 'positioning', focus_es: 'narrativa, roles y emociones', focus_en: 'narrative, roles, and emotions' },
      { domain_es: 'Construcción', domain_en: 'Construction', schema_target: 'connecting', focus_es: 'estructuras estables y diseño', focus_en: 'stable structures and design' },
      { domain_es: 'Movimiento Creativo', domain_en: 'Creative Movement', schema_target: 'rotation', focus_es: 'ritmo, secuencia y coordinación', focus_en: 'rhythm, sequence, and coordination' },
    ],
  },
  {
    age_min: 48,
    age_max: 54,
    variants: [
      { domain_es: 'Pensamiento Lógico', domain_en: 'Logical Thinking', schema_target: 'connecting', focus_es: 'retos de construcción y planificación', focus_en: 'construction challenges and planning' },
      { domain_es: 'Investigación', domain_en: 'Inquiry', schema_target: 'trajectory', focus_es: 'formular hipótesis y comprobar', focus_en: 'build and test hypotheses' },
      { domain_es: 'Lenguaje Complejo', domain_en: 'Advanced Language', schema_target: 'none', focus_es: 'explicar pasos y justificar', focus_en: 'explain steps and justify choices' },
      { domain_es: 'Juego de Reglas', domain_en: 'Rule Games', schema_target: 'positioning', focus_es: 'seguir reglas y adaptarse', focus_en: 'follow rules and adapt' },
    ],
  },
  {
    age_min: 54,
    age_max: 60,
    variants: [
      { domain_es: 'Funciones Ejecutivas', domain_en: 'Executive Function', schema_target: 'positioning', focus_es: 'reglas, atención e inhibición', focus_en: 'rules, attention, and inhibition' },
      { domain_es: 'Planificación', domain_en: 'Planning', schema_target: 'connecting', focus_es: 'organizar pasos y materiales', focus_en: 'organize steps and materials' },
      { domain_es: 'Razonamiento', domain_en: 'Reasoning', schema_target: 'transforming', focus_es: 'probar estrategias y ajustar', focus_en: 'test strategies and adapt' },
      { domain_es: 'Lenguaje Social', domain_en: 'Social Language', schema_target: 'none', focus_es: 'resolver conflictos con palabras', focus_en: 'solve conflicts with words' },
    ],
  },
  {
    age_min: 60,
    age_max: 72,
    variants: [
      { domain_es: 'Lenguaje', domain_en: 'Language', schema_target: 'none', focus_es: 'lectura compartida y narración', focus_en: 'shared reading and storytelling' },
      { domain_es: 'Lectoescritura Inicial', domain_en: 'Early Literacy', schema_target: 'positioning', focus_es: 'sonidos, rimas y secuencias', focus_en: 'sounds, rhymes, and sequencing' },
      { domain_es: 'Ciencia Cotidiana', domain_en: 'Everyday Science', schema_target: 'trajectory', focus_es: 'experimentos observables en casa', focus_en: 'observable home experiments' },
      { domain_es: 'Proyecto Creativo', domain_en: 'Creative Project', schema_target: 'transforming', focus_es: 'iterar y mejorar un producto', focus_en: 'iterate and improve a creation' },
    ],
  },
  {
    age_min: 72,
    age_max: 84,
    variants: [
      { domain_es: 'Proyecto', domain_en: 'Project-Based', schema_target: 'transporting', focus_es: 'proyectos de varios días', focus_en: 'multi-day projects' },
      { domain_es: 'Diseño', domain_en: 'Design', schema_target: 'connecting', focus_es: 'crear prototipos y evaluar', focus_en: 'prototype and evaluate' },
      { domain_es: 'Investigación Guiada', domain_en: 'Guided Inquiry', schema_target: 'none', focus_es: 'preguntas profundas y evidencias', focus_en: 'deep questions and evidence' },
      { domain_es: 'Colaboración', domain_en: 'Collaboration', schema_target: 'positioning', focus_es: 'planificar en equipo', focus_en: 'team planning and execution' },
    ],
  },
  {
    age_min: 84,
    age_max: 96,
    variants: [
      { domain_es: 'Motivación', domain_en: 'Motivation', schema_target: 'transforming', focus_es: 'intereses intensos y autonomía', focus_en: 'intense interests and autonomy' },
      { domain_es: 'Metacognición', domain_en: 'Metacognition', schema_target: 'none', focus_es: 'planear, monitorear y reflexionar', focus_en: 'plan, monitor, and reflect' },
      { domain_es: 'Resolución Creativa', domain_en: 'Creative Problem Solving', schema_target: 'connecting', focus_es: 'múltiples caminos a una meta', focus_en: 'multiple paths to one goal' },
      { domain_es: 'Comunicación', domain_en: 'Communication', schema_target: 'positioning', focus_es: 'argumentar con respeto', focus_en: 'argue respectfully with evidence' },
    ],
  },
  {
    age_min: 96,
    age_max: 108,
    variants: [
      { domain_es: 'Pensamiento Crítico', domain_en: 'Critical Thinking', schema_target: 'none', focus_es: 'investigación y argumentación', focus_en: 'research and argumentation' },
      { domain_es: 'Método Científico', domain_en: 'Scientific Method', schema_target: 'trajectory', focus_es: 'hipótesis, datos y revisión', focus_en: 'hypothesis, data, and revision' },
      { domain_es: 'Diseño de Soluciones', domain_en: 'Solution Design', schema_target: 'connecting', focus_es: 'definir problema y prototipar', focus_en: 'define a problem and prototype' },
      { domain_es: 'Debate y Empatía', domain_en: 'Debate & Empathy', schema_target: 'positioning', focus_es: 'tomar perspectiva del otro', focus_en: 'take another perspective' },
    ],
  },
  {
    age_min: 108,
    age_max: 120,
    variants: [
      { domain_es: 'Responsabilidad', domain_en: 'Responsibility', schema_target: 'connecting', focus_es: 'tareas reales con impacto', focus_en: 'real tasks with impact' },
      { domain_es: 'Autogestión', domain_en: 'Self-Management', schema_target: 'positioning', focus_es: 'metas semanales y seguimiento', focus_en: 'weekly goals and tracking' },
      { domain_es: 'Servicio', domain_en: 'Service', schema_target: 'transporting', focus_es: 'aportar al hogar/comunidad', focus_en: 'contribute to home/community' },
      { domain_es: 'Aprendizaje Autónomo', domain_en: 'Self-Directed Learning', schema_target: 'none', focus_es: 'investigar interés propio', focus_en: 'investigate personal interests' },
    ],
  },
  {
    age_min: 120,
    age_max: 132,
    variants: [
      { domain_es: 'Identidad', domain_en: 'Identity', schema_target: 'none', focus_es: 'reflexión y toma de decisiones', focus_en: 'reflection and decision making' },
      { domain_es: 'Proyecto Personal', domain_en: 'Personal Project', schema_target: 'transforming', focus_es: 'crear algo que te represente', focus_en: 'build something that represents self' },
      { domain_es: 'Pensamiento Ético', domain_en: 'Ethical Thinking', schema_target: 'positioning', focus_es: 'dilemas y valores', focus_en: 'dilemmas and values' },
      { domain_es: 'Comunicación Persuasiva', domain_en: 'Persuasive Communication', schema_target: 'connecting', focus_es: 'expresar postura con evidencia', focus_en: 'express positions with evidence' },
    ],
  },
  {
    age_min: 132,
    age_max: 144,
    variants: [
      { domain_es: 'Propósito', domain_en: 'Purpose', schema_target: 'none', focus_es: 'proyectos con significado social', focus_en: 'socially meaningful projects' },
      { domain_es: 'Liderazgo', domain_en: 'Leadership', schema_target: 'positioning', focus_es: 'coordinar y delegar en equipo', focus_en: 'coordinate and delegate in teams' },
      { domain_es: 'Impacto Comunitario', domain_en: 'Community Impact', schema_target: 'connecting', focus_es: 'detectar necesidad y actuar', focus_en: 'identify needs and take action' },
      { domain_es: 'Innovación', domain_en: 'Innovation', schema_target: 'transforming', focus_es: 'prototipo, testeo y mejora', focus_en: 'prototype, test, and iterate' },
    ],
  },
];

const ACTIVITY_DEFINITIONS = AGE_BANDS.flatMap((band) =>
  band.variants.map((variant) => ({ age_min: band.age_min, age_max: band.age_max, ...variant }))
);

module.exports = ACTIVITY_DEFINITIONS;
module.exports.AGE_BANDS = AGE_BANDS.map(({ age_min, age_max }) => ({ age_min, age_max }));
