import { z } from 'zod';

export const funcionarioSchema = z.object({
    id: z.string().optional(),

    // Profile fields (for creating new user, or updating existing conceptually)
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Debe ser un correo electrónico válido').optional().or(z.literal('')),

    // Only for creation
    password: z.string().min(6, 'Debe tener al menos 6 caracteres').optional().or(z.literal('')),

    rol: z.enum(['superadmin', 'admin', 'supervisor', 'facturador', 'funcionario']),

    // Funcionario fields
    cedula: z.string().min(7, 'Cédula inválida'),
    cargo: z.string().min(2, 'Especifique el cargo'),
    departamento_id: z.string().uuid('Debe seleccionar un departamento'),
    fecha_ingreso: z.string().min(1, 'La fecha de ingreso es requerida'),
    direccion: z.string().min(5, 'Especifique la dirección física del funcionario'),
    tipo_contrato: z.string().min(1, 'El tipo de contrato es requerido'),
    estado: z.enum(['activo', 'inactivo', 'vacaciones', 'licencia']).default('activo'),
});

export type FuncionarioFormData = z.infer<typeof funcionarioSchema>;
