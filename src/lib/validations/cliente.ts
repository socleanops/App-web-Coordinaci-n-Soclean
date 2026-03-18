import { z } from 'zod';

/**
 * Esquema Zod para validar los datos del formulario de Cliente.
 * Todos los campos opcionales usan .optional() sin combinarlos con .or(z.literal('')).
 * Se añaden mensajes de error descriptivos y se valida que el RUT tenga entre 8 y 12 caracteres.
 */
export const clienteSchema = z.object({
  id: z.string().uuid().optional(),
  razon_social: z.string().min(2, { message: 'La razón social o nombre debe tener al menos 2 caracteres' }),
  nombre_fantasia: z.string().optional(),
  rut: z.string()
    .min(8, { message: 'RUT o Cédula inválida (debe tener entre 8 y 12 números)' })
    .max(12, { message: 'RUT o Cédula inválida (debe tener entre 8 y 12 números)' }),
  direccion: z.string().min(5, { message: 'Especifique la dirección del cliente' }),
  telefono: z.string().optional(),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido' }).optional(),
  contacto_principal: z.string().optional(),
  frecuencia_visita: z.string().optional(),
  carga_horaria: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
