-- ============================================================
-- LITTLE WONDER: Complete Activities Library — ENGLISH
-- PART 1: 0-24 months
-- ============================================================

INSERT INTO activities (title, subtitle, emoji, schema_target, domain, duration_minutes, materials, steps, science_note, age_min_months, age_max_months, language) VALUES

-- ============================================================
-- 0-3 MONTHS: Early Explorer
-- ============================================================

('Follow My Face', 'Your face is their favorite toy', '👤', 'trajectory', 'Visual', 5,
ARRAY['Just your face'],
'Lie down facing your baby at about 10-12 inches (the perfect distance for their vision). Move your face slowly side to side. Pause. Smile. When their eyes follow your movement, you''re watching visual trajectory in action.

Try it: move left and wait. Do they follow? Now right. How far can they track before losing you?

Then try moving your face slowly upward. This axis is harder and works different eye muscles.',
'Visual tracking is the first expression of the trajectory schema. At this age, eyes are their primary exploration tool. Each time they follow your face, they strengthen the neural pathways connecting vision to attention — the foundation of all future exploration.',
0, 3, 'en'),

('Sound Conversation', 'The first serve and return', '🗣️', 'positioning', 'Language', 5,
ARRAY['Just your voice'],
'When your baby makes a sound — a coo, an "ahhh," anything — imitate it. Same tone. Then wait. Count to 5 in your head.

If they make another sound, respond again. You''re having a conversation. It doesn''t matter that these aren''t words — what matters is the rhythm: you speak, I speak, you speak, I speak.

Try varying: if they say "ahhh," respond with "ahhh" then add "ohhh." Do they try to imitate you?',
'Each exchange builds connections in Broca''s area (language). An MIT study showed that these conversational turns — not the quantity of words — are what most impacts language development.',
0, 3, 'en'),

('The Magic Scarf', 'Visual surprise with fabric', '🧣', 'enveloping', 'Sensory', 5,
ARRAY['A light scarf or muslin cloth'],
'Hold a light cloth about 12 inches above your baby''s face. Let it fall gently over their face for one second and remove it: "Hello!"

Repeat. Do they get surprised each time? Do they start to anticipate? Do they move their arms before it falls?

Try cloths of different textures. Always remove quickly — this is about the surprise of appearing/disappearing.',
'This is the beginning of the enveloping schema and the foundation of object permanence: things exist even when I can''t see them. Each "appearance" strengthens the connection between memory and perception.',
0, 3, 'en'),

('Texture Concert', 'Guided sensory safari', '🖐️', 'transforming', 'Sensory', 10,
ARRAY['3-4 different fabrics: cotton, velvet, towel, silk or similar'],
'Gently brush each fabric against your baby''s cheek, one at a time. Name what they feel: "This is sooooft" (slowly and softly). "This one has texture!" (with more emphasis).

Watch their reactions. Which do they like most? Which surprises them? Try on their open hands. Then feet. Different body parts have different sensitivity.

Give time between textures — their brain needs to process.',
'Skin is the largest sensory organ. At this age, your baby is building a sensory map of the world. Each new texture creates a category in their brain: soft, rough, cold, warm. This tactile classification is a precursor to categorical thinking.',
0, 3, 'en'),

('High Contrast Mobile', 'DIY visual training', '⬛', 'trajectory', 'Visual', 10,
ARRAY['Black and white cardstock', 'Scissors', 'String', 'A hanger or stick'],
'Cut simple shapes from black and white cardstock: circles, spirals, stripes. Hang them about 12 inches above where your baby spends time on their back.

Watch: which shape attracts their gaze most? Do they follow shapes when a breeze moves them? Every few days, swap one shape for a new one. The "new" one captures more attention — that''s their brain seeking novelty.

Tip: spirals and checkerboard patterns are most attractive to newborns.',
'Newborns see high contrasts best (black and white) because their color-detecting cones are still maturing. Their vision reaches about 10-12 inches — exactly the distance to your face during feeding. Each time they focus on and follow an object, they strengthen the pathways between retina and visual cortex.',
0, 3, 'en'),

-- ============================================================
-- 3-6 MONTHS: Sensory Discoverer
-- ============================================================

