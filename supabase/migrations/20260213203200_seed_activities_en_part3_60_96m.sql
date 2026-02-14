-- ============================================================
-- LITTLE WONDER: Complete Activities Library — ENGLISH
-- PART 3: 5-8 years (60-96 months)
-- ============================================================

INSERT INTO activities (title, subtitle, emoji, schema_target, domain, duration_minutes, materials, steps, science_note, age_min_months, age_max_months, language) VALUES

-- ============================================================
-- 60-72 MONTHS (5-6 YEARS): The Investigator
-- ============================================================

('Design Your Own Board Game', 'Rules + creativity', '🎲', 'connecting', 'Cognitive', 40,
ARRAY['Large cardboard', 'Markers', 'Dice', 'Tokens (coins, buttons)', 'Paper cards'],
'Ask: "If you could invent a board game, what would it be about?"

Guide the process: it needs a board (path with spaces), rules (what happens when you land here?), and a goal (how do you win?).

Let them draw the board. Help write simple rules. Then: play it! Does it work? What would you change?

The first game will be imperfect. Iteration IS the activity.',
'Designing a board game requires: systems thinking (all pieces must work together), fairness, sequencing, math (counting spaces, using dice), and theory of mind (is it fun for OTHERS?). This is connecting schema elevated to systems design.',
60, 72, 'en'),

('Home Weather Station', 'Real data science', '🌤️', 'positioning', 'Science', 30,
ARRAY['Thermometer (optional)', 'DIY rain gauge (cut bottle)', 'Wind vane (stick + cardboard)', 'Log notebook'],
'Build simple weather instruments: rain gauge (cut bottle with scale), wind vane (cardboard on stick), and use a thermometer if available.

Same time each day: measure, record, draw a symbol (sun, cloud, rain).

After a week: "Which day had the most rain? Hottest day? See any patterns?"

After a month: make a graph. Bars or dots. Your child is doing data science.',
'The weather station teaches the heart of science: systematic observation, data recording, and pattern-seeking. Positioning schema manifests in organizing data into tables and graphs. Measuring daily builds scientific discipline.',
60, 72, 'en'),

('Bridge That Holds', 'Real structural engineering', '🌁', 'connecting', 'Engineering', 30,
ARRAY['Popsicle sticks', 'Glue or tape', 'Cups as pillars', 'Coins for weight testing'],
'Challenge: build a bridge between two cups that holds the most weight.

Give materials. Don''t show how. "How would you do it?"

Test: place coins one at a time. How many before it collapses? "How would you make it stronger?"

Iterate: build version two. Improvement? Comparing numbers (coins) is real measurement.',
'Bridge engineering requires intuitive understanding of: load distribution, triangulation, tension vs. compression. They don''t need the names — they discover them through experimentation. Counting coins introduces quantitative force measurement.',
60, 72, 'en'),

('Secret Code', 'Basic cryptography', '🔐', 'transforming', 'Language', 20,
ARRAY['Paper', 'Pencil'],
'Invent a secret code together: A=1, B=2... or A=★, B=♦...

Write messages in code to each other. "Can you crack this?"

Advanced: invent a code where each letter is replaced by another (Caesar cipher). "If A=C, B=D... what does this message say?"

Let them invent their OWN code system. That''s symbolic systems design.',
'Cryptography is symbolic transformation: one symbol becomes another following a rule. Your child practices algebraic thinking (relationships between sets), one-to-one correspondence, and the fundamental concept that symbols are conventions — the same idea that makes reading and writing work.',
60, 72, 'en'),

('The Big Investigation', 'Complete science project', '🔬', 'transforming', 'Science', 45,
ARRAY['Depends on chosen topic', 'Notebook', 'Experimentation materials'],
'Ask: "What would you like to investigate? What question do you have about how something works?"

Help turn curiosity into a testable question: not "why does it rain?" but "do plants grow faster with warm water or cold water?"

Design the experiment together. Your child does the work. Records results. Draws conclusions.

Present findings to the family. Your child is the scientist.',
'A complete research project is the culmination of everything: question (curiosity), design (planning), execution (persistence), recording (documentation), and communication (presentation). Your child experiences the full cycle of scientific discovery.',
60, 72, 'en'),

-- ============================================================
-- 72-84 MONTHS (6-7 YEARS): The Builder
-- ============================================================

('Family Newspaper', 'Writing with purpose', '📰', 'positioning', 'Language', 40,
ARRAY['Paper', 'Markers, crayons', 'Optional: computer for dictation'],
'"Let''s make a family newspaper." Sections: news ("The cat climbed on the roof"), sports ("Leo learned to ride a bike"), opinion, weather, games.

Your child decides what to include. Writes (or dictates) articles. Draws the photos. Decides the layout.

Print copies (or photocopy). Distribute to family. Next week: new edition!',
'The newspaper integrates: writing with a real audience, section classification (positioning), narrative, visual design (layout), and the concept of periodicity. Writing for real readers transforms writing from exercise to purposeful communication.',
72, 84, 'en'),

