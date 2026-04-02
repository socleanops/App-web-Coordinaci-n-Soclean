import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useServicios } from '../../hooks/useServicios';
import { supabase } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: queryClient }, children);

describe('useServicios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    describe('getServicios', () => {
        it('debe mapear y transformar la respuesta exitosamente (happy path)', async () => {
            const rawMockData = [
                { id: '1', nombre: 'Limpieza', clientes: [{ razon_social: 'Empresa A' }] }, // Mock de join array
                { id: '2', nombre: 'Guardia', clientes: { razon_social: 'Empresa B' } } // Mock single
            ];
            
            const orderMock = vi.fn().mockResolvedValue({ data: rawMockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const { result } = renderHook(() => useServicios(), { wrapper });

            await waitFor(() => {
                expect(result.current.getServicios.isSuccess).toBe(true);
            });

            const data = result.current.getServicios.data;
            // Array normalization validation inside useQuery
            expect(data?.[0].clientes).toEqual({ razon_social: 'Empresa A' });
            expect(data?.[1].clientes).toEqual({ razon_social: 'Empresa B' });
        });

        it('debe lanzar error de consulta estructurada si ocurre', async () => {
            const dbError: PostgrestError = {
                message: 'Supabase Error: Failed to fetch',
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

            const { result } = renderHook(() => useServicios(), { wrapper });

            await waitFor(() => {
                expect(result.current.getServicios.isError).toBe(true);
            });

            const error = result.current.getServicios.error;
            const errMsg = error instanceof Error ? error.message : (error as unknown as PostgrestError).message ?? String(error);
            expect(errMsg).toBe('Supabase Error: Failed to fetch');
        });
    });

    describe('createServicio', () => {
        it('debe crear un recurso de servicio a traves de postgrest y revalidar endpoints', async () => {
            const singleMock = vi.fn().mockResolvedValue({ data: { id: 'test' }, error: null });
            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: singleMock,
            } as never);

            const { result } = renderHook(() => useServicios(), { wrapper });

            await result.current.createServicio.mutateAsync({
                cliente_id: 'c-1',
                nombre: 'Testing',
                descripcion: '-',
                direccion: '-',
                estado: 'activo'
            });

            expect(singleMock).toHaveBeenCalled();
        });
    });
});
