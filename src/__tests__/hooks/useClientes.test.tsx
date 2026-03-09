import { renderHook, waitFor } from '@testing-library/react';
import { useClientes } from '@/hooks/useClientes';
import { supabase } from '@/lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

describe('useClientes hook', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
                mutations: {
                    retry: false,
                }
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    it('should throw an error when createCliente fails', async () => {
        const mockError = { message: 'Supabase insert error' };

        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
        const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

        (supabase.from as any).mockReturnValue({ insert: mockInsert });

        const { result } = renderHook(() => useClientes(), { wrapper });

        const newCliente = {
            razon_social: 'Test Cliente',
            rut: '12345678',
            direccion: 'Test Address',
            estado: 'activo' as const,
        };

        result.current.createCliente.mutate(newCliente);

        await waitFor(() => {
            expect(result.current.createCliente.isError).toBe(true);
        });

        expect(result.current.createCliente.error).toBeInstanceOf(Error);
        expect(result.current.createCliente.error?.message).toBe('Supabase insert error');
    });
});
