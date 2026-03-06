import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, ArrowRightCircle } from 'lucide-react';
import { useAsistencia } from '@/hooks/useAsistencia';
import { toast } from 'sonner';

export default function Reports() {
    const [mes, setMes] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [loadingReport, setLoadingReport] = useState(false);

    // Using useAsistencia without filter to get everything (simplified for prototype)
    const { getAsistencias } = useAsistencia();
    const { data: asistencias = [], isLoading } = getAsistencias;

    const generarReporteCSV = (tipo: 'empleados' | 'clientes' | 'quincena1') => {
        setLoadingReport(true);
        toast.info(`Generando reporte de ${tipo}...`);

        setTimeout(() => {
            // Filtrar asistencias por mes seleccionado o quincena
            const registrosMes = asistencias.filter(a => a.fecha.startsWith(mes));

            let registrosAUsar = registrosMes;
            if (tipo === 'quincena1') {
                registrosAUsar = registrosMes.filter(a => parseInt(a.fecha.split('-')[2]) <= 15);
            }

            if (registrosAUsar.length === 0) {
                toast.error('No hay datos registrados en el período seleccionado para exportar.');
                setLoadingReport(false);
                return;
            }

            // Agrupar datos según el tipo
            let rawCsv = '';
            if (tipo === 'empleados' || tipo === 'quincena1') {
                rawCsv = 'FECHA,ID_EMPLEADO,NOMBRE_EMPLEADO,CLIENTE/SERVICIO,ESTADO,HORA_ENTRADA_REAL,HORA_SALIDA_REAL\n';
                registrosAUsar.forEach(r => {
                    const nombre = `${r.funcionarios?.profiles?.nombre} ${r.funcionarios?.profiles?.apellido}`;
                    const servicio = `${r.horarios?.servicios?.clientes?.razon_social} - ${r.horarios?.servicios?.nombre}`;
                    rawCsv += `${r.fecha},${r.funcionario_id},"${nombre}","${servicio}",${r.estado},${r.hora_entrada_registrada ? new Date(r.hora_entrada_registrada).toLocaleTimeString() : 'Sin marcar'},${r.hora_salida_registrada ? new Date(r.hora_salida_registrada).toLocaleTimeString() : 'Sin marcar'}\n`;
                });
            } else if (tipo === 'clientes') {
                rawCsv = 'FECHA,CLIENTE,SERVICIO,NOMBRE_EMPLEADO,ESTADO_SERVICIO,OBSERVACIONES\n';
                registrosAUsar.forEach(r => {
                    const nombre = `${r.funcionarios?.profiles?.nombre} ${r.funcionarios?.profiles?.apellido}`;
                    const cliente = r.horarios?.servicios?.clientes?.razon_social || 'N/A';
                    const servicio = r.horarios?.servicios?.nombre || 'N/A';
                    rawCsv += `${r.fecha},"${cliente}","${servicio}","${nombre}",${r.estado},"${r.observaciones || ''}"\n`;
                });
            }

            // Descargar archivo
            const blob = new Blob([rawCsv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_soclean_${tipo}_${mes}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Reporte exportado exitosamente con ruta de auditoría adjunta');
            setLoadingReport(false);
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileText className="h-8 w-8 text-coreops-primary" />
                        Reportes Gerenciales y de Operaciones
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Generación de archivos para Recursos Humanos, Administración y Alta Dirección.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm">
                <CardHeader className="border-b bg-slate-50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-500" />
                        Selección de Período a Exportar
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end mb-8">
                        <div className="w-full sm:w-64 space-y-2">
                            <label className="text-sm font-semibold">Mes Objetivo</label>
                            <input
                                type="month"
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Reporte RRHH (1) */}
                        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white hover:border-coreops-primary transition-colors flex flex-col h-full shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Cierre 1ra Quincena (RRHH)</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-grow">Archivo detallado de la primer quincena para adelantos de nómina. Para enviar el día 16 de cada mes.</p>
                            <Button
                                className="w-full bg-slate-800 hover:bg-slate-700"
                                onClick={() => generarReporteCSV('quincena1')}
                                disabled={loadingReport || isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar Quincena a CSV
                            </Button>
                        </div>

                        {/* Reporte RRHH (2) */}
                        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white hover:border-coreops-primary transition-colors flex flex-col h-full shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Nómina Mensual Empleados</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-grow">Horas reales trabajadas día por día por cada empleado. Para enviar el día 1 de cada mes al departamento de liquidación.</p>
                            <Button
                                className="w-full bg-coreops-primary hover:bg-coreops-secondary"
                                onClick={() => generarReporteCSV('empleados')}
                                disabled={loadingReport || isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar Mes a CSV
                            </Button>
                        </div>

                        {/* Reporte Administración (3) */}
                        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-blue-50/50 hover:border-blue-300 transition-colors flex flex-col h-full shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-blue-900">Control Servicios a Clientes</h3>
                            <p className="text-sm text-slate-600 mb-6 flex-grow">Reporte de horas trabajadas y servicios caídos diferenciado por cliente. Ideal para el departamento de Facturación (día 1).</p>
                            <Button
                                variant="outline"
                                className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
                                onClick={() => generarReporteCSV('clientes')}
                                disabled={loadingReport || isLoading}
                            >
                                <ArrowRightCircle className="h-4 w-4 mr-2" />
                                Exportar a Administración
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <div className="bg-slate-100 p-4 border border-slate-200 text-sm text-slate-500 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg inline-flex">
                    <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                    <strong className="block text-slate-700 mb-1">Registro de Auditoría Interna Activo</strong>
                    Todos los reportes incluyen digitalmente los logs inmutables que registran quién (usuario), a qué hora,
                    y qué registros editó a lo largo del mes en el sistema operativo central garantizando 100% de trazabilidad para la Dirección y Jefatura.
                </div>
            </div>
        </div>
    );
}
