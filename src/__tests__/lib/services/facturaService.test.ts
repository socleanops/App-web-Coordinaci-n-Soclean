import { describe, it, expect, vi, beforeEach } from 'vitest';
import { facturaService } from '../../../lib/services/facturaService';
import { supabase } from '../../../lib/supabase';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('facturaService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFacturas', () => {
        it('debe retornar facturas con items formateados (happy path)', async () => {
            const mockData = [{ id: '1', numero: 'FAC-1' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const result = await facturaService.getFacturas();
            expect(result).toEqual(mockData);
            expect(supabase.from).toHaveBeenCalledWith('facturas');
        });

        it('debe lanzar error si supabase falla al obtener facturas', async () => {
            const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            await expect(facturaService.getFacturas()).rejects.toThrow('DB Error');
        });
    });

    describe('createFactura', () => {
        const formDataMock = {
            cliente_id: 'cl1',
            fecha_emision: '2026-01-01',
            estado: 'borrador',
            subtotal: 100,
            impuesto: 22,
            descuento: 0,
            total: 122,
            items: [
                { descripcion: 'Test', cantidad: 1, precio_unitario: 100 }
            ]
        };

        it('debe crear cabecera e items correctamente (happy path)', async () => {
            const newFacturaMock = { id: 'test-id', numero: 'FAC-X' };
            const insertFacturaMock = vi.fn().mockResolvedValue({ data: newFacturaMock, error: null });
            const insertItemsMock = vi.fn().mockResolvedValue({ error: null });

            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'facturas') {
                    return { 
                        insert: vi.fn().mockReturnThis(), 
                        select: vi.fn().mockReturnThis(), 
                        single: insertFacturaMock 
                    } as never;
                }
                if (table === 'factura_items') {
                    return { insert: insertItemsMock } as never;
                }
                return {} as never;
            });

            const result = await facturaService.createFactura(formDataMock as never);
            expect(result).toEqual(newFacturaMock);
            expect(insertItemsMock).toHaveBeenCalledWith([{
                factura_id: 'test-id',
                servicio_id: null,
                descripcion: 'Test',
                cantidad: 1,
                precio_unitario: 100,
                total: 100
            }]);
        });

        it('debe propagar error si falla header de factura', async () => {
             const insertFacturaMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert Error' } });
             vi.mocked(supabase.from).mockImplementation(() => {
                return { insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: insertFacturaMock } as never;
             });

             await expect(facturaService.createFactura(formDataMock as never)).rejects.toThrow('Error factura: Insert Error');
        });
    });

    describe('updateFacturaStatus', () => {
        it('debe actualizar el estado', async () => {
            const singleMock = vi.fn().mockResolvedValue({ data: { id: '1', estado: 'pagado' }, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: singleMock,
            } as never);

            const result = await facturaService.updateFacturaStatus('1', 'pagado' as never);
            expect(result).toEqual({ id: '1', estado: 'pagado' });
        });
    });
});
