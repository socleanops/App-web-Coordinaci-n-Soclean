
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { useFacturas } from '@/hooks/useFacturas';
import { useClientes } from '@/hooks/useClientes';
import { facturaSchema, type FacturaFormData } from '@/lib/validations/facturacion';
import { FacturaBasicInfoFields } from './FacturaBasicInfoFields';
import { FacturaLineItems } from './FacturaLineItems';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FacturaFormDialog({ open, onOpenChange }: Props) {
    const { createFactura } = useFacturas();
    const { getClientes } = useClientes();
    const clientes = getClientes.data?.filter(c => c.estado === 'activo') || [];

    const isPending = createFactura.isPending;

    const form = useForm<FacturaFormData>({
        resolver: zodResolver(facturaSchema) as any,
        defaultValues: {
            cliente_id: '',
            numero: `FAC-${Date.now().toString().slice(-6)}`,
            fecha_emision: new Date().toISOString().split('T')[0],
            fecha_vencimiento: '',
            estado: 'emitida',
            subtotal: 0,
            impuesto: 0,
            descuento: 0,
            total: 0,
            items: [
                { descripcion: '', cantidad: 1, precio_unitario: 0 }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });




    const onSubmit = async (data: FacturaFormData) => {
        try {
            await createFactura.mutateAsync(data);
            toast.success('Factura generada exitosamente');

            // reset form for next time
            form.reset({
                cliente_id: '',
                numero: `FAC-${Date.now().toString().slice(-6)}`,
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                estado: 'emitida',
                subtotal: 0,
                impuesto: 22, // default IVA
                descuento: 0,
                total: 0,
                items: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }],
            });

            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la factura');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Añadir Cantidad de Horas a Cliente</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FacturaBasicInfoFields form={form} clientes={clientes} />

                        <FacturaLineItems form={form} fields={fields} append={append} remove={remove} />

                        {/* Eliminadas las cajas de totales financieros, solo requerimos registro de horas */}
                        <div className="hidden"></div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending || form.watch('items').length === 0}>
                                {isPending ? 'Procesando...' : 'Guardar Registro de Horas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
