import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ObserveFlow from './ObserveFlow';

vi.mock('@/lib/supabaseClient', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe('ObserveFlow v3 learn behavior', () => {
  it("shows Today's tip before Inside child brain in Learn tab", () => {
    render(<ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' childId='child-1' initialLanguage='en' />);

    fireEvent.click(screen.getByText(/Learn|Aprender/));

    const tipLabel = screen.getByText(/Today's tip|Tip de hoy/);
    const brainHeading = screen.getByText(/Inside Leo's brain|Dentro del cerebro de Leo/);

    expect(tipLabel.compareDocumentPosition(brainHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows empty-state message when no age-matched explore content exists', () => {
    render(<ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='9 years old' childBirthdate='2017-01-01' childId='child-1' initialLanguage='en' />);

    fireEvent.click(screen.getByText(/Learn|Aprender/));

    expect(screen.getByText("We're building content for this age — check back soon!")).toBeInTheDocument();
  });
});
