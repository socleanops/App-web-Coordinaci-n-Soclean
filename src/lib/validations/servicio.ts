import { z } from 'zod';

export const servicioSchema = z.object({
    id: z.string().optional(),
    cliente_id: z.string().uuid('Debe seleccionar a un cliente para este servicio'),
    nombre: z.string().min(2, 'Especifique un nombre para el servicio (ej. Sucursal Norte, Edificio Principal)'),
    descripcion: z.string().optional().or(z.literal('')),
    direccion: z.string().min(5, 'Escriba la dirección física donde se realizará el servicio para logística'),
    estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export type ServicioFormData = z.infer<typeof servicioSchema>;
