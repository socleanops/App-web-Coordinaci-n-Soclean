import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAsistencia } from '@/hooks/useAsistencia';
import { toast } from 'sonner';
import { NominaTable } from '@/components/nomina/NominaTable';

export default function Nomina() {
    const [mes, setMes] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const { getAsistencias } = useAsistencia();
    const { data: asistencias = [], isLoading } = getAsistencias;

    // Filter by month
    const asistenciasMes = useMemo(() => {
        return asistencias.filter(a => a.fecha.startsWith(mes));
    }, [asistencias, mes]);

    // Group hours by employee
    const horasPorFuncionario = useMemo(() => {
        const agrupar: Record<string, { id: string, nombreCompleto: string, cedula: string, totalHoras: number, horasNocturnas: number, horasFeriado: number, diasTrabajados: number, faltas: number }> = {};

        asistenciasMes.forEach(a => {
            const funcId = a.funcionario_id;
            if (!agrupar[funcId]) {
                agrupar[funcId] = {
                    id: funcId,
                    nombreCompleto: `${a.funcionarios?.profiles?.nombre} ${a.funcionarios?.profiles?.apellido}`,
                    cedula: a.funcionarios?.cedula || '',
                    totalHoras: 0,
                    horasNocturnas: 0,
                    horasFeriado: 0,
                    diasTrabajados: 0,
                    faltas: 0
                };
            }

            if (a.estado === 'presente' || a.estado === 'tardanza' || a.estado === 'salida_anticipada') {
                agrupar[funcId].diasTrabajados += 1;

                // Calculate hours done today
                let hours = 0;
                let nightHours = 0;

                if (a.hora_entrada_registrada && a.hora_salida_registrada) {
                    const start = new Date(a.hora_entrada_registrada);
                    const end = new Date(a.hora_salida_registrada);

                    hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

                    const current = new Date(start.getTime());
                    while (current < end) {
                        const h = current.getHours();
                        if (h >= 22 || h < 6) nightHours += 1;
                        current.setHours(current.getHours() + 1);
                    }
                } else if (a.horarios?.hora_entrada && a.horarios?.hora_salida) {
                    const [hIn, mIn] = a.horarios.hora_entrada.split(':').map(Number);
                    const [hOut, mOut] = a.horarios.hora_salida.split(':').map(Number);

                    let endHours = hOut + mOut / 60;
                    const startHours = hIn + mIn / 60;

                    if (endHours < startHours) endHours += 24;
                    hours = endHours - startHours;

                    for (let i = Math.floor(startHours); i < Math.floor(endHours); i++) {
                        const actualHour = i % 24;
                        if (actualHour >= 22 || actualHour < 6) nightHours++;
                    }
                }

                agrupar[funcId].totalHoras += Math.max(0, hours);
                agrupar[funcId].horasNocturnas += Math.max(0, nightHours);

                // Add to Feriados if applicable
                const isFeriado = a.fecha.endsWith('-01-01') || a.fecha.endsWith('-05-01') ||
                    a.fecha.endsWith('-07-18') || a.fecha.endsWith('-08-25') ||
                    a.fecha.endsWith('-12-25');
                if (isFeriado) {
                    agrupar[funcId].horasFeriado += Math.max(0, hours);
                }

            } else if (a.estado === 'ausente') {
                agrupar[funcId].faltas += 1;
            }
        });

        return Object.values(agrupar).filter(f => {
            const search = searchTerm.toLowerCase();
            return f.nombreCompleto.toLowerCase().includes(search) || f.cedula.includes(search);
        }).sort((a, b) => b.totalHoras - a.totalHoras);

    }, [asistenciasMes, searchTerm]);


    const totales = useMemo(() => {
        return horasPorFuncionario.reduce((acc, curr) => ({
            horas: acc.horas + curr.totalHoras,
            dias: acc.dias + curr.diasTrabajados,
            faltas: acc.faltas + curr.faltas,
        }), { horas: 0, dias: 0, faltas: 0 });
    }, [horasPorFuncionario]);

    const generarReporteCSV = () => {
        setIsExporting(true);
        toast.info("Generando reporte de horas consolidadas para RRHH...");

        setTimeout(() => {
            let csv = 'CEDULA,NOMBRE_FUNCIONARIO,TOTAL_HORAS,HORAS_NORMALES,HORAS_NOCTURNAS(22-06),HORAS_FERIADO,CANTIDAD_DIAS,FALTAS\n';

            horasPorFuncionario.forEach(f => {
                const hrNormales = f.totalHoras - f.horasNocturnas;
                csv += `${f.cedula},"${f.nombreCompleto}",${f.totalHoras.toFixed(2)},${hrNormales.toFixed(2)},${f.horasNocturnas.toFixed(2)},${f.horasFeriado.toFixed(2)},${f.diasTrabajados},${f.faltas}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Mensual_Horas_${mes}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsExporting(false);
            toast.success("Reporte de horas exportado correctamente.");
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Clock className="h-8 w-8 text-coreops-primary" />
                        Reporte Diario de Horas
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Consolidado estricto de horas realizadas por cada funcionario para enviar a RRHH.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <Input
                        type="month"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        className="w-auto h-11 border-slate-300 shadow-sm"
                    />
                    <Button
                        onClick={generarReporteCSV}
                        disabled={isExporting || horasPorFuncionario.length === 0}
                        className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all h-11 shrink-0 px-6"
                    >
                        <FileSpreadsheet className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                        Descargar a CSV
                    </Button>
                </div>
            </div>

            {/* Metricas de Horas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-coreops-primary to-blue-800 text-white shadow-md border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Horas Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totales.horas.toFixed(0)} Hrs</div>
                        <p className="text-xs text-blue-100 mt-1">Acumuladas por el equipo</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600/90 dark:text-emerald-400">Jornadas Cumplidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totales.dias} Turnos</div>
                        <p className="text-xs text-slate-500 mt-1">Completados en el mes</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-500/80">Incidencias / Faltas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totales.faltas} Ausencias</div>
                        <p className="text-xs text-slate-400 mt-1">Acumulado general</p>
                    </CardContent>
                </Card>
            </div>

            <NominaTable
                horasPorFuncionario={horasPorFuncionario}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

        </div>
    );
}
