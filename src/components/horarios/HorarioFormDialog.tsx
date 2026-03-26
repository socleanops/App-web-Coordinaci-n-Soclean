import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';

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
import { SearchableSelect } from '@/components/ui/searchable-select';

import { useHorarios } from '@/hooks/useHorarios';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { useServicios } from '@/hooks/useServicios';
import { horarioSchema, type HorarioFormData } from '@/lib/validations/horario';
import type { Horario } from '@/types';

interface HorarioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    horarioToEdit?: Horario | null;
}

const DIAS_SEMANA = [
    { value: 0, label: 'Dom', fullLabel: 'Domingo' },
    { value: 1, label: 'Lun', fullLabel: 'Lunes' },
    { value: 2, label: 'Mar', fullLabel: 'Martes' },
    { value: 3, label: 'Mié', fullLabel: 'Miércoles' },
    { value: 4, label: 'Jue', fullLabel: 'Jueves' },
    { value: 5, label: 'Vie', fullLabel: 'Viernes' },
    { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

const PRESETS = [
    { label: 'Lun → Vie', days: [1, 2, 3, 4, 5] },
    { label: 'Dom → Vie', days: [0, 1, 2, 3, 4, 5] },
    { label: 'Dom → Sáb', days: [0, 1, 2, 3, 4, 5, 6] },
    { label: 'L-M-V', days: [1, 3, 5] },
    { label: 'M-J-S', days: [2, 4, 6] },
];

export function HorarioFormDialog({ open, onOpenChange, horarioToEdit }: HorarioFormDialogProps) {
    const { createHorario, updateHorario } = useHorarios();
    const { getFuncionarios } = useFuncionarios();
    const { getServicios } = useServicios();

    const isEditing = !!horarioToEdit;
    const [isBatchSaving, setIsBatchSaving] = useState(false);
    const isPending = createHorario.isPending || updateHorario.isPending || isBatchSaving;

    // Multi-day selection for batch creation mode
    const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Default: Monday

    const funcionarios = getFuncionarios.data?.filter(f => f.estado === 'activo') || [];
    const servicios = getServicios.data?.filter(s => s.estado === 'activo') || [];

    const funcionarioOptions = funcionarios.map(f => ({
        value: f.id,
        label: `${f.profiles?.nombre} ${f.profiles?.apellido} - ${f.cargo}`,
    }));

    const servicioOptions = servicios.map(s => ({
        value: s.id,
        label: `${s.clientes?.razon_social} - ${s.nombre}`,
    }));

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
        if (open) {
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
                setSelectedDays([horarioToEdit.dia_semana]);
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
                setSelectedDays([1]);
            }
        }
    }, [open, horarioToEdit, form]);

    const toggleDay = (day: number) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                // Don't allow deselecting the last day
                if (prev.length === 1) return prev;
                return prev.filter(d => d !== day);
            }
            return [...prev, day].sort((a, b) => a - b);
        });
    };

    const applyPreset = (days: number[]) => {
        setSelectedDays([...days]);
    };

    const onSubmit = async (data: HorarioFormData) => {
        try {
            if (isEditing && horarioToEdit) {
                await updateHorario.mutateAsync({ id: horarioToEdit.id, data });
                toast.success('Horario actualizado exitosamente');
            } else {
                // BATCH: create one schedule per selected day
                setIsBatchSaving(true);
                const daysToCreate = selectedDays;
                let created = 0;
                let errors = 0;

                for (const day of daysToCreate) {
                    try {
                        await createHorario.mutateAsync({ ...data, dia_semana: day });
                        created++;
                    } catch {
                        errors++;
                    }
                }

                if (errors > 0) {
                    toast.warning(`Se crearon ${created} horarios, pero ${errors} fallaron (posiblemente ya existían).`);
                } else if (created === 1) {
                    toast.success('Horario asignado exitosamente');
                } else {
                    toast.success(`✅ ${created} horarios asignados exitosamente en lote (${daysToCreate.map(d => DIAS_SEMANA[d].label).join(', ')})`);
                }
                setIsBatchSaving(false);
            }
            onOpenChange(false);
        } catch (error: any) {
            setIsBatchSaving(false);
            toast.error(error.message || 'Error al guardar el horario');
        }
    };

    const selectedDaysLabel = selectedDays.map(d => DIAS_SEMANA[d].label).join(', ');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Horario' : 'Asignar Nuevo Horario'}</DialogTitle>
                    {!isEditing && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Selecciona uno o varios días para crear horarios en lote.
                        </p>
                    )}
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="funcionario_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Funcionario</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={funcionarioOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Seleccionar Funcionario"
                                            searchPlaceholder="Buscar por nombre o cargo..."
                                        />
                                    </FormControl>
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
                                    <FormControl>
                                        <SearchableSelect
                                            options={servicioOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Seleccionar Servicio"
                                            searchPlaceholder="Buscar por cliente o servicio..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* DAY SELECTION: MULTI-SELECT for new, dropdown for edit */}
                        {isEditing ? (
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
                                                    <SelectItem key={d.value} value={d.value.toString()}>{d.fullLabel}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="space-y-3">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Días de la Semana
                                </label>

                                {/* Day toggle buttons */}
                                <div className="flex flex-wrap gap-1.5">
                                    {DIAS_SEMANA.map(d => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => toggleDay(d.value)}
                                            aria-pressed={selectedDays.includes(d.value)}
                                            aria-label={`Alternar ${d.label}`}
                                            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${selectedDays.includes(d.value)
                                                ? 'bg-coreops-primary text-white border-coreops-primary shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Quick presets */}
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={() => applyPreset(p.days)}
                                            aria-label={`Aplicar preajuste: ${p.label}`}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1 ${JSON.stringify(selectedDays) === JSON.stringify(p.days)
                                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700'
                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}
                                        >
                                            <Zap className="h-3 w-3" />
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {selectedDays.length > 1 && (
                                    <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-md border border-blue-200 dark:border-blue-800">
                                        ⚡ Se crearán <strong>{selectedDays.length} horarios en lote</strong> para: {selectedDaysLabel}
                                    </p>
                                )}
                            </div>
                        )}

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
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing
                                    ? 'Guardar Cambios'
                                    : selectedDays.length > 1
                                        ? `Crear ${selectedDays.length} Horarios`
                                        : 'Generar Turno'
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
