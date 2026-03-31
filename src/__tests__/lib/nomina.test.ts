import { describe, it, expect } from 'vitest';
import { procesarNomina } from '../../lib/calculators/nomina';

describe('Calculadora de Nómina (procesarNomina)', () => {
    
    it('Caso 1 (Regular): Suma horas correctamente y excluye ausencias de los totales de horas', () => {
        const asistenciasMock = [
            {
                funcionario_id: 'func-1',
                estado: 'presente',
                hora_entrada_registrada: '2026-03-01T08:00:00-03:00',
                hora_salida_registrada: '2026-03-01T16:00:00-03:00', // 8 horas
                fecha: '2026-03-01',
                funcionarios: { profiles: { nombre: 'Juan', apellido: 'Pérez' }, cedula: '123' }
            },
            {
                funcionario_id: 'func-1',
                estado: 'ausente',
                fecha: '2026-03-02',
                funcionarios: { profiles: { nombre: 'Juan', apellido: 'Pérez' }, cedula: '123' }
            }
        ];

        const resultado = procesarNomina(asistenciasMock);
        expect(resultado).toHaveLength(1);
        expect(resultado[0].nombreCompleto).toBe('Juan Pérez');
        expect(resultado[0].totalHoras).toBe(8);
        expect(resultado[0].diasTrabajados).toBe(1);
        expect(resultado[0].faltas).toBe(1);
        expect(resultado[0].horasNocturnas).toBe(0);
        expect(resultado[0].horasFeriado).toBe(0);
    });

    it('Caso 2 (Extremo - Nocturno): Detecta y contabiliza correctamente las horas que caen en la franja nocturna (22hs a 6hs)', () => {
        const asistenciasMock = [
            {
                funcionario_id: 'func-2',
                estado: 'presente',
                // De 20:00 a 02:00 -> 6 horas en total. 
                // Horas nocturnas: de 22 a 02 -> 4 horas nocturnas (0.25 por bloque de 15min)
                hora_entrada_registrada: '2026-03-03T20:00:00',
                hora_salida_registrada: '2026-03-04T02:00:00',
                fecha: '2026-03-03',
                funcionarios: { profiles: { nombre: 'Luna', apellido: 'Oscura' }, cedula: '456' }
            }
        ];

        const resultado = procesarNomina(asistenciasMock);
        expect(resultado).toHaveLength(1);
        expect(resultado[0].totalHoras).toBe(6);
        expect(resultado[0].horasNocturnas).toBe(4);
    });

    it('Caso 3 (Especial - Feriados): Agrega las horas trabajadas en una fecha catalogada como Feriado Nacional', () => {
        const asistenciasMock = [
            {
                funcionario_id: 'func-3',
                estado: 'presente',
                hora_entrada_registrada: '2026-05-01T08:00:00-03:00',
                hora_salida_registrada: '2026-05-01T12:00:00-03:00', // 4 horas
                fecha: '2026-05-01', // Feriado Día del Trabajador
                funcionarios: { profiles: { nombre: 'Maximo', apellido: 'Feriado' }, cedula: '789' }
            }
        ];

        const resultado = procesarNomina(asistenciasMock);
        expect(resultado).toHaveLength(1);
        expect(resultado[0].totalHoras).toBe(4);
        expect(resultado[0].horasFeriado).toBe(4); // 4 horas en día feriado
    });

    it('Caso 4 (Borde - Horarios Teóricos): Calcula correctamente leyendo "horarios" si falta horario registrado en vivo', () => {
        const asistenciasMock = [
            {
                funcionario_id: 'func-4',
                estado: 'tardanza', // Aplica como día trabajado
                fecha: '2026-03-10',
                horarios: {
                    hora_entrada: '14:00',
                    hora_salida: '22:30' // 8.5 horas totales. Nocturnas: media hora (22 a 22:30)
                },
                funcionarios: { profiles: { nombre: 'Ana', apellido: 'Lopez' }, cedula: '000' }
            }
        ];

        const resultado = procesarNomina(asistenciasMock);
        expect(resultado).toHaveLength(1);
        expect(resultado[0].totalHoras).toBe(8.5);
        expect(resultado[0].horasNocturnas).toBe(0.5); 
        expect(resultado[0].horasFeriado).toBe(0);
    });
});
