import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Search, AlertCircle, RefreshCw, Filter, ChevronLeft, ChevronRight, CalendarDays, CalendarPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAsistencia } from '@/hooks/useAsistencia';
import type { Asistencia } from '@/types';
import { toast } from 'sonner';

const dayMonthFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'short' });
const defaultDateFormatter = new Intl.DateTimeFormat('es-UY');
const dayLongMonthFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long' });

const ESTADOS_MAP: Record<string, { label: string, color: string }> = {
    'presente': { label: 'Presente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    'ausente': { label: 'Ausente', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    'tardanza': { label: 'Tardanza', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
    'salida_anticipada': { label: 'Salida Anticipada', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
    'pendiente': { label: 'Pendiente', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    'justificado': { label: 'Falta Justificada', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    'no_citado': { label: 'No Citado (Retén)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
    'certificado': { label: 'Certificado Médico', color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800' },
};

const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const longDateFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long' });

// Get Monday of the week containing the given date
function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
}

function formatDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

// ⚡ Bolt: Cache Intl formatters outside the render cycle
// Recreating Intl.DateTimeFormat objects during map loops or renders is expensive.
// Instantiating them once here avoids performance bottlenecks in the UI.
const shortDateFormatter = new Intl.DateTimeFormat('es-UY', { weekday: 'short', day: 'numeric', month: 'short' });
const weekLabelStartFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'short' });
const weekLabelEndFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'short', year: 'numeric' });

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return shortDateFormatter.format(d);
}

const timeValFormatter = new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });
function formatTimeVal(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        // input type="time" requires strictly "HH:mm" in 24h format
        return timeValFormatter.format(d);
    } catch {
        return '';
    }
}

