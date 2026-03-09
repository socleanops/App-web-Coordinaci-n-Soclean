import { describe, it, expect } from 'vitest';
import { clienteSchema } from '@/lib/validations/cliente';

describe('clienteSchema', () => {
    it('should validate a valid full cliente object', () => {
        const validCliente = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            razon_social: 'Acme Corp',
            nombre_fantasia: 'Acme',
            rut: '1234567890',
            direccion: '123 Main St, Anytown',
            telefono: '555-1234',
            email: 'test@acme.com',
            contacto_principal: 'John Doe',
            frecuencia_visita: 'Semanal',
            carga_horaria: '40',
            estado: 'activo' as const,
        };

        const result = clienteSchema.safeParse(validCliente);
        expect(result.success).toBe(true);
    });

    it('should validate a valid minimal cliente object (only required fields + defaults + optional empty/missing)', () => {
        const minimalCliente = {
            razon_social: 'Acme Corp',
            rut: '123456789',
            direccion: '123 Main St',
        };

        const result = clienteSchema.safeParse(minimalCliente);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.estado).toBe('activo'); // checking default value
            expect(result.data.razon_social).toBe('Acme Corp');
            expect(result.data.rut).toBe('123456789');
            expect(result.data.direccion).toBe('123 Main St');
        }
    });

    it('should fail if razon_social is less than 2 characters', () => {
        const invalidCliente = {
            razon_social: 'A',
            rut: '123456789',
            direccion: '123 Main St',
        };

        const result = clienteSchema.safeParse(invalidCliente);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('La razón social o nombre debe tener al menos 2 caracteres');
        }
    });

    it('should fail if rut is less than 8 characters', () => {
        const invalidCliente = {
            razon_social: 'Acme Corp',
            rut: '1234567',
            direccion: '123 Main St',
        };

        const result = clienteSchema.safeParse(invalidCliente);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('RUT o Cédula inválida (debe tener entre 8 y 12 números)');
        }
    });

    it('should fail if direccion is less than 5 characters', () => {
        const invalidCliente = {
            razon_social: 'Acme Corp',
            rut: '123456789',
            direccion: '123',
        };

        const result = clienteSchema.safeParse(invalidCliente);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Especifique la dirección del cliente');
        }
    });

    it('should fail if email is invalid format (and not empty)', () => {
        const invalidCliente = {
            razon_social: 'Acme Corp',
            rut: '123456789',
            direccion: '123 Main St',
            email: 'not-an-email',
        };

        const result = clienteSchema.safeParse(invalidCliente);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Debe ser un correo electrónico válido');
        }
    });

    it('should pass if optional string fields are passed as empty literal strings', () => {
        const emptyOptionalsCliente = {
            razon_social: 'Acme Corp',
            rut: '123456789',
            direccion: '123 Main St',
            nombre_fantasia: '',
            telefono: '',
            email: '',
            contacto_principal: '',
            frecuencia_visita: '',
            carga_horaria: '',
        };

        const result = clienteSchema.safeParse(emptyOptionalsCliente);
        expect(result.success).toBe(true);
    });

    it('should fail if estado is not "activo" or "inactivo"', () => {
        const invalidCliente = {
            razon_social: 'Acme Corp',
            rut: '123456789',
            direccion: '123 Main St',
            estado: 'unknown',
        };

        const result = clienteSchema.safeParse(invalidCliente);
        expect(result.success).toBe(false);
    });
});
