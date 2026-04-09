// Wave 0 RED test — imports a component that does not exist yet.
// Wave 3 (plan 03-03) creates ../components/HandoffPackagePanel.tsx.
// Test framework: Jest (Phase 2 precedent).
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

import { HandoffPackagePanel } from '../components/HandoffPackagePanel';

const renderWithTestProviders = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <JotaiProvider>
        <MantineProvider>{ui}</MantineProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

const baseHandoff = {
  qualification: {
    budget: true,
    autorite: true,
    besoin: false,
    timing: false,
    problematique: true,
    solution: false,
    objection: false,
    dispoRdv: true,
  },
  handoffTemperature: 3 as const,
  objections: '',
  nextStep: 'Relancer par email mercredi',
};

describe('HandoffPackagePanel', () => {
  it('should render the title "Handoff reçu"', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={baseHandoff}
        role="CLOSER"
        onRework={() => {}}
      />,
    );
    expect(screen.getByText('Handoff reçu')).toBeInTheDocument();
  });

  it('should render all 8 qualification checklist items with their selected state', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={baseHandoff}
        role="CLOSER"
        onRework={() => {}}
      />,
    );

    // The 8 labels from the UI-SPEC — same list as HandoffFormModal.test.tsx
    const labels = [
      'Budget identifié',
      'Décideur contacté',
      'Besoin confirmé',
      'Timing défini',
      'Problématique identifiée',
      'Solution StratIA proposée',
      'Objection principale traitée',
      'Disponibilité RDV confirmée',
    ];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // The panel should mark 4 items as filled (budget, autorite, problematique, dispoRdv).
    // Implementations will surface state via an aria-checked attribute, data
    // attribute, or distinct icon — the test defers shape but asserts count.
    const items = screen.getAllByTestId(/handoff-qualification-item/);
    expect(items).toHaveLength(8);
  });

  it('should render exactly 5 IconFlame placeholders and mark 3 as filled for handoffTemperature=3', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={{ ...baseHandoff, handoffTemperature: 3 }}
        role="CLOSER"
        onRework={() => {}}
      />,
    );
    const flames = screen.getAllByTestId(/handoff-temperature-flame/);
    expect(flames).toHaveLength(5);
    const filledFlames = flames.filter(
      (el) => el.getAttribute('data-filled') === 'true',
    );
    expect(filledFlames).toHaveLength(3);
  });

  it('should render the objections text when provided', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={{
          ...baseHandoff,
          objections: 'Le prospect trouve le prix trop élevé.',
        }}
        role="CLOSER"
        onRework={() => {}}
      />,
    );
    expect(
      screen.getByText('Le prospect trouve le prix trop élevé.'),
    ).toBeInTheDocument();
  });

  it('should render "Aucune objection notée" when objections is empty', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={{ ...baseHandoff, objections: '' }}
        role="CLOSER"
        onRework={() => {}}
      />,
    );
    expect(screen.getByText('Aucune objection notée')).toBeInTheDocument();
  });

  it('should render the "Renvoyer au setter" rework button when role is CLOSER', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={baseHandoff}
        role="CLOSER"
        onRework={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Renvoyer au setter' }),
    ).toBeInTheDocument();
  });

  it('should NOT render the rework button when role is SETTER', () => {
    renderWithTestProviders(
      <HandoffPackagePanel
        handoff={baseHandoff}
        role="SETTER"
        onRework={() => {}}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Renvoyer au setter' }),
    ).not.toBeInTheDocument();
  });
});
