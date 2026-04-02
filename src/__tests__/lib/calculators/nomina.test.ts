import { describe, it, expect } from 'vitest';
import { procesarNomina } from '../../../lib/calculators/nomina';

describe('procesarNomina', () => {
    const mockBaseFuncionario = {
        funcionario_id: 'func-1',
        funcionarios: {
            cedula: '12345678',
            profiles: {
                nombre: 'Juan',
                apellido: 'Perez'
            }
        }
    };

    it('Caso Normal: Calcula correctamente las horas trabajadas en horario diurno', () => {
        const asistencias = [{
            ...mockBaseFuncionario,
            estado: 'presente',
            fecha: '2026-06-15',
            hora_entrada_registrada: '2026-06-15T08:00:00-03:00',
            hora_salida_registrada: '2026-06-15T16:00:00-03:00'
        }];

        const resultado = procesarNomina(asistencias);
        
        expect(resultado).toHaveLength(1);
        expect(resultado[0].totalHoras).toBe(8);
        expect(resultado[0].horasNocturnas).toBe(0);
        expect(resultado[0].horasFeriado).toBe(0);
        expect(resultado[0].diasTrabajados).toBe(1);
    });

    it('Caso Borde: Calcula correctamente horas nocturnas (cruzando la medianoche)', () => {
        // En nomina.ts, el cruce nocturno se cuenta si está entre las 22:00 y las 6:00
        // Para evitar problemas de zonas horarias en los tests si corre en UTC, usamos el fallback de 'horarios' o damos horas precisas
        const asistencias = [{
            ...mockBaseFuncionario,
            estado: 'presente',
            fecha: '2026-06-15',
            horarios: {
                hora_entrada: '21:00', // 21:00 a 05:00 son 8 horas totales. De 22:00 a 05:00 son 7 horas nocturnas.
                hora_salida: '05:00'
            }
        }];

        const resultado = procesarNomina(asistencias);
        
        expect(resultado[0].totalHoras).toBe(8);
        expect(resultado[0].horasNocturnas).toBe(7); 
    });

    it('Caso Feriados, Faltas y Certificados: Agrupa correctamente múltiples estados e identifica feriados', () => {
        const asistencias = [
            {
                ...mockBaseFuncionario,
                estado: 'presente',
                fecha: '2026-05-01', // 1 de mayo es feriado
                horarios: { hora_entrada: '08:00', hora_salida: '12:00' } // 4 horas
            },
            {
                ...mockBaseFuncionario,
                estado: 'ausente',
                fecha: '2026-05-02',
            },
            {
                ...mockBaseFuncionario,
                estado: 'certificado',
                fecha: '2026-05-03',
            }
        ];

        const resultado = procesarNomina(asistencias);
        
        expect(resultado[0].diasTrabajados).toBe(1);
        expect(resultado[0].totalHoras).toBe(4);
        expect(resultado[0].horasFeriado).toBe(4); // Feriado detectado
        expect(resultado[0].faltas).toBe(1);
        expect(resultado[0].certificados).toBe(1);
    });

    it('Caso Búsqueda: Filtra correctamente por nombre o cédula', () => {
        const asistencias = [
            {
                ...mockBaseFuncionario,
                estado: 'ausente'
            },
            {
                funcionario_id: 'func-2',
                estado: 'ausente',
                funcionarios: {
                    cedula: '87654321',
                    profiles: { nombre: 'Maria', apellido: 'Gomez' }
                }
            }
        ];

        const resTodos = procesarNomina(asistencias, '');
        expect(resTodos).toHaveLength(2);

        const resMaria = procesarNomina(asistencias, 'Maria');
        expect(resMaria).toHaveLength(1);
        expect(resMaria[0].nombreCompleto).toBe('Maria Gomez');

        const resCedula = procesarNomina(asistencias, '1234');
        expect(resCedula).toHaveLength(1);
        expect(resCedula[0].nombreCompleto).toBe('Juan Perez');
    });
});
