import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Target, Printer, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientes } from '@/hooks/useClientes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const dateFormatter = new Intl.DateTimeFormat('es-UY');

interface ReportRow {
    fecha: string;
    funcionario: string;
    servicio: string;
    entrada: string;
    salida: string;
    horasDecimal: number;
    horasDisplay: string;
}

export default function HorasPorCliente() {
    const { getClientes } = useClientes();
    const clientes = getClientes.data?.filter(c => c.estado === 'activo') || [];

    const [clienteId, setClienteId] = useState<string>('');
    const [desde, setDesde] = useState<string>(new Date().toISOString().substring(0, 8) + '01');
    const [hasta, setHasta] = useState<string>(new Date().toISOString().substring(0, 10));

    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportRow[]>([]);
    const [totalHoras, setTotalHoras] = useState<number>(0);
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleGenerar = async () => {
        if (!clienteId || !desde || !hasta) {
            toast.error('Debe seleccionar el cliente y el rango de fechas (Desde y Hasta).');
            return;
        }

        setIsLoading(true);
        setHasGenerated(false);
        try {
            const { data, error } = await supabase
                .from('asistencia')
                .select(`
                    fecha,
                    estado,
                    funcionarios!inner (
                        profiles (nombre, apellido)
                    ),
                    horarios!inner (
                        hora_entrada,
                        hora_salida,
                        servicios!inner (
                            nombre,
                            cliente_id
                        )
                    )
                `)
                .eq('horarios.servicios.cliente_id', clienteId)
                .gte('fecha', desde)
                .lte('fecha', hasta)
                .order('fecha', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.info('No se encontraron turnos trabajados en este período para el cliente seleccionado.');
                setReportData([]);
                setTotalHoras(0);
                setIsLoading(false);
                return;
            }

            const rows: ReportRow[] = [];
            let sumatoriaHorasDecimal = 0;

            data.forEach((a: Record<string, unknown>) => {
                const est = a.estado;
                // Calculamos solo presentes o justificados para facturación
                if (est === 'presente' || est === 'tardanza' || est === 'salida_anticipada' || est === 'justificado') {
                    const servicioNombre = a.horarios.servicios.nombre;
                    const nombreFunc = `${a.funcionarios?.profiles?.nombre} ${a.funcionarios?.profiles?.apellido}`;
                    const hEntrada = a.horarios.hora_entrada?.substring(0, 5) || '--:--';
                    const hSalida = a.horarios.hora_salida?.substring(0, 5) || '--:--';
                    
                    let horasDecimal = 0;
                    let horasDisplay = '0 hs';

                    if (hEntrada !== '--:--' && hSalida !== '--:--') {
                        const [eh, em] = hEntrada.split(':').map(Number);
                        const [sh, sm] = hSalida.split(':').map(Number);
                        
                        let totalHoras = (sh + sm / 60) - (eh + em / 60);
                        if (totalHoras < 0) totalHoras += 24; // Turnos noche
                        
                        horasDecimal = totalHoras;
                        
                        const h = Math.floor(horasDecimal);
                        const m = Math.round((horasDecimal - h) * 60);
                        horasDisplay = m === 0 ? `${h}h` : `${h}h ${m}m`;
                    }

                    sumatoriaHorasDecimal += horasDecimal;

                    rows.push({
                        fecha: a.fecha,
                        funcionario: nombreFunc,
                        servicio: servicioNombre,
                        entrada: hEntrada,
                        salida: hSalida,
                        horasDecimal,
                        horasDisplay
                    });
                }
            });

            setReportData(rows);
            setTotalHoras(sumatoriaHorasDecimal);
            setHasGenerated(true);
            if(rows.length > 0){
                toast.success(`Reporte generado: ${rows.length} turnos procesados.`);
            } else {
                toast.info('Los turnos encontrados no aplican para cobro (Ej: Ausentes).');
            }

        } catch (err: Record<string, unknown>) {
            toast.error(err.message || 'Error al obtener los datos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportarExcel = () => {
        if(reportData.length === 0) return;

        const dataToExport = reportData.map(r => ({
            'Día': dateFormatter.format(new Date(r.fecha + 'T00:00:00')),
            'Servicio Realizado': r.servicio,
            'Funcionario a Cargo': r.funcionario,
            'H. Entrada': r.entrada,
            'H. Salida': r.salida,
            'Horas Totales': r.horasDisplay
        }));

        // Fila extra de total
        const h = Math.floor(totalHoras);
        const m = Math.round((totalHoras - h) * 60);
        const hsDisplayFinal = m === 0 ? `${h}h` : `${h}h ${m}m`;

        dataToExport.push({} as unknown as Record<string, unknown>);
        dataToExport.push({
            'Día': 'TOTAL GENERAL:',
            'Servicio Realizado': '',
            'Funcionario a Cargo': '',
            'H. Entrada': '',
            'H. Salida': '',
            'Horas Totales': hsDisplayFinal
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Horas");
        
        const clientName = clientes.find(c => c.id === clienteId)?.razon_social || 'cliente';
        XLSX.writeFile(workbook, `Horas_${clientName}_${desde}_al_${hasta}.xlsx`);
    };

    const formatTotalGeneral = () => {
        const h = Math.floor(totalHoras);
        const m = Math.round((totalHoras - h) * 60);
        return m === 0 ? `${h}h 00m` : `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileText className="h-8 w-8 text-coreops-primary" />
                        Reporte de Horas por Cliente
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Genera un documento detallado con discriminación día por día para enviar a Administración y elaborar las facturas.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b bg-slate-50 dark:bg-slate-900/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                        <Target className="h-5 w-5 text-slate-500" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Cliente a Consultar</label>
                            <Select value={clienteId} onValueChange={setClienteId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Seleccionar cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.razon_social}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Fecha Desde</label>
                            <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Fecha Hasta</label>
                            <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="h-11" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleGenerar} disabled={isLoading} className="bg-coreops-primary hover:bg-coreops-secondary h-11 px-8 rounded-xl shadow-md">
                            {isLoading ? 'Calculando...' : 'Generar Reporte Ahora'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {hasGenerated && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm w-full sm:w-auto">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Total General a Facturar</p>
                                <p className="text-3xl font-black">{formatTotalGeneral()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.print()} className="bg-white hidden sm:flex">
                                <Printer className="mr-2 h-4 w-4" /> Imprimir Documento
                            </Button>
                            <Button onClick={handleExportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                <Download className="mr-2 h-4 w-4" /> Descargar Excel para Admin
                            </Button>
                        </div>
                    </div>

                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-100 dark:bg-slate-900 border-b">
                                    <TableRow>
                                        <TableHead className="font-bold w-[120px]">Día</TableHead>
                                        <TableHead className="font-bold">Servicio Realizado</TableHead>
                                        <TableHead className="font-bold">Funcionario a Cargo</TableHead>
                                        <TableHead className="font-bold w-[100px] text-center">Entrada</TableHead>
                                        <TableHead className="font-bold w-[100px] text-center">Salida</TableHead>
                                        <TableHead className="font-bold w-[100px] text-right">Horas Día</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground bg-white">
                                                No hay registros que mostrar en este período.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reportData.map((row, idx) => (
                                            <TableRow key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium text-slate-700 whitespace-nowrap">
                                                    {dateFormatter.format(new Date(row.fecha + 'T00:00:00'))}
                                                </TableCell>
                                                <TableCell className="text-slate-600">{row.servicio}</TableCell>
                                                <TableCell className="text-slate-600">{row.funcionario}</TableCell>
                                                <TableCell className="text-center font-mono text-sm text-slate-500 bg-slate-50/50">{row.entrada}</TableCell>
                                                <TableCell className="text-center font-mono text-sm text-slate-500 bg-slate-50/50">{row.salida}</TableCell>
                                                <TableCell className="text-right font-bold text-coreops-primary">{row.horasDisplay}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
