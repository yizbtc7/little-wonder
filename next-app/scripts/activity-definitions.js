const ACTIVITY_DEFINITIONS = [
  { age_min: 0, age_max: 4, domain_es: 'Desarrollo Temprano', domain_en: 'Early Development', schema_target: 'trajectory', focus_es: 'seguimiento visual y vínculo', focus_en: 'visual tracking and bonding' },
  { age_min: 4, age_max: 8, domain_es: 'Exploración Sensorial', domain_en: 'Sensory Exploration', schema_target: 'enclosure', focus_es: 'causa y efecto con objetos cotidianos', focus_en: 'cause and effect with household objects' },
  { age_min: 8, age_max: 14, domain_es: 'Pensamiento Científico', domain_en: 'Scientific Thinking', schema_target: 'transporting', focus_es: 'experimentación motora y curiosidad', focus_en: 'motor experimentation and curiosity' },
  { age_min: 14, age_max: 24, domain_es: 'Autonomía', domain_en: 'Autonomy', schema_target: 'connecting', focus_es: 'lenguaje, límites y autorregulación', focus_en: 'language, boundaries, and co-regulation' },
  { age_min: 24, age_max: 30, domain_es: 'Aprendizaje Activo', domain_en: 'Active Learning', schema_target: 'transforming', focus_es: 'juego simbólico y solución de problemas', focus_en: 'symbolic play and problem solving' },
  { age_min: 30, age_max: 36, domain_es: 'Social', domain_en: 'Social', schema_target: 'positioning', focus_es: 'colaboración, turnos y empatía', focus_en: 'collaboration, turn-taking, and empathy' },
  { age_min: 36, age_max: 48, domain_es: 'Creatividad', domain_en: 'Creativity', schema_target: 'none', focus_es: 'expresión creativa con materiales simples', focus_en: 'creative expression with simple materials' },
  { age_min: 48, age_max: 54, domain_es: 'Pensamiento Lógico', domain_en: 'Logical Thinking', schema_target: 'connecting', focus_es: 'retos de construcción y planificación', focus_en: 'construction challenges and planning' },
  { age_min: 54, age_max: 60, domain_es: 'Funciones Ejecutivas', domain_en: 'Executive Function', schema_target: 'positioning', focus_es: 'reglas, atención e inhibición', focus_en: 'rules, attention, and inhibition' },
  { age_min: 60, age_max: 72, domain_es: 'Lenguaje', domain_en: 'Language', schema_target: 'none', focus_es: 'lectura compartida y narración', focus_en: 'shared reading and storytelling' },
  { age_min: 72, age_max: 84, domain_es: 'Proyecto', domain_en: 'Project-Based', schema_target: 'transporting', focus_es: 'proyectos de varios días', focus_en: 'multi-day projects' },
  { age_min: 84, age_max: 96, domain_es: 'Motivación', domain_en: 'Motivation', schema_target: 'transforming', focus_es: 'intereses intensos y autonomía', focus_en: 'intense interests and autonomy' },
  { age_min: 96, age_max: 108, domain_es: 'Pensamiento Crítico', domain_en: 'Critical Thinking', schema_target: 'none', focus_es: 'investigación y argumentación', focus_en: 'research and argumentation' },
  { age_min: 108, age_max: 120, domain_es: 'Responsabilidad', domain_en: 'Responsibility', schema_target: 'connecting', focus_es: 'tareas reales con impacto', focus_en: 'real tasks with impact' },
  { age_min: 120, age_max: 132, domain_es: 'Identidad', domain_en: 'Identity', schema_target: 'none', focus_es: 'reflexión y toma de decisiones', focus_en: 'reflection and decision making' },
  { age_min: 132, age_max: 144, domain_es: 'Propósito', domain_en: 'Purpose', schema_target: 'none', focus_es: 'proyectos con significado social', focus_en: 'socially meaningful projects' },
];

module.exports = ACTIVITY_DEFINITIONS;
