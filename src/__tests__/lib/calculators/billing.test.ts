import { describe, it, expect } from 'vitest';
import { procesarFacturacion } from '../../../lib/calculators/billing';

describe('procesarFacturacion', () => {
    
    // Helper para generar una asistencia base con menos repetición
    const crearAsistencia = (estado: string, hora_entrada: string, hora_salida: string) => ({
        estado,
        fecha: '2026-10-10',
        funcionarios: { profiles: { nombre: 'Ana', apellido: 'Paz' } },
        horarios: {
            hora_entrada,
            hora_salida,
            servicios: { nombre: 'Limpieza Base' }
        }
    });

    it('Caso Normal: Calcula horas diurnas y formatea el texto de visualización', () => {
        const datos = [ crearAsistencia('presente', '09:00', '14:30') ];
        const resultado = procesarFacturacion(datos);
        
        expect(resultado.rows).toHaveLength(1);
        expect(resultado.rows[0].funcionario).toBe('Ana Paz');
        expect(resultado.rows[0].horasDecimal).toBe(5.5);
        expect(resultado.rows[0].horasDisplay).toBe('5h 30m');
        expect(resultado.totalHoras).toBe(5.5);
    });

    it('Caso Borde (Nocturno): Maneja correctamente los turnos que cruzan la medianoche', () => {
        const datos = [ crearAsistencia('presente', '22:00', '06:15') ];
        const resultado = procesarFacturacion(datos);
        
        // 22 a 06 son 8 horas, más 15 minutos = 8.25
        expect(resultado.rows).toHaveLength(1);
        expect(resultado.rows[0].horasDecimal).toBe(8.25);
        expect(resultado.rows[0].horasDisplay).toBe('8h 15m');
        expect(resultado.totalHoras).toBe(8.25);
    });

    it('Caso Estados No Facturables: Ignora ausencias o certificados en la sumatoria total', () => {
        const datos = [
            crearAsistencia('presente', '08:00', '12:00'),           // 4 horas
            crearAsistencia('tardanza', '09:00', '13:00'),           // 4 horas (los horarios en base de datos siguen siendo el turno teórico)
            crearAsistencia('ausente', '14:00', '18:00'),            // No debe facturarse
            crearAsistencia('certificado', '06:00', '14:00'),        // No debe facturarse
            crearAsistencia('justificado', '10:00', '11:00')         // 1 hora
        ];

        const resultado = procesarFacturacion(datos);
        
        // Solo presente, tardanza y justificado deben ser incluidos = 3 filas
        expect(resultado.rows).toHaveLength(3);
        // El total en decimal debe ser 4 + 4 + 1 = 9
        expect(resultado.totalHoras).toBe(9);
    });

    it('Caso Incompleto: Horarios nulos o inválidos reportan como 0h sin romper', () => {
        const datos = [ crearAsistencia('presente', null as unknown as string, undefined as unknown as string) ];
        const resultado = procesarFacturacion(datos);
        
        expect(resultado.rows).toHaveLength(1);
        expect(resultado.rows[0].horasDecimal).toBe(0);
        expect(resultado.rows[0].horasDisplay).toBe('0 hs');
    });
});
