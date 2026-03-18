import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        loading: vi.fn(() => 'toast-id'),
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@/lib/utils', () => ({
    generateSecureRandomString: vi.fn(() => 'mock-suffix'),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            signUp: vi.fn(),
        },
    })),
}));

// Mock useQuery para evitar errores de "Query data cannot be undefined"
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: [],
            isLoading: false,
            isError: false,
        })),
        useQueryClient: vi.fn(() => ({
            invalidateQueries: vi.fn(),
        })),
    };
});

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useFuncionarios - createFuncionario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should close toast on error when profile already exists', async () => {
        // Mock supabase to return an existing profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Mock dinámico para Supabase
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-profile-id' } }),
                };
            }
            if (table === 'funcionarios') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: {
                            id: 'existing-func-id',
                            profiles: { nombre: 'Test', apellido: 'User' },
                        },
                    }),
                };
            }
            return {};
        });

        const { result } = renderHook(() => useFuncionarios(), {
            wrapper: createWrapper(),
        });

        const formData: FuncionarioFormData = {
            cedula: '12345678',
            email: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            id: undefined,
            rol: 'funcionario',
            cargo: 'Test Cargo',
            departamento_id: '123e4567-e89b-12d3-a456-426614174000',
            direccion: 'Test Address 123',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            tipo_contrato: 'indefinido',
            estado: 'activo',
        };

        result.current.createFuncionario.mutate(formData);

        await waitFor(() => {
            expect(result.current.createFuncionario.isError).toBe(true);
        });

        // Verify toast.error was called with the correct ID
        expect(toast.error).toHaveBeenCalledWith(
            expect.stringContaining('ya está registrado'),
            { id: 'toast-id' }
        );
    });

    it('should close toast on timeout', async () => {
        // Mock supabase to delay response longer than timeout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Mock dinámico para Supabase
        (supabase.from as any).mockImplementation(() => {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null }), 20000))),
            };
        });

        const { result } = renderHook(() => useFuncionarios(), {
            wrapper: createWrapper(),
        });

        const formData: FuncionarioFormData = {
            cedula: '12345678',
            email: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            id: undefined,
            rol: 'funcionario',
            cargo: 'Test Cargo',
            departamento_id: '123e4567-e89b-12d3-a456-426614174000',
            direccion: 'Test Address 123',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            tipo_contrato: 'indefinido',
            estado: 'activo',
        };

        result.current.createFuncionario.mutate(formData);

        // Wait for timeout to trigger (18000ms + buffer)
        await new Promise(resolve => setTimeout(resolve, 19000));

        // Verify toast.error was called for timeout
        expect(toast.error).toHaveBeenCalledWith(
            expect.stringContaining('Timeout interno'),
            { id: 'toast-id' }
        );
    }, 25000); // 25 seconds timeout
});