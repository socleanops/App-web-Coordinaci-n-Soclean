import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAsistencia } from '@/hooks/useAsistencia';
import type { Asistencia } from '@/types';
import { toast } from 'sonner';
import { Clock, RefreshCw, CheckCircle2, UserX, AlertTriangle, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const dailyDateFormatter = new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'short' });

const ESTADOS_MAP: Record<string, { label: string, color: string, icon: LucideIcon }> = {
    'presente': { label: 'Presente', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
    'ausente': { label: 'Ausente', color: 'bg-red-100 text-red-800 border-red-300', icon: UserX },
    'tardanza': { label: 'Tarde', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle },
    'salida_anticipada': { label: 'Salida Anticipada', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle },
    'pendiente': { label: 'Pendiente', color: 'bg-stone-100 text-stone-800 border-stone-300', icon: Clock },
    'justificado': { label: 'Falta Justificada', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2 },
    'no_citado': { label: 'No Citado (Retén)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: AlertCircle },
    'certificado': { label: 'Certificado Médico', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: AlertCircle },
};

function formatDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

const timeFormatter = new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });
const headerDateFormatter = new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'short' });

function formatTimeVal(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return timeFormatter.format(d);
    } catch {
        return '';
    }
}

export default function SupervisorMobile() {
    const today = new Date();
    const dateStr = formatDateStr(today);
    
    // Auth info to possibly filter (optional for future, now we show all so they can check)
    // In the future: const user = useAuthStore(s => s.user);

    const { getAsistencias, updateAsistencia, generarPlanillaDia } = useAsistencia(dateStr, dateStr);
    const { data: asistencias = [], isLoading, refetch } = getAsistencias;

    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-generate on mount to ensure today is populated
    useEffect(() => {
        async function init() {
            try {
                setIsGenerating(true);
                await generarPlanillaDia.mutateAsync(dateStr);
            } catch (e) {
                console.error("Auto generate failed", e);
            } finally {
                setIsGenerating(false);
            }
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateStr]);

    const handleActualizarEstado = async (a: Asistencia, nuevoEstado: string) => {
        try {
            const dataToUpdate: Partial<Asistencia> = { estado: nuevoEstado as Asistencia['estado'] };
            
            // Auto-fill actual times if marking present and they are null
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
            toast.success(`${a.funcionarios?.profiles?.nombre} marcado como ${ESTADOS_MAP[nuevoEstado].label}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al actualizar estado');
        }
    };

    const handleGuardarHora = async (a: Asistencia, field: 'hora_entrada_registrada' | 'hora_salida_registrada', timeValue: string) => {
        try {
            let finalValue = null;
            if (timeValue) {
                finalValue = new Date(`${a.fecha}T${timeValue}:00`).toISOString();
            }
            await updateAsistencia.mutateAsync({ id: a.id, data: { [field]: finalValue } });
            toast.success('Hora guardada');
        } catch {
            toast.error('Error al guardar hora');
        }
    };

    const handleGuardarObs = async (a: Asistencia, newVal: string) => {
        if (newVal === a.observaciones) return;
        try {
            await updateAsistencia.mutateAsync({ id: a.id, data: { observaciones: newVal } });
            toast.success('Observación guardada');
        } catch {
            toast.error('Error');
        }
    };

    if (isLoading || isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-coreops-primary" />
                <p className="text-muted-foreground font-medium">Buscando turnos de hoy...</p>
            </div>
        );
    }

    // Grouping by "Servicio"
    const byService = asistencias.reduce((acc: Record<string, Asistencia[]>, a: Asistencia) => {
        const clientName = a.horarios?.servicios?.clientes?.razon_social || 'Sin Cliente';
        const serviceName = a.horarios?.servicios?.nombre || 'General';
        const key = `${clientName} - ${serviceName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
    }, {});

    const sortedServiceKeys = Object.keys(byService).sort();

    return (
        <div className="space-y-6 pb-6 animate-in fade-in">
            <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b border-border shadow-sm flex items-center justify-between mb-4 -mt-2 -mx-2 px-4">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium">Planilla Diaria</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {dailyDateFormatter.format(today)}
                        {headerDateFormatter.format(today)}
                    </span>
                </div>
                <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9" aria-label="Actualizar datos">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>

            {sortedServiceKeys.length === 0 ? (
                <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50 border-dashed">
                    <Clock className="h-10 w-10 text-slate-300" />
                    <p className="text-slate-500 font-medium">No hay turnos registrados para el día de hoy.</p>
                </Card>
            ) : (
                sortedServiceKeys.map(serviceName => (
                    <div key={serviceName} className="space-y-3">
                        <div className="flex items-center gap-2 sticky top-[60px] bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur z-0 py-1.5 px-3 rounded-lg border shadow-sm">
                            <span className="font-bold text-sm text-coreops-primary dark:text-blue-400">
                                {serviceName}
                            </span>
                            <span className="text-xs text-muted-foreground bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                {byService[serviceName].length}
                            </span>
                        </div>

                        <div className="space-y-3 px-1">
                            {byService[serviceName].map(a => {
                                const st = ESTADOS_MAP[a.estado];
                                const Icon = st.icon;
                                return (
                                    <Card key={a.id} className="overflow-hidden shadow-sm border-slate-200">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                                                        {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {a.horarios?.hora_entrada?.substring(0,5)} - {a.horarios?.hora_salida?.substring(0,5)}
                                                    </p>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1 ${st.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {st.label}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-slate-400">Estado</label>
                                                    <Select value={a.estado} onValueChange={(val) => handleActualizarEstado(a, val)}>
                                                        <SelectTrigger className="h-10 text-sm bg-slate-50 font-semibold focus:ring-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(ESTADOS_MAP).map(([k, v]) => (
                                                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-slate-400">Motivo / Obs</label>
                                                    <Input 
                                                        defaultValue={a.observaciones || ''} 
                                                        placeholder="Escribir..."
                                                        className="h-10 text-sm bg-slate-50"
                                                        onBlur={(e) => handleGuardarObs(a, e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Times row (only if not unassigned/pending usually, but we keep it available) */}
                                            {a.estado !== 'ausente' && a.estado !== 'justificado' && a.estado !== 'certificado' && (
                                                <div className="grid grid-cols-2 gap-2 pt-1">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-emerald-600/70 uppercase flex items-center gap-1"><Clock className="h-2.5 w-2.5"/> Entrada Real</label>
                                                        <Input 
                                                            type="time" 
                                                            defaultValue={formatTimeVal(a.hora_entrada_registrada)}
                                                            className="h-9 text-sm font-mono border-emerald-200 bg-emerald-50/50"
                                                            onBlur={(e) => handleGuardarHora(a, 'hora_entrada_registrada', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-rose-600/70 uppercase flex items-center gap-1"><Clock className="h-2.5 w-2.5"/> Salida Real</label>
                                                        <Input 
                                                            type="time" 
                                                            defaultValue={formatTimeVal(a.hora_salida_registrada)}
                                                            className="h-9 text-sm font-mono border-rose-200 bg-rose-50/50"
                                                            onBlur={(e) => handleGuardarHora(a, 'hora_salida_registrada', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
