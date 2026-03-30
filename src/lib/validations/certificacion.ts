import { z } from 'zod';

export const certificacionSchema = z.object({
    id: z.string().optional(),
    funcionario_id: z.string().uuid('Debe seleccionar un funcionario'),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
    fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
    motivo: z.string().optional(),
}).refine(data => {
    return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
}, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['fecha_fin'],
});

export type CertificacionFormData = z.infer<typeof certificacionSchema>;
