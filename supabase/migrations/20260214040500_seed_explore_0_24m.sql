-- Fill missing Learn top-content bands for 0-24 months (ES + EN)

INSERT INTO explore_brain_cards (emoji, title, body, domain, age_min_months, age_max_months, language)
VALUES
-- 0-4 ES
('👀','Tu cara es su mapa del mundo','A esta edad, {child_name} ve mejor a corta distancia. Por eso busca tu cara: ahí aprende seguridad, ritmo y lenguaje emocional desde el primer día.','Visual',0,4,'es'),
('🗣️','El lenguaje empieza antes de hablar','Aunque aún no diga palabras, {child_name} está clasificando sonidos y turnos de conversación. Cada pausa y respuesta tuya fortalece su cerebro del lenguaje.','Lenguaje',0,4,'es'),
('🤱','Serve and return en tiempo real','Cuando {child_name} mira, balbucea o se mueve y tú respondes, se construyen conexiones clave para regulación emocional y aprendizaje futuro.','Socioemocional',0,4,'es'),
-- 4-8 ES
('👄','Explora con la boca porque investiga','Meter objetos a la boca es una forma avanzada de explorar texturas, temperatura y forma. No es desorden: es ciencia sensorial temprana.','Sensorial',4,8,'es'),
('🫣','Empieza la permanencia del objeto','{child_name} comienza a entender que algo sigue existiendo aunque no lo vea. Juegos simples como esconder y aparecer fortalecen esta base cognitiva.','Cognitivo',4,8,'es'),
('🙂','Tu cara guía su seguridad','Antes de explorar, {child_name} te mira para “leer” si el entorno es seguro. Tu calma regula su valentía para descubrir.','Social',4,8,'es'),
-- 8-14 ES
('⬇️','Tirar cosas también es investigación','Cuando {child_name} suelta objetos, está probando gravedad, sonido, velocidad y causa-efecto una y otra vez con nuevas hipótesis.','Científico',8,14,'es'),
('📦','Los esquemas de juego toman forma','Repetir acciones como meter/sacar, girar o transportar no es manía: son patrones de pensamiento que organizan su comprensión del mundo.','Cognitivo',8,14,'es'),
('🚶','Moverse cambia su mente','La movilidad amplía lo que {child_name} puede elegir, comparar y recordar. Caminar transforma su mapa espacial y su sentido de agencia.','Motor',8,14,'es'),
-- 14-24 ES
('💬','Llega la explosión del lenguaje','En esta etapa, {child_name} conecta palabras con intención más rápido. Comprende mucho más de lo que puede decir, y eso es totalmente normal.','Lenguaje',14,24,'es'),
('🌩️','Las rabietas son sobrecarga, no maldad','Cuando se desregula, {child_name} necesita co-regulación primero. El autocontrol completo todavía está en construcción.','Emocional',14,24,'es'),
('✋','El “no” también es crecimiento','Decir “no” ayuda a {child_name} a practicar autonomía e identidad. Límites claros + conexión afectiva = desarrollo sano.','Autonomía',14,24,'es'),

-- 0-4 EN
('👀','Your face is their map of the world','At this age, {child_name} sees best up close. That is why your face becomes their first anchor for safety, rhythm, and emotional language.','Visual',0,4,'en'),
('🗣️','Language starts before words','Even before speaking, {child_name} is mapping sounds and conversational turns. Your response timing strengthens early language networks.','Language',0,4,'en'),
('🤱','Serve and return in real time','When {child_name} looks, coos, or moves and you respond, core pathways for regulation and learning are strengthened.','Social-Emotional',0,4,'en'),
-- 4-8 EN
('👄','Mouthing is active investigation','Putting things in the mouth helps {child_name} compare texture, temperature, and shape. It is sensory science, not random behavior.','Sensory',4,8,'en'),
('🫣','Object permanence is emerging','{child_name} is beginning to understand that things still exist when out of sight. Simple hide-and-reveal play supports this shift.','Cognitive',4,8,'en'),
('🙂','Your face guides confidence','Before exploring, {child_name} checks your expression for safety cues. Your calm supports brave exploration.','Social',4,8,'en'),
-- 8-14 EN
('⬇️','Dropping things is real experimentation','When {child_name} drops objects, they are testing gravity, sound, speed, and cause-effect with repeated variations.','Scientific',8,14,'en'),
('📦','Play schemas become visible','Repeating patterns like in/out, rotating, and transporting reflects how {child_name} organizes thought about the physical world.','Cognitive',8,14,'en'),
('🚶','Mobility changes the mind','Independent movement expands choice, comparison, and memory. Walking transforms spatial thinking and agency.','Motor',8,14,'en'),
-- 14-24 EN
('💬','The language burst is here','In this stage, {child_name} links words and intention quickly. They understand far more than they can say, and that is normal.','Language',14,24,'en'),
('🌩️','Tantrums are overload, not badness','During dysregulation, {child_name} needs co-regulation first. Full self-control is still under construction.','Emotional',14,24,'en'),
('✋','No also means growth','Saying no helps {child_name} practice autonomy and identity. Clear boundaries plus connection support healthy development.','Autonomy',14,24,'en');

INSERT INTO daily_tips (body, age_min_months, age_max_months, language)
VALUES
('Durante un cambio de pañal o comida, pausa 3 segundos después de hablar. Esa pausa invita a {child_name} a responder y fortalece turnos conversacionales.',0,4,'es'),
('Juega a esconder y aparecer con una tela por 2 minutos. Repetición breve + emoción = aprendizaje potente para {child_name}.',4,8,'es'),
('Cuando {child_name} tire algo, en vez de frenarlo de inmediato, narren juntos: “cayó rápido / sonó fuerte / rebotó”.',8,14,'es'),
('Cuando aparezca un “no”, ofrece 2 opciones válidas. Así {child_name} practica autonomía sin perder estructura.',14,24,'es'),
('During diapering or feeding, pause 3 seconds after speaking. That pause invites {child_name} to respond and builds conversational turns.',0,4,'en'),
('Play short hide-and-reveal for 2 minutes. Brief repetition plus emotion is powerful learning for {child_name}.',4,8,'en'),
('When {child_name} drops something, narrate together before stopping: “fast / loud / bounce.” Turn it into a mini experiment.',8,14,'en'),
('When no shows up, offer 2 valid choices. {child_name} practices autonomy while staying inside clear structure.',14,24,'en');