('Reach and Grab', 'The first "I can do it"', '🎯', 'trajectory', 'Motor', 10,
ARRAY['A colorful toy or rattle'],
'Hold a toy within your baby''s reach. Wait. Don''t put it in their hand — let them try to reach it.

If they touch it, celebrate gently: "You reached it!" If they bat it and it moves: they just discovered cause and effect.

Vary the position: left, right, higher. Each position requires different motor planning.',
'The transition from accidental batting to intentional reaching is one of the biggest cognitive leaps of the first year. Your baby goes from "things happen" to "I MAKE things happen." This is the birth of agency.',
3, 6, 'en'),

('The Magic Mirror', 'Social visual discovery', '🪞', 'positioning', 'Social-Emotional', 10,
ARRAY['An unbreakable mirror'],
'Place a safe mirror in front of your baby. Do they look at their reflection? Smile? Try to touch the "other baby"?

Sit beside them so they can see your reflection too. Make faces: stick out your tongue, open your eyes wide, smile.

Cover and uncover the mirror: "Here we are!" Object permanence + social play.',
'At this age, your baby doesn''t know that''s them in the mirror — that doesn''t happen until 18-24 months. But mirrors are fascinating because they show a face that responds perfectly to every movement. It''s perfect visual serve and return.',
3, 6, 'en'),

('Rain of Sounds', 'Sound cause and effect', '🎵', 'trajectory', 'Sensory', 10,
ARRAY['Rattle, wooden spoon, crinkle paper, jingle bell'],
'Put each object in their hand, one at a time. When they shake it and it makes sound: "You made music!"

Do they repeat the motion? That''s intentional cause and effect. Try two sound objects — do they choose one? Alternate?

Tap a simple rhythm and wait. Do they try to imitate?',
'Between 3-6 months, your baby repeats actions that produce interesting effects (Piaget: secondary circular reactions). Each sound produced and repeated is a cause-and-effect experiment that strengthens their sense of agency.',
3, 6, 'en'),

('Floating Bubbles', 'Visual tracking and wonder', '🫧', 'trajectory', 'Visual', 10,
ARRAY['Bubble solution'],
'Blow bubbles in front of your baby. Do they follow with their eyes? Do they track one bubble or jump between several?

Blow one big, slow bubble. Do they follow it until it pops? That''s sustained attention.

When they can bat at things, blow bubbles within reach. The moment they touch one and it pops: cause and effect + surprise + object permanence.',
'Bubbles combine three stimuli: movement (trajectory), shine (visual attention), and disappearance (object permanence). Each bubble tracked strengthens the vision-attention connection fundamental to all future exploration.',
3, 6, 'en'),

('Tummy Time Mountain', 'Strengthening with purpose', '⛰️', 'trajectory', 'Motor', 10,
ARRAY['Rolled towel', 'Motivating toy'],
'Place a rolled towel under your baby''s chest during tummy time (reduces difficulty). Put an interesting toy just out of reach.

Do they stretch their arms? Lift their head? Don''t bring it closer immediately — that productive frustration is the engine of motivation.

When they make an effort: "Almost there!" If they get too frustrated, move the toy a bit closer.',
'Tummy time isn''t just exercise — it''s a cognitive problem. "I want that toy, how do I get there?" requires motor planning, persistence, and problem-solving.',
3, 6, 'en'),

-- ============================================================
-- 6-9 MONTHS: Active Explorer
-- ============================================================

('Treasure Box', 'In and out forever', '📦', 'enclosure', 'Cognitive', 15,
ARRAY['Wide-mouth container', '5-6 varied objects'],
'Put objects inside the container. Place it in front of your baby.

Do they reach in and pull things out? Dump everything? Try putting things back in?

Model: put one in slowly — "in." Take it out — "out." Vary containers: wide vs. narrower mouth.',
'Putting objects in and out of containers is crucial at this age. Your baby learns: in/out, full/empty, visible/hidden. Pre-verbal spatial and mathematical concepts. An early form of the enclosure schema.',
6, 9, 'en'),

('Kitchen Drums', 'Cause and effect orchestra', '🥁', 'trajectory', 'Sensory', 10,
ARRAY['Pots and tupperware face-down', 'Wooden and metal spoons'],
'Put pots face-down. Give them a wooden spoon. Do they bang? Celebrate! Harder? "That was loud!"

Add a metal spoon — do they notice the sound changes? Put a cloth over a pot — the sound is muffled. "It changed!"

Model a simple rhythm (tap-tap). Do they try to imitate?',
'Each hit is a triple experiment: motor (coordination), acoustic (what sound?), and cause-effect. Spontaneous variation — louder, softer, different spots — is genuine scientific experimentation.',
6, 9, 'en'),

