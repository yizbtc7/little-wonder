import { fireEvent, render, screen } from '@testing-library/react';
import ObserveFlow from './ObserveFlow';

describe('ObserveFlow v3 explore behavior', () => {
  it('shows Today\'s tip before Inside child brain in Explore tab', () => {
    render(
      <ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' />
    );

    fireEvent.click(screen.getByText('Explore'));

    const tipLabel = screen.getByText("🌻 Today's tip");
    const brainHeading = screen.getByText("Inside Leo's brain");

    expect(tipLabel.compareDocumentPosition(brainHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders full editorial wonder detail content', () => {
    render(
      <ObserveFlow parentName='Sarah' childName='Leo' childAgeLabel='2 years old' childBirthdate='2024-01-01' />
    );

    fireEvent.click(screen.getByText('Explore'));
    fireEvent.click(screen.getAllByText('Read more')[0]);

    expect(screen.getByText("✨ You'll recognize it when…")).toBeInTheDocument();
    expect(screen.getByText('🤲 How to be present')).toBeInTheDocument();
    expect(
      screen.getByText('Based on developmental research from Gopnik, Athey & Harvard CCHD')
    ).toBeInTheDocument();
  });
});
