import { describe, it, expect } from 'vitest';
import { procesarFacturacion } from '../../lib/calculators/billing';
import type { Asistencia } from '@/types';

describe('Calculadora de Facturación (procesarFacturacion)', () => {
    
    it('Caso 1 (Regular): Computa solo los estados válidos (presente, tardanza)', () => {
        const dataMock = [
            {
                fecha: '2026-03-01',
                estado: 'presente',
                funcionarios: { profiles: { nombre: 'Juan', apellido: 'A' } },
                horarios: { hora_entrada: '08:00', hora_salida: '16:00', servicios: { nombre: 'Limpieza' } }
            },
            {
                fecha: '2026-03-02',
                estado: 'ausente', // No debe sumar
                funcionarios: { profiles: { nombre: 'Juan', apellido: 'A' } },
                horarios: { hora_entrada: '08:00', hora_salida: '16:00', servicios: { nombre: 'Limpieza' } }
            }
        ];

        const { rows, totalHoras } = procesarFacturacion(dataMock as unknown as Asistencia[]);
        expect(rows).toHaveLength(1);
        expect(totalHoras).toBe(8);
        expect(rows[0].horasDisplay).toBe('8h');
    });

    it('Caso 2 (Noche): Maneja turnos que cruzan la medianoche de forma cruzada (< 0)', () => {
        const dataMock = [
            {
                fecha: '2026-03-03',
                estado: 'justificado',
                funcionarios: { profiles: { nombre: 'Carlos', apellido: 'B' } },
                horarios: { hora_entrada: '22:00', hora_salida: '06:00', servicios: { nombre: 'Seguridad' } }
            }
        ];

        const { rows, totalHoras } = procesarFacturacion(dataMock as unknown as Asistencia[]);
        expect(rows).toHaveLength(1);
        expect(totalHoras).toBe(8); // (6 - 22) + 24 = 8
    });

    it('Caso 3 (Fracciones): Muestra y suma correctamente las fracciones de hora', () => {
        const dataMock = [
            {
                fecha: '2026-03-04',
                estado: 'salida_anticipada',
                funcionarios: { profiles: { nombre: 'Ana', apellido: 'C' } },
                horarios: { hora_entrada: '08:30', hora_salida: '10:45', servicios: { nombre: 'Limpieza Express' } }
            }
        ];

        const { rows, totalHoras } = procesarFacturacion(dataMock as unknown as Asistencia[]);
        expect(rows).toHaveLength(1);
        expect(totalHoras).toBeCloseTo(2.25); // 2 hrs 15 min
        expect(rows[0].horasDisplay).toBe('2h 15m');
    });
});
