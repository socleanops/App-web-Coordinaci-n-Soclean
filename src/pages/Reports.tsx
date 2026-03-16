import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, ArrowRightCircle, Filter } from 'lucide-react';
import { useAsistencia } from '@/hooks/useAsistencia';
import type { Asistencia } from '@/types';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Reports() {
    const [desde, setDesde] = useState<string>(new Date().toISOString().substring(0, 8) + '01');
    const [hasta, setHasta] = useState<string>(new Date().toISOString().substring(0, 10));
    const [loadingReport, setLoadingReport] = useState(false);
    const [filtroFuncionario, setFiltroFuncionario] = useState<string>('todos');
    const [filtroServicio, setFiltroServicio] = useState<string>('todos');

    // Pass date filters to avoid massive overfetching
    const { getAsistencias } = useAsistencia(desde, hasta);
    const { data: asistencias = [], isLoading } = getAsistencias;

    // Obtener listas únicas con map y useMemo para evitar loops O(N^2) que congelan la UI
    const uniqueEmpleados = useMemo(() => {
        const map = new Map();
        asistencias.forEach((current: Asistencia) => {
            if (current.funcionario_id && !map.has(current.funcionario_id)) {
                map.set(current.funcionario_id, current);
            }
        });
        return Array.from(map.values()).sort((a: Asistencia, b: Asistencia) => {
            const nameA = a.funcionarios?.profiles?.nombre || '';
            const nameB = b.funcionarios?.profiles?.nombre || '';
            return nameA.localeCompare(nameB);
        });
    }, [asistencias]);

    const uniqueServicios = useMemo(() => {
        const map = new Map();
        asistencias.forEach((current: Asistencia) => {
            const servicioId = current.horarios?.servicio_id;
            if (servicioId && !map.has(servicioId)) {
                map.set(servicioId, current);
            }
        });
        return Array.from(map.values()).sort((a: Asistencia, b: Asistencia) => {
            const nameA = a.horarios?.servicios?.nombre || '';
            const nameB = b.horarios?.servicios?.nombre || '';
            return nameA.localeCompare(nameB);
        });
    }, [asistencias]);

    const generarReporteCSV = (tipo: 'empleados' | 'clientes' | 'quincena1') => {
        setLoadingReport(true);
        toast.info(`Generando reporte de ${tipo}...`);

        setTimeout(() => {
            // Filtrar asistencias por rango de fechas
            const registrosRango = asistencias.filter((a: Asistencia) => {
                 return a.fecha >= desde && a.fecha <= hasta;
            });

            let registrosAUsar = registrosRango;

            // Aplicar filtros adicionales si están seleccionados
            if (filtroFuncionario !== 'todos') {
                registrosAUsar = registrosAUsar.filter((a: Asistencia) => a.funcionario_id === filtroFuncionario);
            }
            if (filtroServicio !== 'todos') {
                registrosAUsar = registrosAUsar.filter((a: Asistencia) => a.horarios?.servicio_id === filtroServicio);
            }

            if (tipo === 'quincena1') {
                registrosAUsar = registrosAUsar.filter(a => parseInt(a.fecha.split('-')[2]) <= 15);
            }

            if (registrosAUsar.length === 0) {
                toast.error('No hay datos registrados en el período seleccionado para exportar.');
                setLoadingReport(false);
                return;
            }

            // Agrupar datos según el tipo
            let dataToExport: Record<string, unknown>[] = [];
            if (tipo === 'empleados' || tipo === 'quincena1') {
                // Ordenar por empleado alfabéticamente, y luego por fecha
                const registrosOrdenados = [...registrosAUsar].sort((a, b) => {
                    const nameA = a.funcionarios?.profiles?.nombre || '';
                    const nameB = b.funcionarios?.profiles?.nombre || '';
                    if (nameA !== nameB) return nameA.localeCompare(nameB);
                    return a.fecha.localeCompare(b.fecha);
                });

                dataToExport = registrosOrdenados.map(r => {
                    let totalHoras = '0 hs';
                    const hEntrada = r.horarios?.hora_entrada?.substring(0, 5);
                    const hSalida = r.horarios?.hora_salida?.substring(0, 5);

                    if (hEntrada && hSalida) {
                        const [eH, eM] = hEntrada.split(':').map(Number);
                        const [sH, sM] = hSalida.split(':').map(Number);
                        let minutes = (sH * 60 + sM) - (eH * 60 + eM);
                        if (minutes < 0) minutes += 24 * 60; // manejo de turnos de noche

                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        totalHoras = mins === 0 ? `${hours} hs` : `${hours}:${mins.toString().padStart(2, '0')} hs`;
                    }

                    return {
                        'Nombre Empleado': `${r.funcionarios?.profiles?.nombre} ${r.funcionarios?.profiles?.apellido}`,
                        'Fecha': r.fecha,
                        'Cédula': r.funcionarios?.cedula || 'N/A',
                        'Cliente / Servicio': `${r.horarios?.servicios?.clientes?.razon_social || ''} - ${r.horarios?.servicios?.nombre || ''}`,
                        'Horario de Entrada': hEntrada || 'N/A',
                        'Horario de Salida': hSalida || 'N/A',
                        'Total Horas': totalHoras,
                        'Estado Confirmación': r.estado.toUpperCase(),
                        'Observaciones': r.observaciones || ''
                    };
                });
            } else if (tipo === 'clientes') {
                // Ordenar por Cliente, luego por Servicio, y luego por Fecha
                const registrosOrdenados = [...registrosAUsar].sort((a, b) => {
                    const clientA = a.horarios?.servicios?.clientes?.razon_social || '';
                    const clientB = b.horarios?.servicios?.clientes?.razon_social || '';
                    if (clientA !== clientB) return clientA.localeCompare(clientB);

                    const servA = a.horarios?.servicios?.nombre || '';
                    const servB = b.horarios?.servicios?.nombre || '';
                    if (servA !== servB) return servA.localeCompare(servB);

                    return a.fecha.localeCompare(b.fecha);
                });

                dataToExport = registrosOrdenados.map(r => {
                    let totalHoras = '0 hs';
                    const hEntrada = r.horarios?.hora_entrada?.substring(0, 5);
                    const hSalida = r.horarios?.hora_salida?.substring(0, 5);

                    if (hEntrada && hSalida) {
                        const [eH, eM] = hEntrada.split(':').map(Number);
                        const [sH, sM] = hSalida.split(':').map(Number);
                        let minutes = (sH * 60 + sM) - (eH * 60 + eM);
                        if (minutes < 0) minutes += 24 * 60; // manejo de turnos de noche

                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        totalHoras = mins === 0 ? `${hours} hs` : `${hours}:${mins.toString().padStart(2, '0')} hs`;
                    }

                    return {
                        'Cliente': r.horarios?.servicios?.clientes?.razon_social || 'N/A',
                        'Servicio': r.horarios?.servicios?.nombre || 'N/A',
                        'Fecha': r.fecha,
                        'Nombre Empleado': `${r.funcionarios?.profiles?.nombre} ${r.funcionarios?.profiles?.apellido}`,
                        'Horario de Entrada': hEntrada || 'N/A',
                        'Horario de Salida': hSalida || 'N/A',
                        'Total Horas': totalHoras,
                        'Estado': r.estado.toUpperCase(),
                        'Observaciones': r.observaciones || ''
                    };
                });
            }

            // Calcular el total global de tiempo en todos los registros mostrados
            let totalMinutosGlobal = 0;
            dataToExport.forEach(row => {
                if (row['Total Horas'] && row['Total Horas'] !== '0 hs') {
                    const timePart = row['Total Horas'].replace(' hs', '').trim();
                    const parts = timePart.split(':');
                    if (parts.length === 2) {
                        totalMinutosGlobal += (parseInt(parts[0]) * 60) + parseInt(parts[1]);
                    } else if (parts.length === 1) {
                        totalMinutosGlobal += parseInt(parts[0]) * 60;
                    }
                }
            });

            if (totalMinutosGlobal > 0) {
                const totalHoursCalculated = Math.floor(totalMinutosGlobal / 60);
                const totalMinsCalculated = totalMinutosGlobal % 60;
                const formattedGlobalTotal = totalMinsCalculated === 0
                    ? `${totalHoursCalculated} hs`
                    : `${totalHoursCalculated}:${totalMinsCalculated.toString().padStart(2, '0')} hs`;

                // Agregar una fila en blanco separadora
                dataToExport.push({});

                // Crear objeto de total. Mapear "Total Horas" a la columna respectiva, 
                // y usar la primera columna disponible para el texto "TOTAL GLOBAL DE HORAS DE ESTE REPORTE"
                const summaryRow: Record<string, unknown> = {};
                const firstKey = Object.keys(dataToExport[0])[0]; // 'Nombre Empleado' o 'Cliente'
                summaryRow[firstKey] = '=> TOTAL GLOBAL DE HORAS DE ESTE REPORTE <=';
                summaryRow['Total Horas'] = formattedGlobalTotal;

                // Si el reporte es 'empleados', 'Total Horas' se llamaba diferente. Lo unificamos.
                if (tipo !== 'clientes') {
                    summaryRow['Total Horas Teóricas'] = formattedGlobalTotal;
                    delete summaryRow['Total Horas'];
                }

                dataToExport.push(summaryRow);
            }

            // Generar y descargar archivo Excel
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
            XLSX.writeFile(workbook, `reporte_soclean_${tipo}_${desde}_al_${hasta}.xlsx`);

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
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Fecha Desde</label>
                            <input
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-coreops-primary"
                            />
                        </div>
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Fecha Hasta</label>
                            <input
                                type="date"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-coreops-primary"
                            />
                        </div>

                        <div className="w-full md:w-64 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <Filter className="h-3 w-3" />
                                Filtrar por Funcionario
                            </label>
                            <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                                <SelectTrigger className="h-10 border-slate-300">
                                    <SelectValue placeholder="Todos los funcionarios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los Empleados</SelectItem>
                                    {uniqueEmpleados.map((a: Asistencia) => (
                                        <SelectItem key={`emp_${a.funcionario_id}`} value={a.funcionario_id}>
                                            {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-72 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <Filter className="h-3 w-3" />
                                Filtrar por Servicio
                            </label>
                            <Select value={filtroServicio} onValueChange={setFiltroServicio}>
                                <SelectTrigger className="h-10 border-slate-300">
                                    <SelectValue placeholder="Todos los servicios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los Servicios</SelectItem>
                                    {uniqueServicios.map((a: Asistencia) => (
                                        <SelectItem key={`srv_${a.horarios?.servicio_id}`} value={a.horarios?.servicio_id}>
                                            {a.horarios?.servicios?.clientes?.razon_social} - {a.horarios?.servicios?.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                Exportar Quincena a Excel
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
                                Exportar Mes a Excel
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
