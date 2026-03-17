import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useIncidencias } from '@/hooks/useIncidencias';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    funcionario_id: z.string().min(1, 'El funcionario es requerido'),
    tipo: z.enum(['Ausencia injustificada', 'Tardanza', 'Licencia médica', 'Vacaciones', 'Reemplazo', 'Otro']),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
    fecha_fin: z.string().optional(),
    descripcion: z.string().optional(),
    estado: z.enum(['Pendiente', 'En proceso', 'Resuelta', 'Cerrada']),
    reemplazo_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IncidenciaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function IncidenciaFormDialog({ open, onOpenChange }: IncidenciaFormDialogProps) {
    const { createIncidencia } = useIncidencias();
    const { getFuncionarios } = useFuncionarios();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            funcionario_id: '',
            tipo: 'Ausencia injustificada',
            fecha_inicio: new Date().toISOString().split('T')[0],
            estado: 'Pendiente',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const formData = values as unknown as import('@/hooks/useIncidencias').IncidenciaFormData;
            await createIncidencia.mutateAsync(formData);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Error creating incidencia:', error);
            alert('Error al crear la incidencia. Verifique los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const funcionarios = getFuncionarios.data || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Incidencia</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="funcionario_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Funcionario Afectado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un funcionario" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {funcionarios.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.profiles?.nombre} {f.profiles?.apellido} - {f.cedula}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Incidencia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Ausencia injustificada">Ausencia</SelectItem>
                                                <SelectItem value="Tardanza">Tardanza</SelectItem>
                                                <SelectItem value="Licencia médica">Licencia Médica</SelectItem>
                                                <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                                                <SelectItem value="Reemplazo">Reemplazo General</SelectItem>
                                                <SelectItem value="Otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                <SelectItem value="En proceso">En proceso</SelectItem>
                                                <SelectItem value="Resuelta">Resuelta</SelectItem>
                                                <SelectItem value="Cerrada">Cerrada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fecha_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fecha_fin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Fin (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reemplazo_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asignar Reemplazo (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar suplente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {funcionarios.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.profiles?.nombre} {f.profiles?.apellido} - {f.cedula}
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
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción / Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalles de la incidencia..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Incidencia'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
