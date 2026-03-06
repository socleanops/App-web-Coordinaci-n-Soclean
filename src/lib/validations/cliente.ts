import { z } from 'zod';

export const clienteSchema = z.object({
    id: z.string().optional(),
    razon_social: z.string().min(2, 'La razón social o nombre debe tener al menos 2 caracteres'),
    nombre_fantasia: z.string().optional().or(z.literal('')),
    rut: z.string().min(8, 'RUT o Cédula inválida (debe tener entre 8 y 12 números)'),
    direccion: z.string().min(5, 'Especifique la dirección del cliente'),
    telefono: z.string().optional().or(z.literal('')),
    email: z.string().email('Debe ser un correo electrónico válido').optional().or(z.literal('')),
    contacto_principal: z.string().optional().or(z.literal('')),
    frecuencia_visita: z.string().optional().or(z.literal('')),
    carga_horaria: z.string().optional().or(z.literal('')),
    estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
