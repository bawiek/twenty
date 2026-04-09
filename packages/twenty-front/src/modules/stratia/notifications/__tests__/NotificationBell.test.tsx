// Wave 0 RED test — imports a component that does not exist yet.
// Wave 4 (plan 03-04) creates ../components/NotificationBell.tsx.
// Test framework: Jest (Phase 2 precedent).
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';

// Mock the useUnreadNotifications hook so the bell component is testable
// without the underlying GraphQL query.
const mockUseUnreadNotifications = jest.fn();
jest.mock('../hooks/useUnreadNotifications', () => ({
  useUnreadNotifications: () => mockUseUnreadNotifications(),
}));

import { NotificationBell } from '../components/NotificationBell';

const renderWithTestProviders = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <JotaiProvider>
        <MantineProvider>{ui}</MantineProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

describe('NotificationBell', () => {
  beforeEach(() => {
    mockUseUnreadNotifications.mockReset();
  });

  it('should render an IconBell inside a Mantine Indicator wrapper', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 0,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);

    const indicator = screen.getByTestId('stratia-notification-indicator');
    expect(indicator).toBeInTheDocument();

    const icon = screen.getByTestId('stratia-notification-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should mark the Indicator as disabled when unreadCount === 0', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 0,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);
    const indicator = screen.getByTestId('stratia-notification-indicator');
    expect(indicator).toHaveAttribute('data-disabled', 'true');
  });

  it('should show an enabled Indicator with label 5 when unreadCount === 5', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 5,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);
    const indicator = screen.getByTestId('stratia-notification-indicator');
    expect(indicator).toHaveAttribute('data-disabled', 'false');
    expect(indicator).toHaveAttribute('data-label', '5');
  });

  it('should show "99+" on the Indicator label when unreadCount > 99', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 250,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);
    const indicator = screen.getByTestId('stratia-notification-indicator');
    expect(indicator).toHaveAttribute('data-label', '99+');
  });

  it('should set aria-label "Notifications" when count is 0', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 0,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);
    const button = screen.getByRole('button', { name: 'Notifications' });
    expect(button).toBeInTheDocument();
  });

  it('should set aria-label "Notifications — 3 non lues" when count is 3', () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 3,
      loading: false,
    });
    renderWithTestProviders(<NotificationBell />);
    const button = screen.getByRole('button', {
      name: 'Notifications — 3 non lues',
    });
    expect(button).toBeInTheDocument();
  });

  it('should toggle the notification panel open state on click', async () => {
    mockUseUnreadNotifications.mockReturnValue({
      unreadCount: 2,
      loading: false,
    });
    const user = userEvent.setup();
    renderWithTestProviders(<NotificationBell />);

    const button = screen.getByRole('button', {
      name: 'Notifications — 2 non lues',
    });
    await user.click(button);

    // After the first click, the panel should be open.
    expect(
      screen.getByTestId('stratia-notification-panel'),
    ).toBeInTheDocument();

    // Second click closes it.
    await user.click(button);
    expect(
      screen.queryByTestId('stratia-notification-panel'),
    ).not.toBeInTheDocument();
  });
});
