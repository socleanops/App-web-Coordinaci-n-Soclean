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
                    id,
                    cliente_id,
                    numero,
                    fecha_emision,
                    fecha_vencimiento,
                    periodo,
                    estado,
                    subtotal,
                    impuesto,
                    descuento,
                    total,
                    created_at,
                    updated_at,
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
            return (data as unknown as any[]).map(f => ({
                ...f,
                clientes: Array.isArray(f.clientes) ? f.clientes[0] : f.clientes,
                items: (f.items || []).map((item: any) => ({
                    ...item,
                    servicios: Array.isArray(item.servicios) ? item.servicios[0] : item.servicios
                }))
            })) as (Factura & { items: FacturaItem[] })[];
        },
    });

    const createFactura = useMutation({
        mutationFn: async (formData: FacturaFormData) => {
            const { items, ...facturaData } = formData;

            // Generate a unique number if not provided (fallback)
            const numero = facturaData.numero || `FAC-${Date.now()}`;

            const facturaPayload = {
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
            };

            const itemsPayload = items && items.length > 0 ? items.map(item => ({
                servicio_id: item.servicio_id || null,
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                total: item.cantidad * item.precio_unitario
            })) : [];

            // Ejecuta la transacción atómica
            const { data: newFactura, error } = await supabase.rpc('crear_factura_con_items', {
                factura_data: facturaPayload,
                items_data: itemsPayload
            });

            if (error) throw new Error(`Error transaccional al crear factura: ${error.message}`);

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