('The Passing Game', 'Hand to hand', '🤲', 'transporting', 'Motor', 10,
ARRAY['3-4 objects of different sizes'],
'Offer one object. When they take it, offer another to the other hand. Can they hold two? Do they transfer the first to free up a hand?

With both hands full, offer a third. Do they drop one? Tuck it between their legs?

Vary sizes: a big ball needs two hands — what do they do with what they were holding?',
'Passing objects between hands (manual transfer) requires bilateral planning: "I''ll move this HERE so I can grab THAT." The beginning of the transporting schema and bimanual coordination.',
6, 9, 'en'),

('Advanced Peek-a-Boo', 'The brain-building game', '🙈', 'enveloping', 'Cognitive', 10,
ARRAY['Cloth or scarf', 'Small toy'],
'**Level 1:** Cover your face. "Where am I?" Uncover. "Here I am!"
**Level 2:** Cover THEIR face gently. Can they pull the cloth off?
**Level 3:** Cover a toy while they watch. Do they look for it?
**Level 4:** Cover the toy, wait 3 seconds. Do they still look?

Each level works a different skill.',
'Peek-a-boo works object permanence, working memory, prediction, and emotional regulation. That''s why they never get bored: each repetition refines a different skill.',
6, 9, 'en'),

('Texture Safari', 'Intensive sensory exploration', '🧸', 'transforming', 'Sensory', 15,
ARRAY['Sponge, soft brush, crinkled foil, plush fabric, cold fruit, something warm'],
'Sit your baby down with objects within reach. Which do they touch first? Put in their mouth? Throw away?

Name sensations: "Rough." "Cold." "Sooooft." Offer contrasts: cold after warm, soft after rough.',
'At this age, the mouth is still the most precise sensor, but hands are catching up fast. Each texture creates a sensory category. What''s fascinating: they don''t just register — they compare with previous ones. The beginning of classificatory thinking.',
6, 9, 'en'),

-- ============================================================
-- 9-12 MONTHS: Early Scientist
-- ============================================================

('The Tower to Destroy', 'Building is good. Destroying is better.', '🏗️', 'trajectory', 'Cognitive', 10,
ARRAY['Soft blocks or stackable tupperware'],
'Build a 3-4 block tower in front of your baby. Wait. Do they knock it down? "CRASH! It all fell!"

Build another. Wait. Knock down again.

Now: can they put a block on top? Model slowly. Do they imitate?

The build-destroy cycle IS the goal. Destroying requires cause and effect, timing, coordination. Just as cognitively rich as building.',
'The build-destroy cycle is one of the most misunderstood behaviors. Destroying isn''t aggression — it''s experimentation with force, gravity, and transformation. Your baby learns that their actions have predictable, dramatic consequences.',
9, 12, 'en'),

('Hidden Treasure', 'Working memory in action', '🔍', 'enveloping', 'Cognitive', 10,
ARRAY['2-3 opaque cups', 'Small favorite toy'],
'Show the toy. Put it under a cup while they watch. "Where is it?"

Do they lift the right cup? Now use two cups. Advanced: move the cups slowly. Can they track the right one?

If they always search where they found it last time (not where you hid it): that''s Piaget''s "A-not-B error" — perfectly normal and a window into how memory works.',
'This game directly works object permanence (Piaget substage 4-5) and working memory. The A-not-B error gradually disappears between 10-12 months as the prefrontal cortex matures.',
9, 12, 'en'),

('Pillow Maze', 'Spatial navigation', '🏔️', 'trajectory', 'Motor', 15,
ARRAY['Pillows, couch cushions', 'Motivating toy'],
'Build a mini obstacle course with pillows. Put the toy at the end. Let them navigate: crawling, climbing, going around.

Don''t help immediately. Do they go over? Around? Change routes?

Make it more complex: add a higher cushion, a "tunnel" with a blanket over chairs.',
'Spatial navigation activates the hippocampus. Each route decision is spatial problem-solving: planning, risk assessment, persistence. Independent mobility is one of the greatest catalysts of cognitive development in the first year.',
9, 12, 'en'),

('Connect and Disconnect', 'Early engineering', '🔗', 'connecting', 'Fine Motor', 10,
ARRAY['Large Duplo, pop beads, or nesting cups'],
'Connect two pieces slowly while they watch. Separate them. "They came apart!"

Do they try to connect? Separating is probably easier than joining. Both are connecting schema.

Give things with lids: tupperware, boxes. Can they put the lid on? Take it off?',
'The connecting schema — joining and separating things — is the foundation of engineering thinking: how do things hold together? Each tupperware lid removed is an engineering problem solved.',
9, 12, 'en'),

