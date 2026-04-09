// Wave 0 RED test — imports a component that does not exist yet.
// Wave 3 (plan 03-03) creates ../components/HandoffFormModal.tsx.
// Test framework: Jest (Phase 2 precedent — twenty-front uses Jest globals).
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

// Mock Twenty's Jotai hook wrappers — same trick as Phase 2
// TaskCreationForm.test.tsx so components that rely on Twenty's state library
// can use plain Jotai under test.
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomState', () => ({
  useAtomState: jest.requireActual('jotai').useAtom,
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.requireActual('jotai').useAtomValue,
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: jest.requireActual('jotai').useSetAtom,
}));

import { HandoffFormModal } from '../components/HandoffFormModal';

const renderWithTestProviders = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <JotaiProvider>
        <MantineProvider>{ui}</MantineProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

// Exact French labels from 03-UI-SPEC component inventory — these MUST render
// verbatim for FLOW-01 to pass acceptance.
const QUALIFICATION_LABELS = [
  'Budget identifié',
  'Décideur contacté',
  'Besoin confirmé',
  'Timing défini',
  'Problématique identifiée',
  'Solution StratIA proposée',
  'Objection principale traitée',
  'Disponibilité RDV confirmée',
] as const;

describe('HandoffFormModal', () => {
  const noop = () => {
    // deliberately empty — callbacks are wired in Wave 3 implementation
  };

  it('should render a Mantine Modal with title "Transmettre au closer" when opened', () => {
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    expect(screen.getByText('Transmettre au closer')).toBeInTheDocument();
  });

  it('should render all 8 qualification checkbox labels', () => {
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    for (const label of QUALIFICATION_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('should render a TemperatureSlider radiogroup with aria-label "Température du prospect"', () => {
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    const radiogroup = screen.getByRole('radiogroup', {
      name: 'Température du prospect',
    });
    expect(radiogroup).toBeInTheDocument();
  });

  it('should render a submit button "Transmettre au closer" that starts disabled', () => {
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Transmettre au closer',
    });
    expect(submitButton).toBeDisabled();
  });

  it('should enable the submit button after a temperature is selected', async () => {
    const user = userEvent.setup();
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    const temp3 = screen.getByRole('radio', { name: /3/i });
    await user.click(temp3);

    const submitButton = screen.getByRole('button', {
      name: 'Transmettre au closer',
    });
    expect(submitButton).toBeEnabled();
  });

  it('should display "Sélectionne une température avant de transmettre le lead" when submitting with no temperature', async () => {
    const user = userEvent.setup();
    renderWithTestProviders(
      <HandoffFormModal opened={true} onClose={noop} onSubmit={noop} leadId="lead-1" />,
    );

    // Attempt a programmatic submit via keyboard (Enter) — the form guards
    // with a human-readable error string rather than silently failing.
    const submitButton = screen.getByRole('button', {
      name: 'Transmettre au closer',
    });
    // Force the click via userEvent even though it's disabled to exercise
    // the guarded error path in the Wave 3 implementation.
    await user.click(submitButton);

    expect(
      screen.getByText(
        'Sélectionne une température avant de transmettre le lead',
      ),
    ).toBeInTheDocument();
  });
});
