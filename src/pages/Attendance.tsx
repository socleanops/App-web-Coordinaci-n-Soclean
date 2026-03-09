import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAsistencia } from '@/hooks/useAsistencia';
import type { Asistencia } from '@/types';
import { toast } from 'sonner';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';

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
            toast.success('Estado actualizado exitosamente');
        } catch (error: any) {
            toast.error(error.message || 'No se pudo actualizar el estado de asistencia');
        }
    };

    const handleActualizarObservaciones = async (id: string, nuevaObservacion: string) => {
        try {
            await updateAsistencia.mutateAsync({ id, data: { observaciones: nuevaObservacion } as any });
            toast.success('Observación guardada');
        } catch (err) {
            toast.error('Error al guardar observación');
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
                        <AttendanceTable
                            asistencias={filteredAsistencias}
                            isLoading={isLoading}
                            isPendingGenerar={generarPlanillaDia.isPending}
                            onGenerarPlanilla={handleGenerarPlanilla}
                            onUpdateEstado={handleActualizarEstado}
                            onUpdateObservaciones={handleActualizarObservaciones}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
