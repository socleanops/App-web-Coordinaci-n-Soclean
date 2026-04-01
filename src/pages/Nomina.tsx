import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Clock, FileSpreadsheet, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useAsistencia } from '@/hooks/useAsistencia';
import { procesarNomina } from '@/lib/calculators/nomina';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Nomina() {
    const [mes, setMes] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const fechaDesde = `${mes}-01`;
    const fechaHasta = new Date(parseInt(mes.split('-')[0]), parseInt(mes.split('-')[1]), 0).toISOString().split('T')[0];

    const { getAsistencias } = useAsistencia(fechaDesde, fechaHasta);
    const { data: asistencias = [], isLoading } = getAsistencias;

    // Filter by month (ya filtrado por backend, pero por seguridad lo dejamos)
    const asistenciasMes = useMemo(() => {
        return asistencias;
    }, [asistencias]);

    const asisAux = asistenciasMes || [];
    // Group hours by employee using helper function
    const horasPorFuncionario = useMemo(() => {
        return procesarNomina(asisAux, searchTerm);
    }, [asisAux, searchTerm]);


    const totales = useMemo(() => {
        return horasPorFuncionario.reduce((acc, curr) => ({
            horas: acc.horas + curr.totalHoras,
            dias: acc.dias + curr.diasTrabajados,
            faltas: acc.faltas + curr.faltas,
            certificados: acc.certificados + curr.certificados,
        }), { horas: 0, dias: 0, faltas: 0, certificados: 0 });
    }, [horasPorFuncionario]);

    const generarReporteExcel = () => {
        setIsExporting(true);
        toast.info("Generando reporte Excel de horas consolidadas para RRHH...");

        setTimeout(() => {
            const dataToExport = horasPorFuncionario.map(f => {
                const hrNormales = f.totalHoras - f.horasNocturnas;
                return {
                    'Cédula': f.cedula,
                    'Nombre Empleado': f.nombreCompleto,
                    'Días Asistidos': f.diasTrabajados,
                    'Faltas': f.faltas,
                    'Certificados (Días)': f.certificados,
                    'Horas Normales': hrNormales > 0 ? parseFloat(hrNormales.toFixed(2)) : 0,
                    'Horas Nocturnas (22-06)': f.horasNocturnas > 0 ? parseFloat(f.horasNocturnas.toFixed(2)) : 0,
                    'Horas Feriado': f.horasFeriado > 0 ? parseFloat(f.horasFeriado.toFixed(2)) : 0,
                    'Total Horas': parseFloat(f.totalHoras.toFixed(2))
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Set column widths matching the style seen in `Reports.tsx`
            const wscols = [
                { wch: 15 }, // Cédula
                { wch: 30 }, // Nombre
                { wch: 15 }, // Días Asistidos
                { wch: 10 }, // Faltas
                { wch: 20 }, // Certificados
                { wch: 15 }, // Horas Normales
                { wch: 25 }, // Horas Nocturnas
                { wch: 15 }, // Horas Feriado
                { wch: 15 }, // Total Horas
            ];
            worksheet['!cols'] = wscols;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Nómina_RRHH");
            XLSX.writeFile(workbook, `Reporte_Mensual_Horas_${mes}.xlsx`);

            setIsExporting(false);
            toast.success("Reporte Excel exportado correctamente.");
        }, 1200);
    };

    // Definition matching the return shape of procesarNomina
    type NominaRow = {
        id?: string;
        cedula: string;
        nombreCompleto: string;
        diasTrabajados: number;
        faltas: number;
        certificados: number;
        totalHoras: number;
        horasNocturnas: number;
        horasFeriado: number;
    };

    const descargarReciboPDF = (f: NominaRow) => {
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(22);
            doc.setTextColor(41, 128, 185);
            doc.text('Soclean - Recibo de Horas', 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Período: ${mes}`, 14, 32);
            doc.text(`Funcionario: ${f.nombreCompleto}`, 14, 40);
            doc.text(`Cédula: ${f.cedula}`, 14, 48);
            
            // Resumen de asistencia
            const hrNormales = f.totalHoras - f.horasNocturnas;
            
            autoTable(doc, {
                startY: 55,
                head: [['Concepto', 'Cantidad']],
                body: [
                    ['Días Asistidos', `${f.diasTrabajados} días`],
                    ['Días de Falta/Ausencia', `${f.faltas} días`],
                    ['Días Certificados', `${f.certificados} días`],
                    ['Horas Normales', `${hrNormales > 0 ? hrNormales.toFixed(2) : 0} Hrs`],
                    ['Horas Nocturnas', `${f.horasNocturnas > 0 ? f.horasNocturnas.toFixed(2) : 0} Hrs`],
                    ['Horas Feriado / Irrenunciables', `${f.horasFeriado > 0 ? f.horasFeriado.toFixed(2) : 0} Hrs`],
                    ['Total Horas General', `${f.totalHoras.toFixed(2)} Hrs`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] },
            });

            const finalY = (doc as unknown as { lastAutoTable: { finalY?: number } }).lastAutoTable?.finalY || 100;
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Documento generado automáticamente por sistema CoreOps/Soclean Coordinación.', 14, finalY + 20);

            doc.save(`Recibo_Horas_${f.cedula}_${mes}.pdf`);
            toast.success(`PDF descargado para ${f.nombreCompleto}`);
        } catch (error) {
            console.error("Error al generar PDF", error);
            toast.error("Error al generar el recibo PDF");
        }
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
                        onClick={generarReporteExcel}
                        disabled={isExporting || horasPorFuncionario.length === 0}
                        className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all h-11 shrink-0 px-6"
                    >
                        <FileSpreadsheet className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                        Descargar Excel
                    </Button>
                </div>
            </div>

            {/* Metricas de Horas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                <Card className="bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-600/90 dark:text-cyan-400">Certificaciones Medicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{totales.certificados} Días</div>
                        <p className="text-xs text-slate-400 mt-1">Acumulado general</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">
                            Desglose Consolidado por Funcionario
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar funcionario (Nombre/CI)..."
                                className="pl-9 bg-background/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="pl-6">Funcionario (CI)</TableHead>
                                    <TableHead className="text-center">Días Asistidos</TableHead>
                                    <TableHead className="text-center text-red-500">Ausencias</TableHead>
                                    <TableHead className="text-center text-cyan-500">Certificados</TableHead>
                                    <TableHead className="text-right">Horas Nocturnas <br /><span className="text-[10px] font-normal text-slate-400">(22 a 06 hs)</span></TableHead>
                                    <TableHead className="text-right">Horas Feriado <br /><span className="text-[10px] font-normal text-slate-400">Irrenunciable</span></TableHead>
                                    <TableHead className="text-right font-bold text-coreops-primary">Suma Total Mensual</TableHead>
                                    <TableHead className="text-center w-24">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                            Recopilando registros de asistencia...
                                        </TableCell>
                                    </TableRow>
                                ) : horasPorFuncionario.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                            No hay registros de horas validados para este mes seleccionado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    horasPorFuncionario.map((f) => (
                                        <TableRow key={f.id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {f.nombreCompleto}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    CI: {f.cedula}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-slate-600 dark:text-slate-300">
                                                {f.diasTrabajados} d
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-red-400">
                                                {f.faltas > 0 ? f.faltas : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-cyan-500">
                                                {f.certificados > 0 ? f.certificados : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-indigo-500 dark:text-indigo-400">
                                                {f.horasNocturnas > 0 ? `${f.horasNocturnas.toFixed(1)} Hrs` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">
                                                {f.horasFeriado > 0 ? `${f.horasFeriado.toFixed(1)} Hrs` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex flex-col items-end">
                                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800/50">
                                                        {f.totalHoras.toFixed(1)} Hrs
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => descargarReciboPDF(f)}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                    title="Descargar PDF de Horas"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only sm:not-sr-only">PDF</span>
                                                </Button>
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