('Traveling Spoon', 'Transport with tools', '🥄', 'transporting', 'Cognitive', 10,
ARRAY['2 containers', 'Spoons', 'Dry cereal or pasta'],
'Put a container with cereal and an empty one beside it. Give them a spoon. Do they try to move contents from one to the other?

If they use hands instead: perfect. The goal is transporting, not the tool. Vary materials: water is harder than cereal.',
'Transporting materials between containers combines: fine motor, spatial, quantitative, and cause-effect skills. Your baby is doing pre-math without knowing it. The spoon as a tool adds cognitive complexity.',
9, 12, 'en'),

-- ============================================================
-- 12-18 MONTHS: Little Physicist
-- ============================================================

('The Ramp Laboratory', 'Physics with cardboard', '🏹', 'trajectory', 'Cognitive', 20,
ARRAY['Cardboard or thick book', 'Balls of different sizes', 'Toy cars'],
'Lean cardboard against the couch to make a ramp. Release a ball. "Look how it rolls!"

Experiment together:
- Steeper vs. flatter: what changes?
- Big ball vs. small: which is faster?
- Car vs. ball: which goes further?
- Put a cup at the end as a target. Can they aim for it?',
'Each variation is a controlled experiment: change ONE variable and observe the result. This is literally the scientific method. They''re in Piaget''s "tertiary circular reactions" — deliberate experimentation, not just repetition.',
12, 18, 'en'),

('The Big Transport', 'Moving day around the house', '🚚', 'transporting', 'Gross Motor', 15,
ARRAY['Bag, basket, or pull wagon', 'Various objects'],
'Give them a bag: "Can you help me take these blocks to the kitchen?"

Let them fill, carry, transport. Do they fill until it''s too heavy? Make multiple trips?

Missions: "Can you take this book to dad?" "Can you bring your bear from the bedroom?" Each mission is planning + execution.',
'Transporting explodes when walking begins: free hands + mobility. Each mission involves planning, quantification, weight assessment, and task completion satisfaction. Pre-math and executive function in one game.',
12, 18, 'en'),

('Water Painting', 'Art that disappears', '🎨', 'transforming', 'Sensory', 15,
ARRAY['Small bucket of water', 'Thick brushes', 'Dark surface'],
'Give them a brush and bucket. Model: paint a line on the ground. "Look!"

Let them paint freely. Watch: long strokes (trajectory)? Circles (rotation)? Cover everything (enveloping)?

The magic: the water dries and disappears. "It''s gone! Shall we make more?" Visible transformation in real time. Zero mess.',
'This removes all restrictions of real art (stains, expensive materials) and leaves pure exploration pleasure. The visible transformation (water appears, then disappears) fascinates at this age. The strokes reveal their dominant schema.',
12, 18, 'en'),

('Open and Close Everything', 'The door obsession', '🚪', 'connecting', 'Fine Motor', 10,
ARRAY['Boxes with different closures, tupperware, zippered bags'],
'Gather containers with different closures: snap lid, screw top, zipper, velcro, button.

Put an interesting object inside each. Can they open it? Each closure is a different engineering problem.

When they master one, introduce something harder. Screw is harder than snap. Button harder than zipper.',
'Each type of closure requires a different movement: pressing, turning, pulling, pinching. Your child is building a repertoire of mechanical solutions. Literally engineering for beginners.',
12, 18, 'en'),

('Kitchen Nesting', 'Math with tupperware', '🔶', 'positioning', 'Cognitive', 15,
ARRAY['4-5 different sized tupperware'],
'Put the tupperware in front of your child. Do they stack? Nest one inside another?

Don''t show the solution. If the big one won''t fit in the small one, watch: do they try another? Change strategy?

"That one''s too big! Which one might fit?" Celebrate attempts, not just successes.',
'Stacking and nesting are seriation problems (ordering by size) — a fundamental pre-math skill. Each failed attempt is a lesson in comparing magnitudes that can''t be taught with words.',
12, 18, 'en'),

