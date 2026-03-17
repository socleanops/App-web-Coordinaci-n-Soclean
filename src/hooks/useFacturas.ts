import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Factura, FacturaItem } from '@/types';
import type { FacturaFormData } from '@/lib/validations/facturacion';

export function useFacturas() {
    const queryClient = useQueryClient();

    const getFacturas = useQuery({
        queryKey: ['facturas'],
        queryFn: async (): Promise<(Factura & { items: FacturaItem[] })[]> => {
            const { data, error } = await supabase
                .from('facturas')
                .select(`
                    *,
                    clientes(razon_social, rut, direccion, email),
                    items:factura_items(
                        id,
                        servicio_id,
                        descripcion,
                        cantidad,
                        precio_unitario,
                        total,
                        servicios(nombre)
                    )
                `)
                .order('fecha_emision', { ascending: false });

            if (error) throw new Error(error.message);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
            return data;
        },
    });

    const createFactura = useMutation({
        mutationFn: async (formData: FacturaFormData) => {
            const { items, ...facturaData } = formData;

            // Generate a unique number if not provided (fallback)
            const numero = facturaData.numero || `FAC-${Date.now()}`;

            // Create factura
            const { data: newFactura, error: facturaError } = await supabase
                .from('facturas')
                .insert([{
                    cliente_id: facturaData.cliente_id,
                    numero: numero,
                    fecha_emision: facturaData.fecha_emision,
                    fecha_vencimiento: facturaData.fecha_vencimiento || null,
                    periodo: facturaData.periodo || null,
                    estado: facturaData.estado,
                    subtotal: facturaData.subtotal,
                    impuesto: facturaData.impuesto,
                    descuento: facturaData.descuento,
                    total: facturaData.total
                }])
                .select()
                .single();

            if (facturaError) throw new Error(`Error factura: ${facturaError.message}`);

            // Insert items
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    factura_id: newFactura.id,
                    servicio_id: item.servicio_id || null,
                    descripcion: item.descripcion,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    total: item.cantidad * item.precio_unitario
                }));

                const { error: itemsError } = await supabase
                    .from('factura_items')
                    .insert(itemsToInsert);

                if (itemsError) throw new Error(`Error items: ${itemsError.message}`);
            }

            return newFactura;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
        },
    });

    const updateFacturaStatus = useMutation({
        mutationFn: async ({ id, estado }: { id: string, estado: Factura['estado'] }) => {
            const { data, error } = await supabase
                .from('facturas')
                .update({ estado, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
        }
    });

    return {
        getFacturas,
        createFactura,
        updateFacturaStatus
    };
}