('Real Simple Machine', 'Levers, pulleys, inclined planes', '⚙️', 'connecting', 'Engineering', 35,
ARRAY['Long stick or ruler', 'Fulcrum (block, can)', 'Rope', 'Spool or DIY pulley', 'Objects of different weights'],
'Build a lever: stick on a fulcrum. Put an object on one end. "Can you lift it by pushing the other side?"

Where to put the fulcrum for it to be easier? Closer to the object or further? Experiment.

Then: simple pulley (rope over a high stick). Is it easier to lift by pulling down than lifting directly?

Name it: "You invented a lever! The Egyptians used these to build pyramids."',
'Simple machines (lever, pulley, inclined plane) are the foundation of ALL mechanical engineering. At 6-7 years, your child can intuitively understand mechanical advantage: "moving the fulcrum changes how much force I need." This is applied physics.',
72, 84, 'en'),

('Party Budget', 'Real-life math', '🎉', 'positioning', 'Math', 30,
ARRAY['Paper', 'Pencil', 'Play money', 'A defined "budget"'],
'"Let''s plan a party with $100 (play money)." Your child decides: what to buy? Balloons ($10), cake ($30), juice ($15)?

Write the list. Add it up. "Do we have enough? If not, what do we cut?"

Advanced: compare prices. "Balloons cost $10 here but $8 there. How much do we save?"

The party can be real or pretend. The budget is the exercise.',
'Budgeting is math with consequences: addition, subtraction, comparison, and prioritization. Your child practices arithmetic with real motivation (the party depends on their decisions). It introduces the concept of trade-offs: if we spend more here, we have less there.',
72, 84, 'en'),

('Comparative Germination', 'Controlled variables', '🌱', 'transforming', 'Science', 30,
ARRAY['6 clear cups', 'Cotton', 'Seeds (beans)', 'Water', 'Log notebook'],
'Plant the same seed in 6 cups with different conditions:
1. Water + light (control)
2. Water + dark
3. No water + light
4. Water + light + music (let your child choose a variable!)
5-6: Whatever your child invents

Measure daily: which grew most? Record with drawings and measurements.

After 2 weeks: "What did we learn? What do plants need?"',
'This is an experiment with controlled variables — the gold standard of the scientific method. Your child understands: if I only change ONE thing (light vs. dark) and everything else stays the same, the difference in results is due to that change. This reasoning is the foundation of all formal scientific thinking.',
72, 84, 'en'),

('Gratitude-Curiosity Journal', 'Daily reflection', '📔', 'positioning', 'Social-Emotional', 10,
ARRAY['Nice notebook', 'Pencil'],
'Every night, 3 questions:
1. "What was the best thing about today?" (gratitude)
2. "What did you learn today?" (metacognition)
3. "What do you want to discover tomorrow?" (curiosity)

Write the answers (or let them write if they can). Don''t correct spelling — content matters more.

After a month: read together. "Look at everything you discovered!"',
'The journal combines three research-backed practices: gratitude (emotional wellbeing), metacognition (reflecting on learning — the skill that most predicts academic success), and future orientation (setting intentions). 5 minutes daily building mental habits for life.',
72, 84, 'en'),

-- ============================================================
-- 84-96 MONTHS (7-8 YEARS): The Strategist
-- ============================================================

('Lemonade Stand (Full Plan)', 'Real entrepreneurship', '🍋', 'connecting', 'Math', 45,
ARRAY['Lemons, sugar, water, ice', 'Cups', 'Poster board for sign', 'Real or play coins'],
'This is a real business project:
1. **Costs:** How much did we spend on ingredients?
2. **Price:** How much per cup to make money?
3. **Marketing:** Design the sign. What''s our name?
4. **Operations:** Who makes lemonade? Who collects payment? Who serves?

If possible, sell for real. If not, simulate with family.

At the end: "Did we make or lose money? What would we do differently?"',
'The lemonade stand is a micro-business integrating: arithmetic (costs, prices, profits), design (marketing), logistics (operations), and decision-making. Your child experiences that decisions have economic consequences — applied systems thinking.',
84, 96, 'en'),

('Design an App (On Paper)', 'Computational thinking', '📱', 'positioning', 'Cognitive', 35,
ARRAY['Paper', 'Markers', 'Post-its'],
'"If you could invent an app, what would it do?" Draw each screen on a separate piece of paper.

What buttons does it have? What happens when you press each one? Which screen does it go to?

Connect papers with arrows: screen 1 → button → screen 2. It''s a flowchart!

User testing: ask someone to "use" the app by pointing at buttons. Does it work as expected?',
'Designing a paper app is computational thinking without a computer: sequences, conditionals (if you press X, Y happens), and interface design. The flowchart is the same tool programmers use. And "user testing" introduces designing for OTHERS — empathy + design.',
84, 96, 'en'),

