import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '@/pages/Login';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            resetPasswordForEmail: vi.fn(),
        },
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
    useAuthStore: vi.fn((selector) => {
        const state = {
            setUser: vi.fn(),
            setRole: vi.fn(),
        };
        return selector(state);
    }),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Polyfill for Radix UI hasPointerCapture issue in jsdom
if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
}

describe('Login component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows error toast when handleResetPassword fails', async () => {
        const user = userEvent.setup();
        const errorMessage = 'Network error occurred';

        // Setup mock to return an error
        (supabase.auth.resetPasswordForEmail as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: null,
            error: new Error(errorMessage)
        });

        render(<Login />);

        // Click on "forgot password" to open dialog
        const forgotPasswordBtn = screen.getByText('¿Olvidaste tu contraseña?');
        await user.click(forgotPasswordBtn);

        // Wait for dialog to open
        await screen.findByRole('dialog');

        // Find email input and enter email. Since there are multiple labels with "Correo electrónico",
        // we'll get the one specific to the reset dialog which is the second one or by explicit ID
        const resetEmailInput = screen.getByLabelText(/Correo electrónico/i, { selector: '#reset-email' });
        await user.type(resetEmailInput, 'test@example.com');

        // Click submit button
        const submitBtn = screen.getByRole('button', { name: 'Enviar correo' });
        await user.click(submitBtn);

        // Verify that resetPasswordForEmail was called correctly
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
            redirectTo: window.location.origin,
        });

        // Verify toast.error was called with the error message
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });
});
