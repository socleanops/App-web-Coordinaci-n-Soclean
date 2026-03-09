import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { DialogFooter } from '@/components/ui/dialog';

import { useHorarios } from '@/hooks/useHorarios';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { useServicios } from '@/hooks/useServicios';
import { horarioSchema, type HorarioFormData } from '@/lib/validations/horario';
import type { Horario } from '@/types';

interface HorarioFormProps {
    horarioToEdit?: Horario | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const DIAS_SEMANA = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
];

export function HorarioForm({ horarioToEdit, onSuccess, onCancel }: HorarioFormProps) {
    const { createHorario, updateHorario } = useHorarios();
    const { getFuncionarios } = useFuncionarios();
    const { getServicios } = useServicios();

    const isEditing = !!horarioToEdit;
    const isPending = createHorario.isPending || updateHorario.isPending;

    const funcionarios = getFuncionarios.data?.filter(f => f.estado === 'activo') || [];
    const servicios = getServicios.data?.filter(s => s.estado === 'activo') || [];

    const form = useForm<HorarioFormData>({
        resolver: zodResolver(horarioSchema),
        defaultValues: {
            funcionario_id: '',
            servicio_id: '',
            dia_semana: 1,
            hora_entrada: '08:00',
            hora_salida: '17:00',
            vigente_desde: new Date().toISOString().split('T')[0],
            vigente_hasta: '',
        },
    });

    useEffect(() => {
        if (horarioToEdit) {
            form.reset({
                id: horarioToEdit.id,
                funcionario_id: horarioToEdit.funcionario_id,
                servicio_id: horarioToEdit.servicio_id,
                dia_semana: horarioToEdit.dia_semana,
                hora_entrada: horarioToEdit.hora_entrada,
                hora_salida: horarioToEdit.hora_salida,
                vigente_desde: horarioToEdit.vigente_desde,
                vigente_hasta: horarioToEdit.vigente_hasta || '',
            });
        } else {
            form.reset({
                funcionario_id: '',
                servicio_id: '',
                dia_semana: 1,
                hora_entrada: '08:00',
                hora_salida: '17:00',
                vigente_desde: new Date().toISOString().split('T')[0],
                vigente_hasta: '',
            });
        }
    }, [horarioToEdit, form]);

    const onSubmit = async (data: HorarioFormData) => {
        try {
            if (isEditing && horarioToEdit) {
                await updateHorario.mutateAsync({ id: horarioToEdit.id, data });
                toast.success('Horario actualizado exitosamente');
            } else {
                await createHorario.mutateAsync(data);
                toast.success('Horario asignado exitosamente');
            }
            onSuccess();
        } catch (error) {
            toast.error((error as Error).message || 'Error al guardar el horario');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="funcionario_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Funcionario</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Funcionario" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {funcionarios.length === 0 && <SelectItem value="none" disabled>No hay funcionarios activos</SelectItem>}
                                    {funcionarios.map(f => (
                                        <SelectItem key={f.id} value={f.id}>
                                            {f.profiles?.nombre} {f.profiles?.apellido} - {f.cargo}
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
                    name="servicio_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Servicio / Locación de Trabajo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Servicio" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {servicios.length === 0 && <SelectItem value="none" disabled>No hay servicios activos</SelectItem>}
                                    {servicios.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.clientes?.razon_social} - {s.nombre}
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
                    name="dia_semana"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Día de la Semana</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString() || undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un día" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {DIAS_SEMANA.map(d => (
                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
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
                        name="hora_entrada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora Entrada</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hora_salida"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora Salida</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vigente_desde"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vigente Desde</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="vigente_hasta"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vigente Hasta (Opcional)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Guardar Cambios' : 'Generar Turno'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
