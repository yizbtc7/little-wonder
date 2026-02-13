import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, serviceRole);

const rows = [
  {
    type: 'brain_card',
    age_range_start: 14,
    age_range_end: 24,
    language: 'en',
    icon: '🎭',
    title: 'The Banana Phone & the Two-Reality Mind',
    domain: 'Imagination',
    preview: "When your child uses a banana as a phone, they're holding two realities at once.",
    article: {
      whats_happening:
        "When your child turns ordinary objects into pretend tools, their brain is linking symbols to reality — a foundation for language and abstract thought.",
      fascinating_part:
        'Pretend play at this stage strongly predicts richer language growth over the next two years.',
      youll_see_it_when: [
        'Feeds a toy with an empty spoon',
        'Uses random objects as pretend tools',
        'Creates mini stories during play',
      ],
      how_to_be_present:
        'Follow their script. If the banana rings, answer it. Your participation strengthens symbolic thinking.',
    },
    source: 'Piaget, Gopnik',
    tags: ['pretend-play', 'symbolic-thinking'],
  },
  {
    type: 'brain_card',
    age_range_start: 14,
    age_range_end: 24,
    language: 'en',
    icon: '🧱',
    title: 'Tiny Engineer, Real Hypotheses',
    domain: 'Cognitive',
    preview: 'Repeated stacking and crashing is early hypothesis-testing in action.',
    article: {
      whats_happening:
        'Your child is running rapid experiments: change one block, predict stability, then test the result.',
      fascinating_part:
        'These repeated micro-experiments train prediction circuits used later in math and planning.',
      youll_see_it_when: ['Pauses before dropping a block', 'Changes one piece after collapse', 'Repeats with slight variation'],
      how_to_be_present:
        'Offer a tiny variation (size, surface, weight) and watch what strategy changes first.',
    },
    source: 'MIT curiosity research',
    tags: ['stacking', 'prediction'],
  },
  {
    type: 'brain_card',
    age_range_start: 14,
    age_range_end: 24,
    language: 'en',
    icon: '🗣️',
    title: 'The Invisible Dictionary Explosion',
    domain: 'Language',
    preview: 'Comprehension is growing much faster than spoken words right now.',
    article: {
      whats_happening:
        'Your child understands far more than they can say. Each conversation turn strengthens fast-growing language networks.',
      fascinating_part:
        'Back-and-forth conversation turns predict vocabulary growth better than passive content exposure.',
      youll_see_it_when: ['Follows 2-step directions', 'Points to request words', 'Babble mirrors sentence rhythm'],
      how_to_be_present:
        'Name what they point to, then pause for 3 seconds. That pause invites language production.',
    },
    source: 'Harvard Center on the Developing Child',
    tags: ['language', 'serve-and-return'],
  },
  {
    type: 'daily_tip',
    age_range_start: 14,
    age_range_end: 24,
    language: 'en',
    icon: '🌻',
    title: "Today's Tip",
    domain: null,
    preview: 'Let your child turn pages during story time, even if they skip around.',
    article: {
      tip: 'Tonight, let your child control page turns during reading time — even when they skip pages.',
      why: 'Each page turn is a decision loop: evaluate, choose, act. These repetitions build early executive function.',
      source: 'Harvard Center on the Developing Child',
    },
    source: 'Harvard Center on the Developing Child',
    tags: ['reading', 'executive-function'],
  },
];

const titles = rows.map((row) => row.title);
await db.from('explore_content').delete().in('title', titles).eq('language', 'en');

const { error } = await db.from('explore_content').insert(rows);

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} explore_content rows.`);