export default function Attendance() {
    const today = new Date();
    const [weekStart, setWeekStart] = useState<Date>(getMonday(today));
    const [searchTerm, setSearchTerm] = useState('');
    const [hideResolved, setHideResolved] = useState(false);
    const [viewMode, setViewMode] = useState<'semana' | 'dia'>('semana');
    const [singleDate, setSingleDate] = useState<string>(formatDateStr(today));

    // Calculate week range
    const weekEnd = useMemo(() => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6); // Monday to Sunday
        return end;
    }, [weekStart]);

    const fechaDesde = viewMode === 'semana' ? formatDateStr(weekStart) : singleDate;
    const fechaHasta = viewMode === 'semana' ? formatDateStr(weekEnd) : singleDate;

    const { getAsistencias, updateAsistencia, generarPlanillaDia, generarPlanillaSemana } = useAsistencia(fechaDesde, fechaHasta);
    const { data: asistencias = [], isLoading, refetch } = getAsistencias;

    const navigateWeek = (direction: number) => {
        const newStart = new Date(weekStart);
        newStart.setDate(newStart.getDate() + (direction * 7));
        setWeekStart(newStart);
    };

    const goToCurrentWeek = () => {
        setWeekStart(getMonday(today));
    };

    const handleGenerarPlanillaSemana = async () => {
        try {
            const result = await generarPlanillaSemana.mutateAsync({
                desde: formatDateStr(weekStart),
                hasta: formatDateStr(weekEnd),
            });
            if (result.count > 0) {
                toast.success(`Planilla semanal generada: se agregaron ${result.count} registros.`);
            } else {
                toast.info('No se encontraron horarios nuevos para generar esta semana, o los registros ya existían.');
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || 'Error al generar la planilla semanal');
        }
    };

    const handleGenerarPlanillaDia = async () => {
        try {
            const result = await generarPlanillaDia.mutateAsync(singleDate);
            if (result.count > 0) {
                toast.success(`Planilla generada: se agregaron ${result.count} registros.`);
            } else {
                toast.info('No se encontraron horarios nuevos para este día.');
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || 'Error al generar la planilla');
        }
    };

    const handleActualizarEstado = async (a: Asistencia, nuevoEstado: string) => {
        try {
            const dataToUpdate: Partial<Asistencia> = { estado: nuevoEstado as Asistencia['estado'] };
            
            // Auto-rellenar hora real si se marca presente y están en blanco
            if (nuevoEstado === 'presente' && a.horarios) {
                if (!a.hora_entrada_registrada && a.horarios.hora_entrada) {
                    const timeStr = a.horarios.hora_entrada.substring(0, 5);
                    dataToUpdate.hora_entrada_registrada = new Date(`${a.fecha}T${timeStr}:00`).toISOString();
                }
                if (!a.hora_salida_registrada && a.horarios.hora_salida) {
                    const timeStr = a.horarios.hora_salida.substring(0, 5);
                    dataToUpdate.hora_salida_registrada = new Date(`${a.fecha}T${timeStr}:00`).toISOString();
                }
            }

            await updateAsistencia.mutateAsync({ id: a.id, data: dataToUpdate });
            toast.success(`Estado actualizado a ${ESTADOS_MAP[nuevoEstado].label}`);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || 'No se pudo actualizar el estado de asistencia');
        }
    };

    const handleGuardarHora = async (a: Asistencia, field: 'hora_entrada_registrada' | 'hora_salida_registrada', timeValue: string) => {
        try {
            let finalValue = null;
            if (timeValue) {
                // timeValue is "HH:mm" - Combine with a.fecha
                finalValue = new Date(`${a.fecha}T${timeValue}:00`).toISOString();
            }
            await updateAsistencia.mutateAsync({ id: a.id, data: { [field]: finalValue } as Partial<Asistencia> });
            toast.success(field === 'hora_entrada_registrada' ? 'Entrada real guardada' : 'Salida real guardada');
        } catch {
            toast.error('Error al guardar hora real');
        }
    };

    // Performance optimization: Memoize filtered array to prevent O(N) recalculations on every render.
    // We also hoist the searchTerm lowercasing outside the loop so it only runs once per memoization.
    const filteredAsistencias = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return asistencias.filter((a: Asistencia) => {
            const func = (a.funcionarios?.profiles?.nombre + ' ' + a.funcionarios?.profiles?.apellido).toLowerCase();
            const matchesSearch = func.includes(search);

            if (hideResolved) {
                return matchesSearch && ['pendiente', 'ausente', 'tardanza', 'salida_anticipada'].includes(a.estado);
            }
            return matchesSearch;
        });
    }, [asistencias, searchTerm, hideResolved]);

    // Group records by date for the weekly view
    const groupedByDate = useMemo(() => {
        const groups: Record<string, Asistencia[]> = {};
        filteredAsistencias.forEach((a: Asistencia) => {
            if (!groups[a.fecha]) groups[a.fecha] = [];
            groups[a.fecha].push(a);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredAsistencias]);

    const pendingCount = useMemo(() => {
        return asistencias.filter((a: Asistencia) => ['pendiente', 'ausente', 'tardanza', 'salida_anticipada'].includes(a.estado)).length;
    }, [asistencias]);

    const weekLabel = `${weekLabelStartFormatter.format(weekStart)} — ${weekLabelEndFormatter.format(weekEnd)}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Clock className="h-8 w-8" />
                        Chequeo de Planillas de Asistencia
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Verifica y confirma los horarios realizados cotejando las planillas físicas firmadas por los clientes.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center flex-wrap">
                    <Button
                        variant={hideResolved ? "default" : "secondary"}
                        onClick={() => setHideResolved(!hideResolved)}
                        className="h-10"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {hideResolved ? `Pendientes (${pendingCount})` : 'Viendo Todos'}
                    </Button>
                    {/* View mode toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        <Button
                            variant={viewMode === 'semana' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('semana')}
                            className={viewMode === 'semana' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}
                        >
                            <CalendarDays className="h-4 w-4 mr-1" /> Semana
                        </Button>
                        <Button
                            variant={viewMode === 'dia' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('dia')}
                            className={viewMode === 'dia' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}
                        >
                            <Clock className="h-4 w-4 mr-1" /> Día
                        </Button>
                    </div>
                </div>
            </div>

            {/* Period selector */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardContent className="py-4">
                    {viewMode === 'semana' ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} className="h-9 w-9" aria-label="Semana anterior">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-center min-w-[220px]">
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">📅 Semana</div>
                                    <div className="text-sm text-muted-foreground capitalize">{weekLabel}</div>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} className="h-9 w-9" aria-label="Siguiente semana">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="text-xs text-coreops-primary">
                                    Semana Actual
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleGenerarPlanillaSemana} disabled={generarPlanillaSemana.isPending} className="bg-coreops-primary hover:bg-coreops-secondary">
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    {generarPlanillaSemana.isPending ? 'Generando...' : 'Generar Planilla Semanal'}
                                </Button>
                                <Button onClick={() => { refetch(); toast.info("Actualizando..."); }} variant="outline" size="icon" className="h-10 w-10" aria-label="Actualizar datos">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-coreops-primary" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha:</span>
                                <Input
                                    type="date"
                                    value={singleDate}
                                    onChange={(e) => setSingleDate(e.target.value)}
                                    className="w-auto h-9 border-slate-300"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleGenerarPlanillaDia} disabled={generarPlanillaDia.isPending}>
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    {generarPlanillaDia.isPending ? 'Generando...' : 'Generar Planilla del Día'}
                                </Button>
                                <Button onClick={() => { refetch(); toast.info("Actualizando..."); }} variant="outline" size="icon" className="h-10 w-10" aria-label="Actualizar datos">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Data table */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">
                            {viewMode === 'semana'
                                ? `Registros de la Semana (${filteredAsistencias.length} entradas)`
                                : `Registros del Día: ${defaultDateFormatter.format(new Date(singleDate + 'T12:00:00'))}`
                            }
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar empleado..."
                                className="pl-9 bg-background/50 border-slate-200 dark:border-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-background/50 overflow-x-auto overflow-y-hidden">
                        <Table className="min-w-[1100px]">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    {viewMode === 'semana' && <TableHead className="w-[100px]">Fecha</TableHead>}
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Cliente / Servicio</TableHead>
                                    <TableHead>H. Coordinado</TableHead>
                                    <TableHead>Hora Real</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={viewMode === 'semana' ? 7 : 6} className="text-center h-24 text-muted-foreground">
                                            Buscando registros del período...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAsistencias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={viewMode === 'semana' ? 7 : 6} className="text-center h-32 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                <AlertCircle className="h-10 w-10 text-slate-400" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No hay turnos registrados para este período</p>
                                                    <p className="text-sm">Genera la planilla para volcar los horarios teóricos correspondientes.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : viewMode === 'semana' ? (
                                    // WEEKLY VIEW: grouped by date with date header rows
                                    groupedByDate.map(([fecha, records]) => (
                                        <>
                                            <TableRow key={`header-${fecha}`} className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-600">
                                                <TableCell colSpan={7} className="py-2">
                                                    <span className="font-bold text-coreops-primary dark:text-blue-400 capitalize">
                                                        {(() => {
                                                            const d = new Date(fecha + 'T12:00:00');
                                                            return `${DIAS_NOMBRE[d.getDay()]} ${longDateFormatter.format(d)}`;
                                                            return `${DIAS_NOMBRE[d.getDay()]} ${dayLongMonthFormatter.format(d)}`;
                                                            return `${DIAS_NOMBRE[d.getDay()]} ${dayMonthFormatter.format(d)}`;
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-2">({records.length} registros)</span>
                                                </TableCell>
                                            </TableRow>
                                            {records.map((a: Asistencia) => (
                                                <TableRow key={a.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                                        {formatShortDate(a.fecha)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{a.funcionarios?.cargo}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-muted-foreground font-semibold line-clamp-1">
                                                            {a.horarios?.servicios?.clientes?.razon_social}
                                                        </div>
                                                        <div className="text-xs text-slate-500 line-clamp-1">
                                                            {a.horarios?.servicios?.nombre}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs font-mono font-medium text-coreops-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                                            {a.horarios?.hora_entrada?.substring(0, 5)} - {a.horarios?.hora_salida?.substring(0, 5)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 items-center">
                                                            <Input
                                                                key={`ent-${a.id}-${a.hora_entrada_registrada}`}
                                                                type="time"
                                                                defaultValue={formatTimeVal(a.hora_entrada_registrada)}
                                                                className="h-8 w-[90px] text-xs font-mono"
                                                                onBlur={(e) => handleGuardarHora(a, 'hora_entrada_registrada', e.target.value)}
                                                            />
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Input
                                                                key={`sal-${a.id}-${a.hora_salida_registrada}`}
                                                                type="time"
                                                                defaultValue={formatTimeVal(a.hora_salida_registrada)}
                                                                className="h-8 w-[90px] text-xs font-mono"
                                                                onBlur={(e) => handleGuardarHora(a, 'hora_salida_registrada', e.target.value)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select defaultValue={a.estado} onValueChange={(val) => handleActualizarEstado(a, val)}>
                                                            <SelectTrigger className={`h-9 w-[150px] text-xs font-semibold border ${ESTADOS_MAP[a.estado].color}`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(ESTADOS_MAP).map(([key, val]) => (
                                                                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs">
                                                        <Input
                                                            defaultValue={a.observaciones || ''}
                                                            placeholder="Ej: Faltó 1 hora..."
                                                            className="h-9 text-xs"
                                                            onBlur={async (e) => {
                                                                const newVal = e.target.value;
                                                                if (newVal !== a.observaciones) {
                                                                    try {
                                                                        await updateAsistencia.mutateAsync({ id: a.id, data: { observaciones: newVal } as Partial<Asistencia> });
                                                                        toast.success('Observación guardada');
                                                                    } catch {
                                                                        toast.error('Error al guardar observación');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ))
                                ) : (
                                    // SINGLE DAY VIEW
                                    filteredAsistencias.map((a: Asistencia) => (
                                        <TableRow key={a.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{a.funcionarios?.cargo}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-muted-foreground font-semibold line-clamp-1">
                                                    {a.horarios?.servicios?.clientes?.razon_social}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-1">
                                                    {a.horarios?.servicios?.nombre}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-mono font-medium text-coreops-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                                    {a.horarios?.hora_entrada?.substring(0, 5)} - {a.horarios?.hora_salida?.substring(0, 5)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 items-center">
                                                    <Input
                                                        key={`ent-d-${a.id}-${a.hora_entrada_registrada}`}
                                                        type="time"
                                                        defaultValue={formatTimeVal(a.hora_entrada_registrada)}
                                                        className="h-8 w-[90px] text-xs font-mono"
                                                        onBlur={(e) => handleGuardarHora(a, 'hora_entrada_registrada', e.target.value)}
                                                    />
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                    <Input
                                                        key={`sal-d-${a.id}-${a.hora_salida_registrada}`}
                                                        type="time"
                                                        defaultValue={formatTimeVal(a.hora_salida_registrada)}
                                                        className="h-8 w-[90px] text-xs font-mono"
                                                        onBlur={(e) => handleGuardarHora(a, 'hora_salida_registrada', e.target.value)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select defaultValue={a.estado} onValueChange={(val) => handleActualizarEstado(a, val)}>
                                                    <SelectTrigger className={`h-9 w-[150px] text-xs font-semibold border ${ESTADOS_MAP[a.estado].color}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(ESTADOS_MAP).map(([key, val]) => (
                                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <Input
                                                    defaultValue={a.observaciones || ''}
                                                    placeholder="Ej: Faltó 1 hora..."
                                                    className="h-9 text-xs"
                                                    onBlur={async (e) => {
                                                        const newVal = e.target.value;
                                                        if (newVal !== a.observaciones) {
                                                            try {
                                                                await updateAsistencia.mutateAsync({ id: a.id, data: { observaciones: newVal } as Partial<Asistencia> });
                                                                toast.success('Observación guardada');
                                                            } catch {
                                                                toast.error('Error al guardar observación');
                                                            }
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
