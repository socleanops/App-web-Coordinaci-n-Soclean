import { describe, it, expect } from 'vitest';
import { asistenciaSchema } from '../../../lib/validations/asistencia';

describe('asistenciaSchema', () => {
    it('debería validar datos correctos (happy path)', () => {
        const validData = {
            funcionario_id: '123',
            horario_id: '456',
            fecha: '2023-10-27',
            hora_entrada_registrada: '08:00',
            hora_salida_registrada: '17:00',
            distancia_entrada_metros: 10.5,
            distancia_salida_metros: 15.2,
            estado: 'presente',
            observaciones: 'Llegó a tiempo'
        };

        const result = asistenciaSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('debería validar correctamente con solo campos requeridos y asignar valores por defecto', () => {
        const requiredData = {
            horario_id: '456',
            funcionario_id: '123',
            fecha: '2023-10-27',
        };

        const result = asistenciaSchema.safeParse(requiredData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.horario_id).toBe('456');
            expect(result.data.funcionario_id).toBe('123');
            expect(result.data.fecha).toBe('2023-10-27');
            expect(result.data.estado).toBe('pendiente'); // valor por defecto
        }
    });

    it('debería fallar si faltan campos requeridos (horario_id, funcionario_id, fecha)', () => {
        const invalidData = {};

        const result = asistenciaSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.format();
            expect(errors.horario_id?._errors).toBeDefined();
            expect(errors.funcionario_id?._errors).toBeDefined();
            expect(errors.fecha?._errors).toBeDefined();
        }
    });

    it('debería fallar si los campos requeridos están vacíos', () => {
        const invalidData = {
            horario_id: '',
            funcionario_id: '',
            fecha: '',
        };

        const result = asistenciaSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.format();
            expect(errors.horario_id?._errors).toContain('Seleccione un horario base');
            expect(errors.funcionario_id?._errors).toContain('Seleccione un funcionario');
            expect(errors.fecha?._errors).toContain('Seleccione una fecha');
        }
    });

    it('debería fallar si el estado no es uno de los valores permitidos', () => {
        const invalidData = {
            horario_id: '456',
            funcionario_id: '123',
            fecha: '2023-10-27',
            estado: 'estado_invalido',
        };

        const result = asistenciaSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.format();
            expect(errors.estado?._errors).toBeDefined();
        }
    });

    it('debería permitir campos opcionales como null o undefined', () => {
        const validData = {
            horario_id: '456',
            funcionario_id: '123',
            fecha: '2023-10-27',
            hora_entrada_registrada: null,
            hora_salida_registrada: undefined,
            distancia_entrada_metros: null,
            distancia_salida_metros: undefined,
        };

        const result = asistenciaSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});
