import { describe, it, expect, vi, beforeEach } from 'vitest';
import { asistenciaService } from '../../../lib/services/asistenciaService';
import { supabase } from '../../../lib/supabase';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('asistenciaService - generarPlanillaDia', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Caso 1: Retorna count 0 si el empleado no tiene horarios para ese día', async () => {
        // Mock de horarios
        const eqMock = vi.fn().mockReturnThis();
        const lteMock = vi.fn().mockResolvedValue({ data: [], error: null }); // Sin horarios
        
        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: eqMock,
            lte: lteMock,
        } as any);

        const result = await asistenciaService.generarPlanillaDia('2026-10-10');

        expect(result).toEqual({ count: 0 });
        expect(supabase.from).toHaveBeenCalledWith('horarios');
    });

    it('Caso 2: Genera registro con estado "pendiente" para un empleado normal activo', async () => {
        // Horario activo
        const horariosMock = vi.fn().mockResolvedValue({ 
            data: [{ id: 'h1', funcionario_id: 'f1', vigente_desde: '2026-01-01', vigente_hasta: null }], 
            error: null 
        });
        
        // Sin asistencias previas
        const asistenciaPrevMock = vi.fn().mockResolvedValue({ data: [], error: null });
        
        // Sin certificaciones
        const certsMock = vi.fn().mockResolvedValue({ data: [], error: null });
        
        const insertMock = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'horarios') {
                return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), lte: horariosMock } as any;
            }
            if (table === 'asistencia') {
                return { select: vi.fn().mockReturnThis(), eq: asistenciaPrevMock, insert: insertMock } as any;
            }
            if (table === 'certificaciones') {
                return { select: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), gte: certsMock } as any;
            }
            return {} as any;
        });

        const result = await asistenciaService.generarPlanillaDia('2026-10-10');

        expect(result.count).toBe(1);
        expect(insertMock).toHaveBeenCalledWith([{
            funcionario_id: 'f1',
            horario_id: 'h1',
            fecha: '2026-10-10',
            estado: 'pendiente'
        }]);
    });

    it('Caso 3: Detecta Certificación y marca el estado debidamente como "certificado"', async () => {
        // Horario activo
        const horariosMock = vi.fn().mockResolvedValue({ 
            data: [{ id: 'h2', funcionario_id: 'f2', vigente_desde: '2026-01-01', vigente_hasta: null }], 
            error: null 
        });
        
        // Asistencia vacía
        const asistenciaPrevMock = vi.fn().mockResolvedValue({ data: [], error: null });
        
        // Empleado con Certificación médica
        const certsMock = vi.fn().mockResolvedValue({ 
            data: [{ funcionario_id: 'f2' }], 
            error: null 
        });

        const insertMock = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'horarios') {
                return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), lte: horariosMock } as any;
            }
            if (table === 'asistencia') {
                return { select: vi.fn().mockReturnThis(), eq: asistenciaPrevMock, insert: insertMock } as any;
            }
            if (table === 'certificaciones') {
                return { select: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), gte: certsMock } as any;
            }
            return {} as any;
        });

        const result = await asistenciaService.generarPlanillaDia('2026-10-10');

        expect(result.count).toBe(1);
        expect(insertMock).toHaveBeenCalledWith([{
            funcionario_id: 'f2',
            horario_id: 'h2',
            fecha: '2026-10-10',
            estado: 'certificado' // Esto es crítico para AGENTS.md
        }]);
    });
});
