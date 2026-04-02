import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clienteService } from '../../../lib/services/clienteService';
import { supabase } from '../../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('clienteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getClientes', () => {
        it('debe retornar lista de clientes (happy path)', async () => {
            const mockData = [{ id: '1', razon_social: 'Empresa A' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const result = await clienteService.getClientes();
            expect(result).toEqual(mockData);
        });

        it('debe lanzar error de base de datos de manera segura', async () => {
            const dbError: PostgrestError = {
                message: 'DB Error Fetching Clientes',
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

            await expect(clienteService.getClientes()).rejects.toThrow('DB Error Fetching Clientes');
        });
    });

    describe('createCliente', () => {
        const formData = {
            razon_social: 'Empresa C',
            rut: '123456789',
            direccion: 'Calle 123',
            email: 'contacto@empresa.com',
            telefono: '9999999',
            estado: 'activo' as const
        };

        it('debe crear un cliente correctamente (happy path)', async () => {
            const insertMock = vi.fn().mockReturnThis();
            const selectMock = vi.fn().mockReturnThis();
            const singleMock = vi.fn().mockResolvedValue({ data: { id: 'c-1', razon_social: 'Empresa C' }, error: null });

            vi.mocked(supabase.from).mockReturnValue({
                insert: insertMock,
                select: selectMock,
                single: singleMock
            } as never);

            const result = await clienteService.createCliente(formData);
            expect(result).toEqual({ id: 'c-1', razon_social: 'Empresa C' });
            expect(insertMock).toHaveBeenCalled();
            // Verifica que la carga "nombre" haya sido inyectada (nombre: dataToInsert.razon_social)
            expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Empresa C' }));
        });

        it('debe lanzar error al fallar inserción', async () => {
            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
            } as never);

            await expect(clienteService.createCliente(formData)).rejects.toThrow('Insert failed');
        });
    });

    describe('updateCliente', () => {
        it('debe actualizar el cliente correctamente y el nombre a la par de la razon_social', async () => {
            const formData = { razon_social: 'Empresa D' };
            const updateMock = vi.fn().mockReturnThis();
            const eqMock = vi.fn().mockReturnThis();
            const selectMock = vi.fn().mockReturnThis();
            const singleMock = vi.fn().mockResolvedValue({ data: { id: 'c-1', razon_social: 'Empresa D', nombre: 'Empresa D' }, error: null });

            vi.mocked(supabase.from).mockReturnValue({
                update: updateMock,
                eq: eqMock,
                select: selectMock,
                single: singleMock
            } as never);

            const result = await clienteService.updateCliente('c-1', formData);
            expect(result).toEqual({ id: 'c-1', razon_social: 'Empresa D', nombre: 'Empresa D' });
            expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
                razon_social: 'Empresa D',
                nombre: 'Empresa D'
            }));
            expect(eqMock).toHaveBeenCalledWith('id', 'c-1');
        });
    });
});
