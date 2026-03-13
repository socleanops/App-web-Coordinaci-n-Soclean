import { z } from 'zod';

export const facturaItemSchema = z.object({
    id: z.string().optional(),
    factura_id: z.string().optional(),
    servicio_id: z.string().optional(),
    descripcion: z.string().min(1, 'La descripción es obligatoria'),
    cantidad: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
    precio_unitario: z.coerce.number().min(0, 'El precio no puede ser negativo'),
});

export const facturaSchema = z.object({
    id: z.string().optional(),
    cliente_id: z.string().min(1, 'Debe seleccionar un cliente'),
    numero: z.string().min(1, 'El número de factura es obligatorio'),
    fecha_emision: z.string().min(1, 'La fecha de emisión es obligatoria'),
    fecha_vencimiento: z.string().optional().nullable(),
    periodo: z.string().optional(),
    estado: z.enum(['borrador', 'emitida', 'pagada', 'vencida', 'anulada']).default('borrador'),
    subtotal: z.coerce.number().min(0),
    impuesto: z.coerce.number().min(0),
    descuento: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
    items: z.array(facturaItemSchema).min(1, 'Debe agregar al menos un ítem a la factura'),
});

export type FacturaItemFormData = z.infer<typeof facturaItemSchema>;
export type FacturaFormData = z.infer<typeof facturaSchema>;
