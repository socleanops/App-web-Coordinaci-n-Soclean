import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { supabase } from '@/lib/supabase';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => vi.fn(),
    };
});

// Mock Zustand store
vi.mock('@/stores/authStore', () => ({
    useAuthStore: vi.fn((selector) => {
        // Return a dummy implementation for setUser and setRole
        return vi.fn();
    }),
}));

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    it('renders the login form', () => {
        renderLogin();
        expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('shows validation errors for invalid input', async () => {
        const user = userEvent.setup();
        renderLogin();

        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Debe ser un correo electrónico válido/i)).toBeInTheDocument();
            expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        await user.type(emailInput, 'invalid-email');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Debe ser un correo electrónico válido/i)).toBeInTheDocument();
        });
    });

    it('handles invalid login credentials correctly', async () => {
        const user = userEvent.setup();
        const errorMessage = 'Credenciales incorrectas';

        // Mock the supabase function to return an error
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: null },
            error: { message: errorMessage },
        });

        renderLogin();

        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        // Wait for error message to be displayed
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        // Ensure button is back to original state
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent(/Iniciar Sesión/i);
    });
});
