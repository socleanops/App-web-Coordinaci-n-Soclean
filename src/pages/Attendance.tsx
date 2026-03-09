import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Search, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAsistencia } from '@/hooks/useAsistencia';
import type { Asistencia } from '@/types';
import { toast } from 'sonner';

const ESTADOS_MAP: Record<string, { label: string, color: string }> = {
    'presente': { label: 'Presente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    'ausente': { label: 'Ausente', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    'tardanza': { label: 'Tardanza', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
    'salida_anticipada': { label: 'Salida Anticipada', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
    'pendiente': { label: 'Pendiente', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    'justificado': { label: 'Falta Justificada', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
};

function AttendanceRow({
    a,
    handleActualizarEstado,
    updateAsistencia
}: {
    a: Asistencia;
    handleActualizarEstado: (id: string, nuevoEstado: string) => Promise<void>;
    updateAsistencia: any;
}) {
    return (
        <TableRow key={a.id} className="group hover:bg-muted/30 transition-colors">
            <TableCell>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                </div>
                <div className="text-xs text-muted-foreground">ID: {a.funcionario_id.substring(0, 8)}...</div>
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
                <div className="text-sm font-mono font-medium text-coreops-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                    {a.horarios?.hora_entrada?.substring(0, 5)} hrs a {a.horarios?.hora_salida?.substring(0, 5)} hrs
                </div>
            </TableCell>
            <TableCell>
                <Select defaultValue={a.estado} onValueChange={(val) => handleActualizarEstado(a.id, val)}>
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
                    placeholder="Ej: Faltó 1 hora, Salida tarde..."
                    className="h-9 text-xs"
                    onBlur={async (e) => {
                        const newVal = e.target.value;
                        if (newVal !== a.observaciones) {
                            try {
                                await updateAsistencia.mutateAsync({ id: a.id, data: { observaciones: newVal } as any });
                                toast.success('Observación guardada');
                            } catch (err) {
                                toast.error('Error al guardar observación');
                            }
                        }
                    }}
                />
            </TableCell>
        </TableRow>
    );
}

export default function Attendance() {
    // Defaults to today
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hideResolved, setHideResolved] = useState(true);

    const { getAsistencias, updateAsistencia, generarPlanillaDia } = useAsistencia(fecha);
    const { data: asistencias = [], isLoading, refetch } = getAsistencias;

    const handleGenerarPlanilla = async () => {
        try {
            const result = await generarPlanillaDia.mutateAsync(fecha);
            if (result.count > 0) {
                toast.success(`Planilla generada: se agregaron ${result.count} registros basados en los horarios teóricos.`);
            } else {
                toast.info('No se encontraron horarios teóricos activos para aplicar en esta fecha, o los registros ya estaban creados.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al intentar generar la planilla');
        }
    };

    const handleActualizarEstado = async (id: string, nuevoEstado: string) => {
        try {
            await updateAsistencia.mutateAsync({ id, data: { estado: nuevoEstado as any } });
            toast.success(`Estado actualizado a ${ESTADOS_MAP[nuevoEstado].label}`);
        } catch (error: any) {
            toast.error(error.message || 'No se pudo actualizar el estado de asistencia');
        }
    };

    const handleRefetch = () => {
        refetch();
        toast.info("Actualizando registros...");
    }

    const filteredAsistencias = asistencias.filter((a: Asistencia) => {
        const search = searchTerm.toLowerCase();
        const func = (a.funcionarios?.profiles?.nombre + ' ' + a.funcionarios?.profiles?.apellido).toLowerCase();
        const matchesSearch = func.includes(search);

        if (hideResolved) {
            // Mostrar solo los que requieren atencion: pendientes, tardanzas, ausentes
            return matchesSearch && ['pendiente', 'ausente', 'tardanza', 'salida_anticipada'].includes(a.estado);
        }
        return matchesSearch;
    });

    const pendingCount = asistencias.filter((a: Asistencia) => ['pendiente', 'ausente', 'tardanza', 'salida_anticipada'].includes(a.estado)).length;

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
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <Button
                        variant={hideResolved ? "default" : "secondary"}
                        onClick={() => setHideResolved(!hideResolved)}
                        className="h-11"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {hideResolved ? `Pendientes (${pendingCount})` : 'Viendo Todos'}
                    </Button>
                    <Input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-auto h-11 border-slate-300 shadow-sm"
                    />
                    <Button onClick={handleRefetch} variant="outline" className="h-11 px-3">
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">Registros del Día: {new Date(fecha).toLocaleDateString()}</CardTitle>
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
                    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-background/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Cliente / Servicio</TableHead>
                                    <TableHead>Horario Coordinado</TableHead>
                                    <TableHead>Estado Cumplimiento</TableHead>
                                    <TableHead>Observaciones / Diferencia Horaria</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Buscando registros biométricos del día...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAsistencias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                <AlertCircle className="h-10 w-10 text-slate-400" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No hay turnos registrados para la fecha seleccionada</p>
                                                    <p className="text-sm">Genera la planilla para volcar los horarios teóricos correspondientes a este día y poder chequearlos.</p>
                                                </div>
                                                <Button
                                                    onClick={handleGenerarPlanilla}
                                                    disabled={generarPlanillaDia.isPending}
                                                    className="mt-2"
                                                >
                                                    {generarPlanillaDia.isPending ? 'Generando...' : 'Generar Planilla del Día'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAsistencias.map((a: Asistencia) => (
                                        <AttendanceRow
                                            key={a.id}
                                            a={a}
                                            handleActualizarEstado={handleActualizarEstado}
                                            updateAsistencia={updateAsistencia}
                                        />
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
