export type StageCard = {
  icon: string;
  title: string;
  domain: string;
  color: string;
  preview: string;
  full: {
    whats_happening: string;
    youll_see_it_when: string[];
    fascinating_part: string;
    how_to_be_present: string;
  };
};

export const STAGE_CONTENT: { stage: string; stageEmoji: string; cards: StageCard[] } = {
  stage: 'World Builder',
  stageEmoji: '🌍',
  cards: [
    {
      icon: '🎭',
      title: 'The Banana Phone & the Two-Reality Mind',
      domain: 'Imagination',
      color: '#F0EBF5',
      preview:
        "When {{child_name}} uses a banana as a phone, they're holding two realities at once — what it IS and what it REPRESENTS.",
      full: {
        whats_happening:
          "Something remarkable is unfolding in {{child_name}}'s brain. When they hold a banana to their ear, they know it's a banana and also decide it's a phone. This dual representation is the foundation of abstract thinking.",
        youll_see_it_when: [
          'Feeding a stuffed animal with an empty spoon',
          'Talking into random objects as if they were phones',
          "Putting toys to sleep and whispering 'shhhh'",
          'Making sound effects for objects in pretend scenes',
        ],
        fascinating_part:
          'Pretend play is a strong predictor of later language growth. Imagination and language share core neural pathways.',
        how_to_be_present:
          "Follow their rules in pretend play. If the banana rings, answer it. Narrate gently and stay inside their story.",
      },
    },
    {
      icon: '💬',
      title: 'The 5x Invisible Dictionary',
      domain: 'Language',
      color: '#EDF5EC',
      preview:
        "Right now, {{child_name}} understands far more words than they can say. Their brain is building an invisible language library.",
      full: {
        whats_happening:
          "{{child_name}} is in a high-speed language window. Even with a small spoken vocabulary, comprehension is rapidly expanding through repeated meaningful conversation.",
        youll_see_it_when: [
          'Following surprisingly complex instructions',
          'Pointing to ask for words they cannot say yet',
          'Using one word to mean a full sentence',
          'Long babble strings with conversational rhythm',
        ],
        fascinating_part:
          'Conversational turns are one of the strongest predictors of vocabulary growth by age 3.',
        how_to_be_present:
          'When they point, name clearly what they see and pause for a response. That pause helps language circuits consolidate.',
      },
    },
    {
      icon: '✊',
      title: "Why 'No' Is a Breakthrough",
      domain: 'Social-Emotional',
      color: '#F8E8E0',
      preview:
        "That strong 'no' is often autonomy in development. {{child_name}} is discovering they are a separate person with preferences.",
      full: {
        whats_happening:
          "When {{child_name}} says no, they are practicing agency. The brain is organizing identity, preference, and control boundaries — foundational social-emotional work.",
        youll_see_it_when: [
          "'Me do it' even when tasks take longer",
          'Strong preferences for specific objects',
          'Saying no to test whether choice works',
          'Pushback during transitions',
        ],
        fascinating_part:
          'The same prefrontal systems used in early autonomy support later impulse control and decision quality.',
        how_to_be_present:
          "Offer bounded choices where possible. When a limit is non-negotiable, validate feeling first and hold the boundary calmly.",
      },
    },
  ],
};
