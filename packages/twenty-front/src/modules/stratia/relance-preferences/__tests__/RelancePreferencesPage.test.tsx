// Wave 0 RED test — imports a component that does not exist yet.
// Wave 4 (plan 03-04) creates ../components/RelancePreferencesPage.tsx.
// Test framework: Jest (Phase 2 precedent).
//
// This page is the per-user override surface for AUTO-01, AUTO-03, AUTO-04
// and AUTO-07 default thresholds. Admin-defined defaults come from a shared
// config object; the user can override each field individually and reset to
// default via a small icon button next to the input.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

// Mock the save mutation — this page does NOT hit the real GraphQL endpoint
// under test.
const mockSavePreferences = jest.fn().mockResolvedValue(undefined);
jest.mock('../hooks/useSaveRelancePreferences', () => ({
  useSaveRelancePreferences: () => ({
    savePreferences: mockSavePreferences,
    isSaving: false,
  }),
}));

// Mock the initial load hook — the page reads the admin defaults + the
// user's current overrides from a custom field on WorkspaceMember.
jest.mock('../hooks/useRelancePreferences', () => ({
  useRelancePreferences: () => ({
    adminDefaults: {
      inactivityDays: 3,
      hotLeadContactDays: 1,
      rdvNotificationMinutes: 30,
      stageBlockedDays: {
        NOUVEAU: 2,
        CONTACTE: 3,
        QUALIFIE: 5,
        NEGOCIATION: 7,
        RENDEZ_VOUS_PRIS: 2,
      },
    },
    userOverrides: null,
    loading: false,
  }),
}));

import { RelancePreferencesPage } from '../components/RelancePreferencesPage';

const renderWithTestProviders = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <JotaiProvider>
        <MantineProvider>{ui}</MantineProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

describe('RelancePreferencesPage', () => {
  beforeEach(() => {
    mockSavePreferences.mockClear();
  });

  it('should render the page title "Mes préférences relances"', () => {
    renderWithTestProviders(<RelancePreferencesPage />);
    expect(screen.getByText('Mes préférences relances')).toBeInTheDocument();
  });

  it('should render 3 NumberInput fields for the top-level relance thresholds', () => {
    renderWithTestProviders(<RelancePreferencesPage />);
    expect(
      screen.getByLabelText("Jours d'inactivité avant relance"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Jours sans contact pour un lead chaud'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Délai de notification avant un RDV'),
    ).toBeInTheDocument();
  });

  it('should render a fieldset "Jours bloqué en stage avant alerte" with 5 NumberInputs, one per non-terminal stage', () => {
    renderWithTestProviders(<RelancePreferencesPage />);
    const fieldset = screen.getByRole('group', {
      name: 'Jours bloqué en stage avant alerte',
    });
    expect(fieldset).toBeInTheDocument();

    const inputs = screen.getAllByTestId(/stage-blocked-days-input/);
    expect(inputs).toHaveLength(5);
  });

  it('should show the admin default in the description of each top-level field', () => {
    renderWithTestProviders(<RelancePreferencesPage />);
    expect(screen.getByText('Défaut global : 3 jours')).toBeInTheDocument();
    expect(screen.getByText('Défaut global : 1 jour')).toBeInTheDocument();
    expect(
      screen.getByText('Défaut global : 30 minutes'),
    ).toBeInTheDocument();
  });

  it('should disable the Save button until the form becomes dirty', async () => {
    const user = userEvent.setup();
    renderWithTestProviders(<RelancePreferencesPage />);
    const saveButton = screen.getByRole('button', {
      name: 'Enregistrer mes préférences',
    });
    expect(saveButton).toBeDisabled();

    const inactivityInput = screen.getByLabelText(
      "Jours d'inactivité avant relance",
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '7');

    expect(saveButton).toBeEnabled();
  });

  it('should render the submit button with text "Enregistrer mes préférences"', () => {
    renderWithTestProviders(<RelancePreferencesPage />);
    expect(
      screen.getByRole('button', { name: 'Enregistrer mes préférences' }),
    ).toBeInTheDocument();
  });

  it('should clear the field and re-show the admin default when the reset icon is clicked', async () => {
    const user = userEvent.setup();
    renderWithTestProviders(<RelancePreferencesPage />);

    const inactivityInput = screen.getByLabelText(
      "Jours d'inactivité avant relance",
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '7');

    const resetButton = screen.getByRole('button', {
      name: "Réinitialiser jours d'inactivité avant relance",
    });
    await user.click(resetButton);

    // After reset, the field should be empty AND the admin default should
    // still be visible in the description.
    expect(inactivityInput).toHaveValue('');
    expect(screen.getByText('Défaut global : 3 jours')).toBeInTheDocument();
  });
});
