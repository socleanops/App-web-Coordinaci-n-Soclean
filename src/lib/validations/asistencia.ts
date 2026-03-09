import { z } from 'zod';

export const asistenciaSchema = z.object({
    id: z.string().optional(),
    horario_id: z.string().min(1, 'Seleccione un horario base'),
    funcionario_id: z.string().min(1, 'Seleccione un funcionario'),
    fecha: z.string().min(1, 'Seleccione una fecha'),
    hora_entrada_registrada: z.string().optional().nullable(),
    hora_salida_registrada: z.string().optional().nullable(),
    distancia_entrada_metros: z.number().optional().nullable(),
    distancia_salida_metros: z.number().optional().nullable(),
    estado: z.enum(['presente', 'ausente', 'tardanza', 'salida_anticipada', 'pendiente', 'justificado']).default('pendiente'),
    observaciones: z.string().optional(),
});

export type AsistenciaFormData = z.infer<typeof asistenciaSchema>;
