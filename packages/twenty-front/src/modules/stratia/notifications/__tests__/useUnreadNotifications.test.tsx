// Wave 0 RED test — imports a hook that does not exist yet.
// Wave 4 (plan 03-04) creates ../hooks/useUnreadNotifications.ts.
// Test framework: Jest (Phase 2 precedent — twenty-front uses Jest globals).
//
// OQ-3 resolution (see 03-SPIKES.md): useFindManyRecords does NOT expose a
// pollInterval prop. The hook must instead pair useFindManyRecords with a
// setInterval-driven refetch every 60000ms. This test asserts both the
// filter shape and the 60000ms refetch cadence (using fake timers).
import { renderHook, waitFor } from '@testing-library/react';

// Mock useFindManyRecords — return a controllable refetch + records list.
const mockRefetch = jest.fn().mockResolvedValue({ data: {} });
const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (params: unknown) => mockUseFindManyRecords(params),
}));

// Mock current workspace member id source — the hook must resolve the
// current member id from Twenty's auth state.
jest.mock('@/auth/states/currentWorkspaceMemberState', () => ({
  currentWorkspaceMemberState: { key: 'currentWorkspaceMemberState' },
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'member-123' }),
}));

// The literal `pollInterval` and `60000` are referenced here so the Wave 4
// implementer knows the expected cadence (60s = 60000ms). See 03-SPIKES.md
// OQ-3 for the final shape decision (setInterval + refetch).
const POLL_INTERVAL_MS = 60000;

import { useUnreadNotifications } from '../hooks/useUnreadNotifications';

describe('useUnreadNotifications', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
    mockUseFindManyRecords.mockReset();
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      loading: false,
      refetch: mockRefetch,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should query stratiaNotification with the correct unread filter', () => {
    renderHook(() => useUnreadNotifications());

    const callArg = mockUseFindManyRecords.mock.calls[0]?.[0] as {
      objectNameSingular: string;
      filter: unknown;
    };
    expect(callArg.objectNameSingular).toBe('stratiaNotification');

    const filterString = JSON.stringify(callArg.filter);
    expect(filterString).toContain('recipientId');
    expect(filterString).toContain('member-123');
    expect(filterString).toContain('readAt');
    expect(filterString).toContain('NULL');
  });

  it('should expose unreadCount equal to records.length', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
      loading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useUnreadNotifications());
    expect(result.current.unreadCount).toBe(3);
  });

  it('should call refetch every 60000ms (pollInterval cadence) via setInterval', async () => {
    renderHook(() => useUnreadNotifications());

    // Advance fake timers by the poll interval and assert refetch fires.
    jest.advanceTimersByTime(POLL_INTERVAL_MS);
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(POLL_INTERVAL_MS);
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should return loading=true and unreadCount=0 while the underlying query is loading', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      loading: true,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useUnreadNotifications());
    expect(result.current.loading).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });
});
