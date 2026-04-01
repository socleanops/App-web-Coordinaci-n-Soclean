import { describe, it, expect, vi, beforeEach } from 'vitest';
import { horarioService } from '../../../lib/services/horarioService';
import { supabase } from '../../../lib/supabase';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('horarioService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getHorarios', () => {
        it('debe retornar lista de horarios ordenada (happy path)', async () => {
            const mockData = [{ id: '1' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(), 
                // We mock the final chained method carefully
            } as never);
            
            // Re-mock to handle chained method sequence
            vi.mocked(supabase.from).mockImplementation(() => {
                const queryBuilder = {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockImplementation((col) => {
                        if (col === 'hora_entrada') return orderMock();
                        return queryBuilder;
                    })
                };
                return queryBuilder as never;
            });

            const result = await horarioService.getHorarios();
            expect(result).toEqual(mockData);
        });

        it('debe propagar errores de base de datos', async () => {
            vi.mocked(supabase.from).mockImplementation(() => {
                const queryBuilder = {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockImplementation((col) => {
                        if (col === 'hora_entrada') return Promise.resolve({ data: null, error: { message: 'DB Error' } });
                        return queryBuilder;
                    })
                };
                return queryBuilder as never;
            });

            await expect(horarioService.getHorarios()).rejects.toThrow('DB Error');
        });
    });

    describe('checkOverlap', () => {
        it('debe pasar si no hay conflictos de horarios', async () => {
             const existingMock = vi.fn().mockResolvedValue({ data: [], error: null });
             
             vi.mocked(supabase.from).mockReturnValue({
                 select: vi.fn().mockReturnThis(),
                 eq: vi.fn().mockReturnThis(),
                 is: existingMock
             } as never);

             await expect(horarioService.checkOverlap('func1', 1, '10:00', '14:00')).resolves.toBeUndefined();
        });

        it('debe lanzar error por solapamiento', async () => {
            const existingMock = vi.fn().mockResolvedValue({ 
                data: [{ id: '2', hora_entrada: '09:00', hora_salida: '13:00' }], 
                error: null 
            });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: existingMock
            } as never);

            await expect(horarioService.checkOverlap('func1', 1, '10:00', '14:00'))
                .rejects.toThrow('⚠️ Conflicto: Este funcionario ya tiene un horario el Lunes de 09:00 a 13:00 que se superpone.');
        });
    });

    describe('createHorario y updateHorario', () => {
        it('debe crear exitosamente luego de checkear overlap', async () => {
            const insertMock = vi.fn().mockResolvedValue({ data: { id: 'test' }, error: null });
            
            vi.mocked(supabase.from).mockImplementation(() => {
                return {
                    insert: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    single: insertMock,
                    // mock for checkOverlap query
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockResolvedValue({ data: [], error: null }),
                } as never;
            });

            const result = await horarioService.createHorario({
                funcionario_id: 'func1',
                dia_semana: 1,
                hora_entrada: '14:00',
                hora_salida: '18:00'
            } as never);

            expect(result).toEqual({ id: 'test' });
        });
    });
});
