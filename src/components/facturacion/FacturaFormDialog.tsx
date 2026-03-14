
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useFacturas } from '@/hooks/useFacturas';
import { useClientes } from '@/hooks/useClientes';
import { facturaSchema, type FacturaFormData } from '@/lib/validations/facturacion';

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
            periodo: '',
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

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const watchCliente = form.watch("cliente_id");
    const watchDesde = form.watch("fecha_emision");
    const watchHasta = form.watch("fecha_vencimiento");

    const [isAutoGenerating, setIsAutoGenerating] = useState(false);

    const handleAutoGenerate = async () => {
        if (!watchCliente || !watchDesde || !watchHasta) {
            toast.error('Debe seleccionar cliente, y rango de fechas (Desde y Hasta) para calcular.');
            return;
        }

        setIsAutoGenerating(true);
        try {
            // Buscamos todas las asistencias en el rango para el cliente
            const { data, error } = await supabase
                .from('asistencia')
                .select(`
                    id,
                    estado,
                    horarios!inner (
                        hora_entrada,
                        hora_salida,
                        servicios!inner (
                            nombre,
                            cliente_id
                        )
                    )
                `)
                .eq('horarios.servicios.cliente_id', watchCliente)
                .gte('fecha', watchDesde)
                .lte('fecha', watchHasta);

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.info('No se encontraron registros de turnos en ese período para este cliente.');
                setIsAutoGenerating(false);
                return;
            }

            // Agrupamos por servicio y sumamos las horas de los que estuvieron "presente", "justificado" o "tardanza"
            const horasPorServicio: Record<string, number> = {};

            data.forEach((a: any) => {
                const est = a.estado;
                // Calculamos solo de los que existieron realmente o están justificados
                if (est === 'presente' || est === 'tardanza' || est === 'salida_anticipada' || est === 'justificado') {
                    const servicioNombre = a.horarios.servicios.nombre;
                    const hEntrada = a.horarios.hora_entrada;
                    const hSalida = a.horarios.hora_salida;
                    
                    if (hEntrada && hSalida) {
                        const [eh, em] = hEntrada.split(':').map(Number);
                        const [sh, sm] = hSalida.split(':').map(Number);
                        
                        let totalHoras = (sh + sm / 60) - (eh + em / 60);
                        if (totalHoras < 0) totalHoras += 24; // Turnos que cruzan la medianoche
                        
                        horasPorServicio[servicioNombre] = (horasPorServicio[servicioNombre] || 0) + totalHoras;
                    }
                }
            });

            const newItems = Object.entries(horasPorServicio).map(([nombre, horas]) => ({
                descripcion: `Servicio: ${nombre} (${watchDesde} al ${watchHasta})`,
                cantidad: parseFloat(horas.toFixed(2)),
                precio_unitario: 0
            }));

            if (newItems.length > 0) {
                replace(newItems);
                toast.success('Horas calculadas y añadidas automáticamente');
            } else {
                toast.info('Hay registros en fecha, pero ninguno con estado "Presente".');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error al calcular horas automáticas');
        } finally {
            setIsAutoGenerating(false);
        }
    };




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
                periodo: '',
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cliente_id"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Cliente a Facturar</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar Cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clientes.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.razon_social} {c.rut ? `(RUT: ${c.rut})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="numero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referencia Interna (Nro de Registro)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. A-0001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="periodo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período a Facturar (Mensual o Libre)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Marzo 2026, 1ra Quincena, etc." {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado Inicial</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="borrador">Borrador</SelectItem>
                                                <SelectItem value="emitida">Emitida (Pendiente de Pago)</SelectItem>
                                                <SelectItem value="pagada">Pagada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fecha_emision"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Inicio del Período (Desde)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fecha_vencimiento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Fin del Período (Hasta)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Line Items */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <h3 className="font-semibold text-lg">Conceptos o Ítems</h3>
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="sm" 
                                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
                                    onClick={handleAutoGenerate}
                                    disabled={isAutoGenerating || !watchCliente || !watchDesde || !watchHasta}
                                >
                                    {isAutoGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                    Auto-Completar desde Asistencia
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-end border-b border-slate-200 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                                        <div className="flex-grow w-full">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.descripcion`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Detalle del Servicio Realizado</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ej. Limpieza post-obra en planta baja..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-full sm:w-24">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.cantidad`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Horas Realizadas</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="1" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="hidden">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.precio_unitario`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Precio Unit. ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 shrink-0 mb-0.5"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => append({ descripcion: '', cantidad: 1, precio_unitario: 0 })}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" /> Agregar Concepto
                            </Button>
                        </div>

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
