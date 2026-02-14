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
  it('shows unified empty state when no age-matched explore content exists', () => {
    render(<ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='9 years old' childBirthdate='2017-01-01' childId='child-1' initialLanguage='en' />);

    fireEvent.click(screen.getByText(/Learn|Aprender/));

    expect(screen.getByText(/Contenido en camino|We\'re building content/i)).toBeInTheDocument();
  });

  it('keeps Learn tab reachable and rendered', () => {
    render(<ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' childId='child-1' initialLanguage='en' />);

    fireEvent.click(screen.getByText(/Learn|Aprender/));

    expect(screen.getAllByText(/Learn|Aprender/).length).toBeGreaterThan(0);
  });
});
