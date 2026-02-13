export type DailyInsight = {
  text: string;
  ageRangeMin: number;
  ageRangeMax: number;
  source: string;
};

export const dailyInsights: DailyInsight[] = [
  // 0-4 months
  {
    text: "Hoy, cuando {{child_name}} haga un sonido, espera un segundo y respóndele como si fuera una conversación real. Ese micro-turno enseña que su voz tiene efecto en el mundo. Repite este ida y vuelta 4 o 5 veces y luego haz una pausa para observar su respuesta. Estos ciclos cortos construyen atención y conexión emocional desde la base.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Serve & Return — Harvard Center on the Developing Child",
  },
  {
    text: "Durante el cambio de pañal, narra exactamente lo que haces: 'abro', 'limpio', 'cierro'. A esta edad, {{child_name}} aprende lenguaje a través de rutinas repetidas y predecibles. No necesitas frases largas: palabras claras, tono cálido y repetición constante. En pocas semanas, notarás más contacto visual y anticipación.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Sensitive Periods for Language — Early Development Research",
  },
  {
    text: "Cuando {{child_name}} esté alerta, mueve un objeto lento de izquierda a derecha a unos 20-25 cm de su cara. Detente en el centro para darle tiempo de reenfocar. Este ejercicio breve fortalece seguimiento visual y control de atención. Hazlo solo 1-2 minutos para respetar su ventana de regulación.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Visual Tracking & Attention Windows — Infant Neurodevelopment",
  },
  {
    text: "Si {{child_name}} llora, primero observa 5-10 segundos: ¿hambre, sobreestimulación o necesidad de contacto? Esta pausa consciente te ayuda a responder la necesidad real en vez de reaccionar en automático. Después, ajusta una sola variable (luz, ruido o posición) y evalúa. Esa observación fina es práctica RIE en acción.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 RIE Observation — Responsive Caregiving Framework",
  },
  {
    text: "Hoy prueba una secuencia de calma siempre igual antes de dormir: voz baja, contacto, frase corta repetida. Para {{child_name}}, la predictibilidad reduce carga de estrés y facilita autorregulación emergente. Mantén la rutina simple y estable por varios días antes de cambiarla. La consistencia es más poderosa que la perfección.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Co-regulation & Early Executive Function Foundations",
  },
  {
    text: "En un momento tranquilo, ofrece a {{child_name}} una textura segura distinta (tela suave, manta tejida, paño liso). Deja que la explore con manos y cuerpo sin dirigir cada movimiento. Esta exploración sensorial temprana organiza mapas cerebrales de tacto y seguridad. Menos estímulos, mejor aprendizaje.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Sensory Integration in Early Infancy",
  },

  // 5-8 months
  {
    text: "Cuando {{child_name}} deje caer algo, no lo interpretes como 'mala conducta': míralo como experimento. Devuélvelo una vez y espera qué cambia en el segundo intento (fuerza, ángulo, mirada). Ese ajuste muestra hipótesis en tiempo real. Estás viendo ciencia aplicada en miniatura.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Schema Theory (Trajectory Schema) — Early Play Patterns",
  },
  {
    text: "Hoy juega al '¿dónde está?' con un objeto parcialmente escondido. Espera antes de revelar para dar espacio a que {{child_name}} busque con la mirada o la mano. Esa pequeña frustración tolerable fortalece memoria de trabajo y permanencia del objeto. Haz 3 rondas y termina en éxito.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Object Permanence — Cognitive Development Milestones",
  },
  {
    text: "Pon dos objetos seguros con texturas distintas y deja que {{child_name}} elija cuál explorar primero. No redirijas de inmediato; observa 60 segundos en silencio activo. Elegir y sostener la elección construye autonomía temprana. Es una base concreta de Self-Determination Theory.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Self-Determination Theory (Autonomy Support)",
  },
  {
    text: "Durante la comida, nombra acciones simples: 'aprietas', 'tocas', 'golpeas'. Para {{child_name}}, el lenguaje ligado a acción real se fija mejor que palabras aisladas. Mantén frases cortas y repetibles para no saturar. Tu objetivo es mapear palabra + experiencia.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Language Mapping Through Sensorimotor Experience",
  },
  {
    text: "Si aparece una novedad (ruido, visita, objeto nuevo), deja que {{child_name}} mire tu cara primero. Luego ofrece una señal emocional clara y calmada. Este proceso de social referencing le enseña cómo interpretar incertidumbre. Tu rostro funciona como brújula regulatoria.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Social Referencing — Socioemotional Development",
  },
  {
    text: "Prueba una mini-rutina de turnos con sonidos: tú haces 'pa', esperas, y luego respondes a cualquier vocalización de {{child_name}}. No busques exactitud, busca ritmo compartido. Estos turnos entrenan atención conjunta y precursores conversacionales. Es Serve & Return en formato sonoro.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Serve & Return + Early Communication Turn-Taking",
  },

  // 9-14 months
  {
    text: "Hoy prepara una cesta con 3 contenedores y 6 objetos para meter/sacar. No muestres 'la forma correcta'; deja que {{child_name}} pruebe secuencias propias. Esta repetición construye clasificación, volumen y relación espacial. Es pensamiento matemático temprano disfrazado de juego.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Schema Theory (Enclosure/Containment) + Early Math Foundations",
  },
  {
    text: "Cuando {{child_name}} repita una acción muchas veces, evita cortar el ciclo demasiado pronto. La repetición es cómo el cerebro consolida patrones estables. Puedes ampliar la dificultad solo un 10% (objeto distinto, distancia mayor). Eso lo mantiene dentro de su ZPD sin frustrarlo.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Zone of Proximal Development — Vygotskian Scaffolding",
  },
  {
    text: "Si {{child_name}} señala algo, sigue el gesto y nombra lo que observa antes de hacer preguntas. Esta secuencia refuerza atención conjunta y comprensión semántica. Un buen patrón es: mirar, nombrar, pausar, esperar respuesta. Menos preguntas, más conexión.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Joint Attention & Early Language Growth",
  },
  {
    text: "Para apoyar autorregulación, crea micro-rutinas de inicio-cierre en el juego: 'empezamos', 'paramos', 'guardamos'. {{child_name}} aprende límites temporales sin confrontación constante. Esa previsibilidad entrena flexibilidad y control inhibitorio emergente. Son cimientos de función ejecutiva.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Executive Function Foundations in Toddlerhood",
  },
  {
    text: "Cuando {{child_name}} intente alcanzar algo desafiante, espera 5 segundos antes de ayudar. Si no puede, ofrece una pista mínima en vez de resolverle la tarea. Ese equilibrio crea sensación de competencia real. Aprender 'yo puedo con apoyo' vale más que hacerlo perfecto.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Self-Determination Theory (Competence) + Guided Support",
  },
  {
    text: "Hoy transforma el 'tirar cosas' en juego científico: usa dos materiales (metal y tela) y observa con {{child_name}} cómo cambia sonido y rebote. Nombra diferencias concretas en cada intento. Así convierte curiosidad impulsiva en comparación sistemática. Es método científico temprano.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Early Scientific Reasoning Through Repetition",
  },

  // 15-24 months
  {
    text: "Cuando {{child_name}} te muestre algo, en vez de elogio genérico describe un detalle exacto: color, forma o textura. Esa respuesta descriptiva expande vocabulario útil mucho más que '¡qué lindo!'. Haz una pausa para que intente responder con gesto o palabra. Así conviertes cada interacción en aprendizaje lingüístico activo.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Serve & Return + Descriptive Language Expansion",
  },
  {
    text: "En lectura de hoy, deja que {{child_name}} decida cuándo pasar página, aunque cambie el orden del cuento. El control de la secuencia fortalece agencia y atención sostenida. Tú acompaña con frases cortas sobre lo que él/ella eligió mirar. El objetivo no es 'terminar el libro', es construir función ejecutiva y lenguaje.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Self-Determination (Autonomy) + Executive Function in Shared Reading",
  },
  {
    text: "Si {{child_name}} entra en juego simbólico, únete sin dirigir: sigue su idea por 2-3 turnos antes de proponer algo nuevo. Esta validación fortalece imaginación, flexibilidad cognitiva y vínculo. Después puedes añadir una variación simple para ampliar su ZPD. Primero conexión, luego expansión.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Pretend Play + ZPD Scaffolding",
  },
  {
    text: "Cuando aparezca frustración, etiqueta emoción y límite en una frase corta: 'estás enojado, no te sale aún'. Evita discursos largos en pleno pico emocional. Luego ofrece dos opciones simples para recuperar control. Este patrón enseña regulación sin invalidar la experiencia.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Co-regulation + Early Emotional Literacy",
  },
  {
    text: "Prueba el ritual 'primero-observo-luego-actúo': antes de intervenir en el juego de {{child_name}}, mira 45 segundos en silencio. Notarás patrones que se pierden cuando intervenimos demasiado rápido. Esa observación te permite apoyar exactamente donde lo necesita. Es práctica RIE aplicada a la vida real.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 RIE Observation + Respectful Caregiving",
  },
  {
    text: "Hoy ofrece una tarea real y breve: llevar una servilleta, guardar un bloque, traer un zapato. Participar en actividades auténticas aumenta sentido de competencia y pertenencia. Celebra el esfuerzo específico, no el resultado perfecto. {{child_name}} está construyendo identidad de 'soy capaz'.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Self-Determination Theory (Competence & Relatedness)",
  },

  // 25-36 months
  {
    text: "Cuando {{child_name}} pregunte '¿por qué?', responde primero con una observación y luego una pregunta abierta breve. Este formato sostiene curiosidad y evita cerrar la conversación demasiado rápido. Intenta: 'Veo que te interesa cómo cae... ¿qué crees que pasará si usamos otro objeto?'. Estás entrenando razonamiento, no memorización.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Inquiry-Based Learning + Early Scientific Thinking",
  },
  {
    text: "En conflictos pequeños, guía una secuencia de 3 pasos: nombrar problema, proponer opción, probar solución. Hazlo con frases muy cortas para que {{child_name}} pueda internalizarlas. Repetida cada día, esta estructura fortalece flexibilidad y control inhibitorio. Es entrenamiento directo de función ejecutiva.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Executive Function Coaching in Early Childhood",
  },
  {
    text: "Si {{child_name}} cambia reglas en el juego, no lo corrijas de inmediato: pregúntale cuál es la nueva regla. Definir reglas propias ejercita pensamiento abstracto y metacognición incipiente. Luego modela tomar turnos con esa regla para añadir estructura social. Juego + negociación = desarrollo superior.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Vygotsky, Rule-Based Play, and Self-Regulation",
  },
  {
    text: "Hoy convierte una rutina (baño, comida, salida) en secuencia visual hablada de 3 pasos. Pídele a {{child_name}} que anticipe el siguiente paso antes de hacerlo. Anticipar fortalece memoria de trabajo y planificación. Esta práctica reduce fricción diaria y aumenta cooperación genuina.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Planning Skills and Working Memory Scaffolds",
  },
  {
    text: "Durante juego libre, ofrece materiales abiertos (cajas, telas, cucharas) en lugar de juguetes de una sola función. {{child_name}} tendrá que decidir propósito, secuencia y roles, lo que aumenta creatividad y función ejecutiva. Intervén solo para ampliar lenguaje descriptivo. Menos instrucciones, más pensamiento propio.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Open-Ended Play + Executive Function and Creativity",
  },
  {
    text: "Cuando {{child_name}} logre algo, cambia '¡bravo!' por retroalimentación específica: 'probaste tres formas hasta que encajó'. Este tipo de feedback fortalece mentalidad de proceso y persistencia. También ayuda a que identifique estrategias transferibles a otros retos. Estás enseñando cómo aprender, no solo qué lograr.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Process Praise, Motivation, and Growth-Oriented Learning",
  },

  // Extra pool for better rotation quality (cross-range precision)
  {
    text: "Hoy haz una pausa intencional después de cada iniciativa de {{child_name}} en el juego. Esa pausa le da tiempo para planear el siguiente paso en lugar de reaccionar por impulso. Verás más secuencias largas y menos cambios abruptos de actividad. Es una forma simple de cultivar autorregulación.",
    ageRangeMin: 15,
    ageRangeMax: 36,
    source: "📚 Executive Function: Inhibitory Control Through Adult Pacing",
  },
  {
    text: "Cuando {{child_name}} repita una acción aparentemente 'sin sentido', descríbela en voz alta sin juicio: 'lo metes, lo sacas, lo vuelves a meter'. Esa narración valida su investigación y añade lenguaje funcional. Después de varias rondas, introduce una variación mínima para expandir su esquema. Observación primero, intervención después.",
    ageRangeMin: 9,
    ageRangeMax: 24,
    source: "📚 Schema Theory + RIE Neutral Observation",
  },
  {
    text: "En un momento de conexión, coloca tu atención completa durante 5 minutos sin teléfono ni multitarea. Sigue la iniciativa de {{child_name}} y refleja lo que hace. Micro-momentos de presencia total tienen un impacto desproporcionado en seguridad emocional. Calidad de atención supera cantidad de minutos.",
    ageRangeMin: 0,
    ageRangeMax: 36,
    source: "📚 Serve & Return + Attachment-Sensitive Interaction",
  },
  {
    text: "Si notas resistencia en transiciones, prueba avisos corporales y verbales: 'dos minutos más', luego señal física suave y frase final consistente. {{child_name}} procesa mejor cuando el cambio es predecible y gradual. Repetir el mismo patrón reduce lucha de poder y mejora cooperación. La regulación se entrena en lo cotidiano.",
    ageRangeMin: 15,
    ageRangeMax: 36,
    source: "📚 Transition Scaffolds and Co-regulation Practices",
  },
  {
    text: "Hoy elige una actividad y súbele o bájale dificultad según respuesta de {{child_name}} en tiempo real. Si se frustra, reduce una variable; si domina rápido, añade un pequeño reto. Ese ajuste dinámico mantiene aprendizaje dentro de la ZPD. El mejor plan es el que se adapta al niño frente a ti.",
    ageRangeMin: 5,
    ageRangeMax: 36,
    source: "📚 Zone of Proximal Development — Adaptive Scaffolding",
  },
  {
    text: "Cuando {{child_name}} explore algo nuevo, evita interrumpir con demasiadas instrucciones seguidas. Una sola sugerencia clara y luego observación silenciosa suele producir más iniciativa. La autonomía guiada construye confianza interna y persistencia. Menos dirección, más descubrimiento.",
    ageRangeMin: 9,
    ageRangeMax: 36,
    source: "📚 Self-Determination Theory (Autonomy Support) + RIE",
  },
];
