import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('App Authentication Init', () => {
  const originalConsoleError = console.error;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuthStore.setState({ user: null, role: null, isLoading: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('handles critical error during session initialization and attempts sign out', async () => {
    const criticalError = new Error('Database connection failed');
    vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(criticalError);
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

    render(<App />);

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Critical Auth Init Error:', criticalError);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    // Loading state should be set to false finally
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('handles nested error when sign out fails during critical failure', async () => {
    const criticalError = new Error('Network offline');
    const signOutError = new Error('Signout failed');

    vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(criticalError);
    vi.mocked(supabase.auth.signOut).mockRejectedValueOnce(signOutError);

    render(<App />);

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Critical Auth Init Error:', criticalError);
      expect(consoleErrorMock).toHaveBeenCalledWith('SignOut error during critical failure:', signOutError);
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
