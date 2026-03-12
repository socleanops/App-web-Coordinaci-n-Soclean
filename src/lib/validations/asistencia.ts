import { z } from 'zod';

export const asistenciaSchema = z.object({
    id: z.string().optional(),
    funcionario_id: z.string().min(1, 'Selecciona un funcionario'),
    horario_id: z.string().optional(),
    fecha: z.string().min(1, 'La fecha es obligatoria'),
    hora_entrada_registrada: z.string().optional().nullable(),
    hora_salida_registrada: z.string().optional().nullable(),
    distancia_entrada_metros: z.number().optional().nullable(),
    distancia_salida_metros: z.number().optional().nullable(),
    estado: z.enum(['presente', 'ausente', 'tardanza', 'salida_anticipada', 'pendiente', 'justificado', 'no_citado']).default('pendiente'),
    observaciones: z.string().optional(),
});

export type AsistenciaFormData = z.infer<typeof asistenciaSchema>;
