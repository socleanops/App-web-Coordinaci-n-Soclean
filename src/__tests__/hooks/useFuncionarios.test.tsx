import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFuncionarios } from '../../hooks/useFuncionarios';
import { supabase } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: queryClient }, children);

describe('useFuncionarios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    describe('getFuncionarios', () => {
        it('debe retornar lista de funcionarios (happy path)', async () => {
            const mockData = [{ id: '1', cedula: '123' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const { result } = renderHook(() => useFuncionarios(), { wrapper });

            await waitFor(() => {
                expect(result.current.getFuncionarios.isSuccess).toBe(true);
            });

            expect(result.current.getFuncionarios.data).toEqual(mockData);
        });

        it('debe capturar un error de supabase al fallar la consulta de manera correcta', async () => {
            const dbError: PostgrestError = {
                message: 'Carga falló',
                details: '',
                hint: '',
                code: '500',
                name: 'PostgrestError'
            };
            const orderMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const { result } = renderHook(() => useFuncionarios(), { wrapper });

            await waitFor(() => {
                expect(result.current.getFuncionarios.isError).toBe(true);
            });

            const errMsg = result.current.getFuncionarios.error instanceof Error 
                ? result.current.getFuncionarios.error.message 
                : (result.current.getFuncionarios.error as unknown as PostgrestError).message ?? String(result.current.getFuncionarios.error);
                
            expect(errMsg).toBe('Carga falló');
        });
    });

    describe('deleteFuncionario', () => {
        it('debe invocar a supabase.from("profiles").delete() con el ID para efectuar cascada', async () => {
            const deleteMock = vi.fn().mockReturnThis();
            const eqMock = vi.fn().mockResolvedValue({ error: null });

            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'profiles') {
                    return { delete: deleteMock, eq: eqMock } as never;
                }
                return {} as never;
            });

            const { result } = renderHook(() => useFuncionarios(), { wrapper });

            await result.current.deleteFuncionario.mutateAsync({ id: '1', profileId: 'prof-1' });

            expect(deleteMock).toHaveBeenCalled();
        });
    });
});
