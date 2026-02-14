delete from public.explore_articles
where language = 'en'
  and age_min_months = 12
  and age_max_months = 24
  and title in (
    'Why toddlers repeat everything',
    'When ''No!'' is actually a breakthrough',
    'The power of guided play',
    'Your voice builds their brain',
    'Play schemas explained',
    'Activities for the trajectory schema'
  );

insert into public.explore_articles (title, emoji, type, body, age_min_months, age_max_months, domain, language)
values
(
  'Why toddlers repeat everything',
  '📖',
  'article',
  'Toddlers look repetitive from the outside: drop, pick up, drop again. But repetition is not "stuck behavior" — it is how the brain stabilizes a new model of reality.\n\nBetween 12 and 24 months, children run thousands of micro-experiments. They repeat because each attempt updates prediction: *what happens if I change force, angle, speed, or context?* That loop (predict → test → update) is the engine of learning.\n\nIn schema terms, repetition is often a sign that a child is deep in a pattern like **trajectory**, **transporting**, **connecting**, or **enclosure**. The goal is not novelty for novelty''s sake. The goal is mastery.\n\nWhen adults interrupt too early, we often break the exact cycle that is building flexible thinking. A better move is to observe what variable the child is changing, name it in simple language, and let the loop continue.\n\nIf your toddler has repeated the same action 20 times, that is not wasted time. It is concentrated learning at work.',
  12,
  24,
  'Schemas',
  'en'
),
(
  'When ''No!'' is actually a breakthrough',
  '🧠',
  'article',
  'A toddler''s "No!" can feel oppositional, but developmentally it often marks a major step: the emergence of autonomy.\n\nIn Erikson''s stage of **Autonomy vs. Shame and Doubt** (roughly 1–3 years), children are discovering that they are separate agents with preferences, intentions, and control. Saying "no" is one of the first powerful tools for asserting that self.\n\nWhat helps most is not constant compliance, and not constant override — it is structured choice. Two acceptable options protect boundaries while preserving autonomy: *"Blue cup or green cup?"*\n\nA practical pattern:\n1. Validate intent ("You want to do it yourself")\n2. Keep boundary clear ("It''s time to leave")\n3. Offer agency inside boundary ("Do you want shoes first or jacket first?")\n\nHandled this way, "no" becomes practice for future self-regulation, not a battle to win.',
  12,
  24,
  'Social-Emotional',
  'en'
),
(
  'The power of guided play',
  '🎯',
  'research',
  'Research comparing **free play**, **guided play**, and **direct instruction** shows a consistent pattern: guided play often produces deeper transfer and understanding than either extreme.\n\nIn guided play, the adult sets up a meaningful environment, then follows the child''s action with timely prompts and questions. Children keep agency, but the adult gently steers attention to key relationships.\n\nWork associated with Hirsh-Pasek, Golinkoff, and colleagues highlights that guided play can improve language, spatial reasoning, and conceptual learning because it combines motivation (child-led) with structure (adult scaffolding).\n\nA toddler example:\n- Free play only: child stacks randomly\n- Direct instruction only: adult controls every step\n- Guided play: adult asks, *"What if we put the big one at the bottom?"* and waits\n\nThat small nudge preserves curiosity while strengthening thinking. Guided play is not controlling the child; it is designing better learning moments.',
  12,
  24,
  'Cognitive',
  'en'
),
(
  'Your voice builds their brain',
  '🗣️',
  'research',
  'Serve-and-return research from the Harvard Center on the Developing Child shows that responsive interaction is one of the strongest drivers of healthy brain architecture.\n\nA "serve" can be a look, gesture, sound, point, or word from the child. A "return" is your contingent response: naming, expanding, mirroring, or pausing for turn-taking.\n\nThe critical ingredient is contingency — your response is connected to what the child just did. This strengthens attention, language networks, and emotional regulation.\n\nHigh-quality conversational turns predict later vocabulary and school-readiness outcomes better than passive exposure alone.\n\nSimple implementation at home:\n- Notice the serve (point, babble, glance)\n- Return with one short sentence\n- Pause 2–4 seconds\n- Let the child lead the next turn\n\nYour voice is not background noise to a toddler. It is a construction material for the brain.',
  12,
  24,
  'Language',
  'en'
),
(
  'Play schemas explained',
  '🧩',
  'guide',
  'Schemas are repeated patterns of action children use to understand the world. They are not random habits; they are learning strategies.\n\nThe 8 practical schemas many educators and therapists track are:\n\n1. **Trajectory** — throwing, dropping, watching motion\n2. **Transporting** — moving objects from place to place\n3. **Enclosure** — putting things in/out, surrounding spaces\n4. **Rotation** — spinning, twisting, turning objects\n5. **Connection** — joining, stacking, linking pieces\n6. **Transformation** — mixing, changing states/materials\n7. **Positioning** — lining up, arranging precisely\n8. **Orientation** — seeing from unusual angles (upside down, under)\n\nHow parents can use schemas:\n- Spot the repeating pattern
- Offer materials that match it
- Add one gentle variation (size, texture, surface, speed)
- Narrate what changed\n\nWhen you follow a schema instead of interrupting it, you turn ordinary play into targeted development support.',
  12,
  24,
  'Guide',
  'en'
),
(
  'Activities for the trajectory schema',
  '🚀',
  'guide',
  'If your toddler loves dropping, throwing, pouring, or launching, they may be deep in trajectory schema work. Instead of blocking it, channel it.\n\nHousehold activities:\n\n**1) Soft drop zone**\n- Materials: laundry basket + socks + soft balls\n- Goal: compare height and sound\n\n**2) Ramp lab**\n- Materials: book + cardboard + toy car/ball\n- Goal: test steep vs. shallow angles\n\n**3) Pour station**\n- Materials: cups, spoon, dry rice or water tray\n- Goal: observe flow and control\n\n**4) Scarf toss and catch**\n- Materials: lightweight scarves\n- Goal: track slow trajectories with eyes and hands\n\nCoaching language:
- "I see you testing how far it goes."
- "What changed when we made the ramp higher?"
- "Should we try a heavier one now?"\n\nSafety note: set a clear "throwing zone" and "not-for-throwing" zone. Boundaries + experimentation can coexist.',
  12,
  24,
  'Guide',
  'en'
);
