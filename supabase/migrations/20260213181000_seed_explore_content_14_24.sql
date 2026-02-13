delete from public.explore_content
where language = 'en'
  and age_range_start = 14
  and age_range_end = 24
  and title in (
    'The Banana Phone & the Two-Reality Mind',
    'Tiny Engineer, Real Hypotheses',
    'The Invisible Dictionary Explosion',
    'Today''s Tip'
  );

insert into public.explore_content (
  type, age_range_start, age_range_end, language, icon, title, domain, preview, article, source, tags
)
values
  (
    'brain_card', 14, 24, 'en', '🎭', 'The Banana Phone & the Two-Reality Mind', 'Imagination',
    'When your child uses a banana as a phone, they''re holding two realities at once.',
    '{"whats_happening":"When your child turns ordinary objects into pretend tools, their brain is linking symbols to reality — a foundation for language and abstract thought.","fascinating_part":"Pretend play at this stage strongly predicts richer language growth over the next two years.","youll_see_it_when":["Feeds a toy with an empty spoon","Uses random objects as pretend tools","Creates mini stories during play"],"how_to_be_present":"Follow their script. If the banana rings, answer it. Your participation strengthens symbolic thinking."}'::jsonb,
    'Piaget, Gopnik', array['pretend-play','symbolic-thinking']
  ),
  (
    'brain_card', 14, 24, 'en', '🧱', 'Tiny Engineer, Real Hypotheses', 'Cognitive',
    'Repeated stacking and crashing is early hypothesis-testing in action.',
    '{"whats_happening":"Your child is running rapid experiments: change one block, predict stability, then test the result.","fascinating_part":"These repeated micro-experiments train prediction circuits used later in math and planning.","youll_see_it_when":["Pauses before dropping a block","Changes one piece after collapse","Repeats with slight variation"],"how_to_be_present":"Offer a tiny variation (size, surface, weight) and watch what strategy changes first."}'::jsonb,
    'MIT curiosity research', array['stacking','prediction']
  ),
  (
    'brain_card', 14, 24, 'en', '🗣️', 'The Invisible Dictionary Explosion', 'Language',
    'Comprehension is growing much faster than spoken words right now.',
    '{"whats_happening":"Your child understands far more than they can say. Each conversation turn strengthens fast-growing language networks.","fascinating_part":"Back-and-forth conversation turns predict vocabulary growth better than passive content exposure.","youll_see_it_when":["Follows 2-step directions","Points to request words","Babble mirrors sentence rhythm"],"how_to_be_present":"Name what they point to, then pause for 3 seconds. That pause invites language production."}'::jsonb,
    'Harvard Center on the Developing Child', array['language','serve-and-return']
  ),
  (
    'daily_tip', 14, 24, 'en', '🌻', 'Today''s Tip', null,
    'Let your child control page turns during reading time, even when they skip pages.',
    '{"tip":"Tonight, let your child control page turns during reading time — even when they skip pages.","why":"Each page turn is a decision loop: evaluate, choose, act. These repetitions build early executive function.","source":"Harvard Center on the Developing Child"}'::jsonb,
    'Harvard Center on the Developing Child', array['reading','executive-function']
  );
