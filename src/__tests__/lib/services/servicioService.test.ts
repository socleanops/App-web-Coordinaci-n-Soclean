import { describe, it, expect, vi, beforeEach } from 'vitest';
import { servicioService } from '../../../lib/services/servicioService';
import { supabase } from '../../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('servicioService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getServicios', () => {
        it('debe retornar lista de servicios (happy path)', async () => {
            const mockData = [{ id: '1', nombre: 'Limpieza' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const result = await servicioService.getServicios();
            expect(result).toEqual(mockData);
        });

        it('debe propagar error si falla la query', async () => {
            const dbError: PostgrestError = {
                message: 'DB Error Fetching Servicios',
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

            await expect(servicioService.getServicios()).rejects.toThrow('DB Error Fetching Servicios');
        });
    });

    describe('createServicio', () => {
        const formData = {
            cliente_id: 'c-1',
            nombre: 'Servicio Limpieza',
            descripcion: 'Limpieza general',
            direccion: '-',
            estado: 'activo' as const
        };

        it('debe insertar servicio ignorando el id vacío', async () => {
            const singleMock = vi.fn().mockResolvedValue({ data: { id: 's-1', ...formData }, error: null });
            const insertMock = vi.fn().mockReturnThis();

            vi.mocked(supabase.from).mockReturnValue({
                insert: insertMock,
                select: vi.fn().mockReturnThis(),
                single: singleMock
            } as never);

            const result = await servicioService.createServicio(formData);
            
            expect(result.id).toBe('s-1');
            expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Servicio Limpieza' }));
        });
    });

    describe('updateServicio', () => {
        it('debe actualizar los datos mediante update() => eq()', async () => {
            const updateMock = vi.fn().mockReturnThis();
            const eqMock = vi.fn().mockReturnThis();
            const singleMock = vi.fn().mockResolvedValue({ data: { id: 's-1' }, error: null });

            vi.mocked(supabase.from).mockReturnValue({
                update: updateMock,
                eq: eqMock,
                select: vi.fn().mockReturnThis(),
                single: singleMock
            } as never);

            const result = await servicioService.updateServicio('s-1', { estado: 'inactivo' });
            expect(updateMock).toHaveBeenCalledWith({ estado: 'inactivo' });
            expect(eqMock).toHaveBeenCalledWith('id', 's-1');
            expect(result).toEqual({ id: 's-1' });
        });

        it('debe lanzar error de base de datos formateado en modo seguro si falla el parse', async () => {
            vi.mocked(supabase.from).mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed to update' } })
            } as never);

            try {
                await servicioService.updateServicio('s-1', {});
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : (error as PostgrestError).message ?? String(error);
                expect(errMsg).toBe('Failed to update');
            }
        });
    });
});
