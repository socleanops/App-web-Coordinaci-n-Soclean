import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ServicioFormData } from '@/lib/validations/servicio';
import { servicioSchema } from '@/lib/validations/servicio';
import { useServicios } from '@/hooks/useServicios';
import { useClientes } from '@/hooks/useClientes';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
    servicioToEdit? | null; // usually Servicio type
}

export function ServicioFormDialog({ open, onOpenChange, servicioToEdit }: Props) {
    const { createServicio, updateServicio } = useServicios();
    const { getClientes } = useClientes();
    const { data: clientes = [] } = getClientes;

    const form = useForm<ServicioFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        resolver: zodResolver(servicioSchema),
        defaultValues: {
            nombre: '',
            cliente_id: '',
            descripcion: '',
            direccion: '',
            estado: 'activo',
        },
    });

    useEffect(() => {
        if (servicioToEdit) {
            form.reset({
                id: servicioToEdit.id,
                nombre: servicioToEdit.nombre || '',
                cliente_id: servicioToEdit.cliente_id || '',
                descripcion: servicioToEdit.descripcion || '',
                direccion: servicioToEdit.direccion || '',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
                estado: servicioToEdit.estado || 'activo',
            });
        } else {
            form.reset({
                nombre: '',
                cliente_id: '',
                descripcion: '',
                direccion: '',
                estado: 'activo',
            });
        }
    }, [servicioToEdit, form, open]);

    const onSubmit = async (data: ServicioFormData) => {
        const isEditing = !!servicioToEdit;
        const loadingId = toast.loading(isEditing ? 'Actualizando servicio...' : 'Registrando nuevo servicio...');

        try {
            if (isEditing) {
                await updateServicio.mutateAsync({ id: servicioToEdit!.id, data });
                toast.dismiss(loadingId);
                toast.success('Servicio actualizado correctamente');
            } else {
                await createServicio.mutateAsync(data);
                toast.dismiss(loadingId);
                toast.success('Servicio registrado exitosamente en el cliente');
            }
            onOpenChange(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        } catch (error) {
            console.error("Form Submit Error:", error);
            toast.dismiss(loadingId);
            toast.error(`Error al revisar datos: ${error.message || 'No se pudo guardar la información'}`, { duration: 8000 });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{servicioToEdit ? 'Editar Servicio / Contrato' : 'Añadir Nuevo Servicio a Cliente'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2 col-span-2">
                                <h3 className="font-semibold border-b pb-2">Datos Principales</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="cliente_id"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Cliente Asignado (Obligatorio)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar el cliente a quien pertenece" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clientes.map(cli => (
                                                    <SelectItem key={cli.id} value={cli.id}>
                                                        {cli.razon_social} {cli.nombre_fantasia ? `(${cli.nombre_fantasia})` : ''} - RUT: {cli.rut}
                                                    </SelectItem>
                                                ))}
                                                {clientes.length === 0 && (
                                                    <SelectItem value="none" disabled>No se encontraron clientes activos</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Nombre del Servicio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Limpieza Oficina Carrasco" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Estado Operativo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo / Pausado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="direccion"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Dirección Física del Servicio (Visible para funcionarios)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Arocena 1234, Local 02" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Instrucciones o Detalles Extra (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Ej. Llaves en portería, llevar maquinaria especial..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="flex justify-end pt-6 border-t mt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {servicioToEdit ? 'Guardar Cambios' : 'Añadir Servicio a Cliente'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
