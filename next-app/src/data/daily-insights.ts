export type DailyInsight = {
  advice: string;
  why: string;
  ageRangeMin: number;
  ageRangeMax: number;
  source: string;
};

export const dailyInsights: DailyInsight[] = [
  // 0-4m
  {
    advice: "Cuando {{child_name}} haga un sonido, responde como si fuera un turno de conversación y espera su siguiente señal.",
    why: "Ese ida y vuelta activa circuitos de lenguaje, atención y vínculo al mismo tiempo. En estos meses, el cerebro de {{child_name}} aprende que su voz cambia lo que pasa a su alrededor. Cada turno construye base para comunicación futura.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Harvard Center on the Developing Child",
  },
  {
    advice: "En el cambio de pañal, narra acciones simples: ‘abro’, ‘limpio’, ‘cierro’.",
    why: "La repetición en rutinas predecibles ayuda a que el cerebro de {{child_name}} conecte palabra con experiencia real. No es solo escuchar: está creando mapas tempranos de significado. Eso acelera comprensión antes de hablar.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Investigación temprana en adquisición de lenguaje",
  },
  {
    advice: "Mueve un objeto lentamente frente a {{child_name}} durante 30-60 segundos y haz pausas.",
    why: "Seguir con la mirada entrena atención visual y coordinación ojo-cerebro. Esos circuitos luego sostienen exploración, juego y aprendizaje. Las pausas permiten que el cerebro procese, no solo reaccione.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Neurodesarrollo visual en primera infancia",
  },
  {
    advice: "Antes de intervenir cuando llora, observa unos segundos para identificar qué necesita realmente.",
    why: "Cuando ajustas tu respuesta a la necesidad real, ayudas a que el sistema de estrés de {{child_name}} se regule mejor. Esa co-regulación repetida enseña seguridad corporal y emocional. Es una base profunda para autorregulación futura.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 RIE + ciencia de co-regulación",
  },
  {
    advice: "Haz una mini-rutina de sueño siempre igual: contacto, frase corta, voz suave.",
    why: "La predictibilidad reduce carga de alerta en el cerebro de {{child_name}}. Cuando sabe qué viene, gasta menos energía en defenderse y más en regularse. Rutina repetida = más calma y mejor descanso.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Desarrollo temprano del sistema de regulación",
  },
  {
    advice: "Ofrece una textura nueva segura y deja que {{child_name}} la explore sin apurar.",
    why: "Cada textura suma información sensorial que organiza cómo el cerebro interpreta el mundo. Esa organización temprana impacta calma, atención y tolerancia a novedades. Explorar despacio es aprendizaje de alta calidad.",
    ageRangeMin: 0,
    ageRangeMax: 4,
    source: "📚 Integración sensorial en lactantes",
  },

  // 5-8m
  {
    advice: "Cuando {{child_name}} deje caer algo, devuélvelo una vez y observa qué cambia en el siguiente intento.",
    why: "No está repitiendo por capricho: está comparando resultados. Su cerebro ensaya causa y efecto en tiempo real. Esa secuencia repetida construye pensamiento científico temprano.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Estudios de esquemas de juego temprano",
  },
  {
    advice: "Juega a esconder un objeto parcialmente y espera antes de ayudar.",
    why: "Cuando {{child_name}} busca lo que no ve, está fortaleciendo memoria de trabajo y permanencia de objeto. Ese salto cambia cómo recuerda, anticipa y se orienta. Es una pieza clave del pensamiento simbólico.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Cognición infantil temprana",
  },
  {
    advice: "Ofrece dos objetos seguros y deja que {{child_name}} elija con cuál empezar.",
    why: "Elegir activa circuitos de agencia y enfoque. Cuando una decisión es suya, el cerebro sostiene más tiempo la exploración. Estás entrenando iniciativa desde muy temprano.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Self-Determination Theory aplicada a infancia",
  },
  {
    advice: "Durante comida o juego, nombra la acción exacta que ves: ‘aprietas’, ‘golpeas’, ‘sacudes’.",
    why: "El cerebro de {{child_name}} fija mejor palabras cuando llegan pegadas a una acción real. Así no memoriza sonidos sueltos: construye significado útil. Cada palabra se vuelve herramienta.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Lenguaje situado en experiencias sensorimotoras",
  },
  {
    advice: "Cuando aparezca algo nuevo, ofrece una expresión calmada y clara antes de hablar mucho.",
    why: "{{child_name}} usa tu cara como referencia de seguridad. Tu señal emocional ajusta su respuesta de alerta o curiosidad en segundos. Tu calma le presta un sistema nervioso más estable.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Social Referencing en primera infancia",
  },
  {
    advice: "Haz turnos de sonido breves: tú dices una sílaba, esperas, y respondes su vocalización.",
    why: "Ese ritmo de turnos prepara el cerebro conversacional antes de las frases. {{child_name}} aprende timing, atención compartida y expectativa de respuesta. Es la base de dialogar después.",
    ageRangeMin: 5,
    ageRangeMax: 8,
    source: "📚 Serve & Return",
  },

  // 9-14m
  {
    advice: "Prepara un juego de meter y sacar con recipientes y objetos simples.",
    why: "Cada ciclo de ‘dentro/fuera’ entrena relaciones espaciales, categorías y permanencia. El cerebro de {{child_name}} está construyendo bases pre-matemáticas sin que parezca “clase”. Es pensamiento estructural en juego libre.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Desarrollo espacial y matemático temprano",
  },
  {
    advice: "Si {{child_name}} repite una acción muchas veces, deja que complete su ciclo antes de cambiar actividad.",
    why: "La repetición profunda consolida redes neuronales más estables. Cortar demasiado rápido interrumpe justo cuando el cerebro está afinando el patrón. Repetir es cómo se vuelve competente.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Aprendizaje por repetición y consolidación",
  },
  {
    advice: "Cuando {{child_name}} señale algo, primero sigue su foco y nombra lo que mira.",
    why: "Ese momento de atención compartida acelera comprensión de lenguaje. Su cerebro conecta ‘lo que veo’ con ‘la palabra que escucho’ de forma potente. Señalar se vuelve un puente cognitivo enorme.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Joint Attention research",
  },
  {
    advice: "Usa mini-secuencias en juego: ‘empezamos’, ‘paramos’, ‘guardamos’.",
    why: "Estas transiciones cortas entrenan control inhibitorio y flexibilidad. El cerebro de {{child_name}} practica cambiar de estado sin colapsar. Es una base real de función ejecutiva.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Dra. Adele Diamond — función ejecutiva",
  },
  {
    advice: "Cuando esté intentando algo difícil, espera unos segundos antes de ayudar.",
    why: "Ese margen permite que {{child_name}} pruebe estrategias propias. Cada intento exitoso fortalece la sensación interna de ‘puedo’. Competencia sentida = más perseverancia después.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Motivación y competencia en desarrollo temprano",
  },
  {
    advice: "Convierte el ‘tirar cosas’ en comparación: dos materiales, dos sonidos, misma acción.",
    why: "Comparar resultados activa circuitos de clasificación y predicción. El cerebro de {{child_name}} deja de solo actuar y empieza a inferir reglas. Es ciencia en miniatura, en casa.",
    ageRangeMin: 9,
    ageRangeMax: 14,
    source: "📚 Razonamiento causal temprano",
  },

  // 15-24m
  {
    advice: "Cuando {{child_name}} te muestre algo, describe un detalle concreto en vez de elogio genérico.",
    why: "Las descripciones precisas alimentan vocabulario útil que se pega mejor al contexto. Su cerebro no solo oye palabras: aprende a mirar con más detalle. Eso multiplica lenguaje y comprensión al mismo tiempo.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Harvard Center on the Developing Child",
  },
  {
    advice: "Al leer, deja que {{child_name}} decida cuándo pasar página, aunque cambie el orden.",
    why: "Cada decisión fortalece el circuito ‘evaluar-decidir-actuar’ en corteza prefrontal. A esta edad, esas conexiones crecen a gran velocidad. No solo leen un cuento: entrenan decisión + lenguaje en una sola acción.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Dra. Adele Diamond + lectura compartida",
  },
  {
    advice: "En juego simbólico, sigue su idea por 2-3 turnos antes de proponer cambios.",
    why: "Cuando sigues su narrativa, el cerebro de {{child_name}} sostiene mejor imaginación, memoria y secuencia. Esa continuidad hace el juego más profundo y organizado. Primero validación, luego expansión.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Juego simbólico y desarrollo cognitivo",
  },
  {
    advice: "En frustración, nombra emoción + límite en una frase corta y ofrece dos opciones.",
    why: "El cerebro emocional de {{child_name}} necesita contención clara, no discursos largos. Etiquetar emoción y dar elección reduce desborde y recupera control. Así aprende regulación desde dentro.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Co-regulación y alfabetización emocional temprana",
  },
  {
    advice: "Practica 45 segundos de observación silenciosa antes de intervenir en su juego.",
    why: "Esa pausa te deja ver el objetivo real de {{child_name}}. Cuando intervienes con precisión, su cerebro mantiene foco en vez de reiniciar. Menos interrupción, más aprendizaje profundo.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 RIE Observation",
  },
  {
    advice: "Dale una tarea real breve (guardar un bloque, llevar una servilleta).",
    why: "Participar en acciones reales activa sentido de pertenencia y competencia. El cerebro de {{child_name}} registra: ‘soy parte, yo puedo’. Esa identidad temprana impacta motivación futura.",
    ageRangeMin: 15,
    ageRangeMax: 24,
    source: "📚 Self-Determination Theory",
  },

  // 25-36m
  {
    advice: "Cuando {{child_name}} pregunte algo, responde con observación + una pregunta abierta corta.",
    why: "Ese formato mantiene activo su circuito de hipótesis, no solo memoria de respuestas. Su cerebro aprende a pensar sobre causas, no a repetir frases. Estás entrenando razonamiento.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Aprendizaje por indagación en primera infancia",
  },
  {
    advice: "En conflicto pequeño, guía 3 pasos: problema, opción, prueba.",
    why: "Esa secuencia organiza función ejecutiva en tiempo real. {{child_name}} practica inhibir impulso, elegir y revisar resultado. Es un ensayo temprano de resolución de problemas.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Función ejecutiva — investigación en preescolar temprano",
  },
  {
    advice: "Si cambia reglas en el juego, pídele que te explique su nueva regla.",
    why: "Definir reglas activa pensamiento abstracto y lenguaje metacognitivo. Su cerebro aprende a representar ideas, no solo acciones. Eso fortalece juego social y autorregulación.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Vygotsky y juego con reglas",
  },
  {
    advice: "Convierte una rutina diaria en secuencia de 3 pasos y pídele anticipar el siguiente.",
    why: "Anticipar fortalece memoria de trabajo y planificación. El cerebro de {{child_name}} deja de reaccionar y empieza a prever. Eso reduce fricción y mejora cooperación real.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Planificación temprana y memoria de trabajo",
  },
  {
    advice: "Ofrece materiales abiertos (cajas, telas, cucharas) y menos instrucciones.",
    why: "Cuando el objeto no “dicta” el uso, {{child_name}} tiene que crear intención y secuencia. Esa libertad activa creatividad y control ejecutivo simultáneamente. Más invención, menos pasividad.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Open-ended play research",
  },
  {
    advice: "Sustituye ‘¡bravo!’ por feedback de proceso: ‘probaste tres formas hasta lograrlo’.",
    why: "El cerebro de {{child_name}} aprende a valorar estrategia, no solo resultado. Eso mejora persistencia cuando algo no sale a la primera. Le enseñas cómo aprender, no solo cómo rendir.",
    ageRangeMin: 25,
    ageRangeMax: 36,
    source: "📚 Motivación y process praise",
  },
];