('Spin Spin Spin', 'Rotation with the whole body', '🔄', 'rotation', 'Motor', 10,
ARRAY['Spinning tops, screw caps, plastic plate'],
'Spin in circles together (holding hands). Stop! The world keeps spinning. Laughter.

Give objects that spin: spinning tops, toy wheels. Can they make a lid spin?

In water: make a whirlpool in a bucket. Do they try it themselves?',
'The rotation schema includes both watching things spin and spinning one''s own body. Each rotation experience builds understanding of balance, centrifugal force, and how objects look different from different angles.',
12, 18, 'en'),

-- ============================================================
-- 18-24 MONTHS: World Builder
-- ============================================================

('Mud Kitchen', 'The potion laboratory', '🧪', 'transforming', 'Cognitive', 20,
ARRAY['Dirt, water, leaves, sticks, old containers, spoons'],
'Go to the garden or park. Put dirt in a container. Add water. "What happens?"

Let them mix with hands or spoons. Add leaves, pebbles, sticks. "You''re making a potion!"

Does the consistency change with more water? More dirt? Each mix is a states-of-matter experiment.',
'The transforming schema is at its peak: mixing, squishing, dissolving. Your child is exploring how materials change when combined — the foundation of chemistry. Mud''s texture (neither liquid nor solid) is especially fascinating.',
18, 24, 'en'),

('The Everything Store', 'Symbolic play with transport', '🏪', 'transporting', 'Language', 20,
ARRAY['Household objects as "products"', 'Bags', 'A table as "store"'],
'Set up a "store" with household objects on a table. Your child is the shopper.

"What do we need?" Let them choose, bag, and transport to another location.

Be the seller: "Do you want apples? That''s 2." Introduce numbers naturally. The back-and-forth transport is the heart of the game.',
'This combines transporting schema with symbolic play (things "represent" other things), transactional language, and pre-math. Symbolic representation — a block "is" an apple — is one of the most complex cognitive achievements at this age.',
18, 24, 'en'),

('Gift Wrapping', 'Enveloping with purpose', '🎁', 'enveloping', 'Fine Motor', 15,
ARRAY['Newspaper or recycled paper', 'Tape', 'Small objects to wrap'],
'Put paper and tape within reach. Give them a toy: "Shall we wrap this as a gift for mom/dad?"

It doesn''t matter how it looks. Every wrapping attempt requires: spatial planning, fine motor skills, understanding of surface area.

When they "give" it and the person opens it: the thrill of revealing! That''s theory of mind: "I know what''s inside, they don''t."',
'Wrapping combines the enveloping schema with theory of mind — understanding that others don''t know what you know. When your child wraps a "gift," they''re practicing the concept of perspective: I have information the other person doesn''t.',
18, 24, 'en'),

('Trace Your Shadow', 'Position discovery', '🔦', 'positioning', 'Cognitive', 15,
ARRAY['Sun or flashlight', 'Chalk or large paper'],
'On a sunny day, show them their shadow. "Look, there you are!"

Can they step on their shadow? Yours? Move and watch how the shadow changes position.

With a flashlight indoors: make hand shadows on the wall. Can they imitate the shapes? Do they discover that moving the flashlight changes the size?',
'Shadows are a fascinating exploration of position, perspective, and spatial relationships. The shadow is connected to the body but moves in unexpected ways. Discovering this relationship is a causal reasoning exercise.',
18, 24, 'en'),

('Bridges and Roads', 'Block engineering', '🌉', 'connecting', 'Cognitive', 20,
ARRAY['Blocks, books, cardboard, toy cars or figurines'],
'Put two blocks apart: "Can you make a bridge so the car can cross?"

Let them try. Do they put something on top? Does it fall? "It fell! How do we make it stronger?"

Scale up: make a long road with blocks or books. Can they get a car all the way without it falling off?',
'Building bridges requires solving a real engineering problem: two support points and a surface connecting them. Your child is learning about weight distribution, balance, and structural stability.',
18, 24, 'en'),

('Water Races', 'Liquid trajectory', '💧', 'trajectory', 'Cognitive', 15,
ARRAY['Cardboard tubes, funnels, cut bottles, water', 'Tape'],
'Build a "pipe system" with cardboard tubes and cut bottles taped to a wall or fence.

Pour water at the top. Does it reach the bottom? Where does it leak? How do we redirect it?

Let your child pour and observe. Each adjustment is hydraulic engineering.',
'This takes the trajectory schema to a higher complexity level: the child doesn''t just observe how water falls but tries to control its direction. Planning, prediction, and adjustment — the foundations of scientific thinking.',
18, 24, 'en');
