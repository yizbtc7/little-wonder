import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ObserveFlow from './ObserveFlow';

vi.mock('@/lib/supabaseClient', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn().mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
  }),
}));

describe('ObserveFlow v3 learn behavior', () => {
  it('shows Today\'s tip before Inside child brain in Learn tab', () => {
    render(
      <ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' childId='child-1' initialLanguage='en' />
    );

    fireEvent.click(screen.getByText('Learn'));

    const tipLabel = screen.getByText("🌻 Today's tip");
    const brainHeading = screen.getByText("Inside Leo's brain");

    expect(tipLabel.compareDocumentPosition(brainHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders full editorial wonder detail content', () => {
    render(
      <ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' childId='child-1' initialLanguage='en' />
    );

    fireEvent.click(screen.getByText('Learn'));
    fireEvent.click(screen.getAllByText('Read more')[0]);

    expect(screen.getByText("✨ You'll recognize it when…")).toBeInTheDocument();
    expect(screen.getByText('🤲 How to be present')).toBeInTheDocument();
    expect(
      screen.getByText('Based on developmental research from Gopnik, Athey & Harvard CCHD')
    ).toBeInTheDocument();
  });
});
