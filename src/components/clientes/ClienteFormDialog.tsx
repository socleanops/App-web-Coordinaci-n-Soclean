import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import type { ClienteFormData } from '@/lib/validations/cliente';
import { clienteSchema } from '@/lib/validations/cliente';
import { useClientes } from '@/hooks/useClientes';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clienteToEdit?: any | null; // usually Cliente type
}

export function ClienteFormDialog({ open, onOpenChange, clienteToEdit }: Props) {
    const { createCliente, updateCliente } = useClientes();

    const form = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema) as any,
        defaultValues: {
            razon_social: '',
            nombre_fantasia: '',
            rut: '',
            direccion: '',
            telefono: '',
            email: '',
            contacto_principal: '',
            frecuencia_visita: '',
            carga_horaria: '',
            estado: 'activo',
        },
    });

    useEffect(() => {
        if (clienteToEdit) {
            form.reset({
                id: clienteToEdit.id,
                razon_social: clienteToEdit.razon_social || '',
                nombre_fantasia: clienteToEdit.nombre_fantasia || '',
                rut: clienteToEdit.rut || '',
                direccion: clienteToEdit.direccion || '',
                telefono: clienteToEdit.telefono || '',
                email: clienteToEdit.email || '',
                contacto_principal: clienteToEdit.contacto_principal || '',
                frecuencia_visita: clienteToEdit.frecuencia_visita || '',
                carga_horaria: clienteToEdit.carga_horaria || '',
                estado: clienteToEdit.estado as any || 'activo',
            });
        } else {
            form.reset({
                razon_social: '',
                nombre_fantasia: '',
                rut: '',
                direccion: '',
                telefono: '',
                email: '',
                contacto_principal: '',
                frecuencia_visita: '',
                carga_horaria: '',
                estado: 'activo',
            });
        }
    }, [clienteToEdit, form, open]);

    const onSubmit = async (data: ClienteFormData) => {
        const isEditing = !!clienteToEdit;
        const loadingId = toast.loading(isEditing ? 'Actualizando cliente...' : 'Registrando cliente...');

        try {
            if (isEditing) {
                await updateCliente.mutateAsync({ id: clienteToEdit!.id, data });
                toast.dismiss(loadingId);
                toast.success('Cliente actualizado correctamente');
            } else {
                await createCliente.mutateAsync(data);
                toast.dismiss(loadingId);
                toast.success('Cliente registrado exitosamente');
            }
            onOpenChange(false);
        } catch (error: unknown) {
            console.error("Form Submit Error:", error);
            toast.dismiss(loadingId);
            toast.error(`Error al revisar datos: ${(error as Error).message || 'No se pudo guardar la información'}`, { duration: 8000 });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{clienteToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente (Empresa o Persona)'}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Complete los datos del cliente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2 col-span-2">
                                <h3 className="font-semibold border-b pb-2">Información Fiscal o Personal</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="razon_social"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Razón Social / Nombre (Obligatorio)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Empresa SA o Juan López" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nombre_fantasia"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Nombre de Fantasía (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Tienda Centro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rut"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>RUT / Cédula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. 210000.. o 1234567" {...field} />
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
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 col-span-2 mt-4">
                                <h3 className="font-semibold border-b pb-2">Acuerdo de Servicio Operativo</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="frecuencia_visita"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Período de Asistencia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar período" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="diaria">Diaria</SelectItem>
                                                <SelectItem value="semanal">Semanal</SelectItem>
                                                <SelectItem value="quincenal">Quincenal</SelectItem>
                                                <SelectItem value="anual">Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="carga_horaria"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Carga Horaria / Franja</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. 00:00 a 08:00 hs" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 col-span-2 mt-4">
                                <h3 className="font-semibold border-b pb-2">Contacto y Ubicación</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="direccion"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Dirección Principal (Oficinas)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Av. Siempreviva 742" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contacto_principal"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Persona de Contacto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. María López" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 sm:col-span-1">
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. 091234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Correo Electrónico (Para facturación/comunicación)</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contacto@empresa.com" {...field} />
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
                                {clienteToEdit ? 'Actualizar Cliente' : 'Guardar Cliente'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