('Homemade Documentary', 'Research + storytelling', '🎬', 'transforming', 'Language', 45,
ARRAY['Phone or tablet for filming', 'Notebook for script'],
'Choose a topic they''re fascinated by (insects, cooking, the neighborhood, their pet). They''re the director of a documentary.

Steps:
1. **Research:** What do they know? What do they want to find out?
2. **Script:** What will they say? Who do they interview?
3. **Film:** Narrate and record.
4. **Edit:** Choose the best parts.
5. **Premiere:** Movie night with family.

Doesn''t need to be perfect. The process IS the learning.',
'Making a documentary is the most complete research project: requires topic mastery, narrative planning, oral communication, technical skills, and editorial decision-making. Your child goes from content consumer to CREATOR — a powerful identity shift.',
84, 96, 'en'),

('Strategy Tournament', 'Thinking three moves ahead', '♟️', 'positioning', 'Cognitive', 30,
ARRAY['Chess, checkers, Connect Four, or available strategy game'],
'Choose an age-appropriate strategy game. Start with basic rules.

The key: after each game, review together. "What move changed the game? What would you do differently?"

Introduce the concept: "Before you move, think: if I do this, what will they do? And then what do I do?"

Track results. Do they improve with practice? That''s visible metacognition.',
'Strategy games work all three executive functions: inhibition (resisting the impulse to move fast), working memory (holding the plan while evaluating options), and cognitive flexibility (changing strategy when the current one fails). Post-game reflection is metacognition — thinking about thinking.',
84, 96, 'en'),

('Build a Real Shelter', 'Human-scale engineering', '⛺', 'enclosure', 'Engineering', 60,
ARRAY['Branches, long sticks', 'Rope or twine', 'Sheets or tarps', 'Clothespins'],
'Project: build a shelter that fits one person (your child).

Where do we build? What shape? How does it stand up? Plan before building.

Build together. If it falls: "Why? How do we make it more stable?" Iterate.

When it works: eat a snack inside. Sleep there if possible.

Document: photos of each step. At the end, a "manual" of how they did it.',
'Building a shelter is enclosure schema at real scale. Requires: spatial planning (what shape?), structural engineering (how does it stand?), iterative problem-solving, and collaborative work. It''s one of humanity''s most ancestral projects — every civilization started by building shelters.',
84, 96, 'en'),

('The Big Neighborhood Map', 'Cartography and observation', '🗺️', 'positioning', 'Cognitive', 45,
ARRAY['Large paper (or several taped together)', 'Crayons and markers', 'Ruler', 'Compass (optional)'],
'Walk around the neighborhood with a notebook. Your child notes what they see: streets, shops, trees, parks.

Back home: transfer to the big map. Where is the bakery relative to home? Is the park north or south?

Add a legend: colors for types of places (green=park, red=shop, blue=water).

Do they want to add a place that DOESN''T exist but should? "What is our neighborhood missing?"',
'Cartography requires: systematic observation, 3D-to-2D translation, spatial orientation, scales, and conventions (legend). The question "what''s missing?" introduces civic design: thinking about the common good and proposing solutions.',
84, 96, 'en'),

('Invent a Machine', 'Speculative design', '🤖', 'connecting', 'Engineering', 35,
ARRAY['Paper', 'Markers', 'Recycled materials for prototype (boxes, tubes, buttons)'],
'"If you could invent a machine that solves a problem, what would it be?"

Draw the design in detail: what parts does it have? How does each one work? What goes in and what comes out?

Build a prototype with recycled materials. It doesn''t need to "work" — it needs to communicate the idea.

Present to family: what problem does it solve? How does it work? How much would it cost?',
'Speculative design ("inventing what doesn''t exist") is creative + engineering thinking in its purest form. Your child practices: identifying problems, proposing solutions, decomposing systems into parts (connecting), and communicating complex ideas. This is design thinking for kids.',
84, 96, 'en'),

('Critical Reading Journal', 'Thinking about what I read', '📚', 'transforming', 'Language', 20,
ARRAY['A book they''re reading', 'Notebook', 'Pencil'],
'After each chapter or book, 4 questions:
1. "What happened?" (comprehension)
2. "How did it make you feel?" (emotional connection)
3. "What would you do if you were the character?" (perspective)
4. "What do you think will happen next?" (prediction)

Write or draw the answers. Over time, build an archive of everything read.

Once a month: "What was your favorite book? Why?" Comparing is critical thinking.',
'Critical reading is cognitive transformation: text transforms into personal understanding. The four questions work different levels: literal (what happened), emotional (how I felt), perspective (theory of mind), and predictive (inference). This habit is the strongest predictor of long-term academic success.',
84, 96, 'en');
