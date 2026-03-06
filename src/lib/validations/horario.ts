import * as z from 'zod';

export const horarioSchema = z.object({
    id: z.string().optional(),
    funcionario_id: z.string().min(1, 'El funcionario es requerido'),
    servicio_id: z.string().min(1, 'El servicio/locación es requerido'),
    dia_semana: z.number().min(0).max(6),
    hora_entrada: z.string().min(1, 'La hora de entrada es obligatoria'),
    hora_salida: z.string().min(1, 'La hora de salida es obligatoria'),
    vigente_desde: z.string().min(1, 'Fecha de inicio es obligatoria'),
    vigente_hasta: z.string().optional(),
});

export type HorarioFormData = z.infer<typeof horarioSchema>;
