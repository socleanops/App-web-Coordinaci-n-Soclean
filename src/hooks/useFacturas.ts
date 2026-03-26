import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturaService } from '@/lib/services/facturaService';
import type { Factura, FacturaItem } from '@/types';
import type { FacturaFormData } from '@/lib/validations/facturacion';

export function useFacturas() {
    const queryClient = useQueryClient();

    const getFacturas = useQuery({
        queryKey: ['facturas'],
        queryFn: async (): Promise<(Factura & { items: FacturaItem[] })[]> => {
<<<<<<< HEAD
            return await facturaService.getFacturas();
=======
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
            return data as (Factura & { items: FacturaItem[] })[];
>>>>>>> origin/dev
        },
    });

    const createFactura = useMutation({
        mutationFn: async (formData: FacturaFormData) => {
            return await facturaService.createFactura(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
        },
    });

    const updateFacturaStatus = useMutation({
        mutationFn: async ({ id, estado }: { id: string, estado: Factura['estado'] }) => {
            return await facturaService.updateFacturaStatus(id, estado);
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
