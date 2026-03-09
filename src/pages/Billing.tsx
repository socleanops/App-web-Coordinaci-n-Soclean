import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, FileText, Download, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FacturaFormDialog } from '@/components/facturacion/FacturaFormDialog';
import { useFacturas } from '@/hooks/useFacturas';
import type { Factura } from '@/types';
import { toast } from 'sonner';

const ESTADOS_MAP: Record<string, { label: string, color: string }> = {
    'borrador': { label: 'Borrador', color: 'bg-slate-100 text-slate-800' },
    'emitida': { label: 'Emitida', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'pagada': { label: 'Cobrada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'vencida': { label: 'Vencida/Mora', color: 'bg-red-100 text-red-800 border-red-200' },
    'anulada': { label: 'Anulada', color: 'bg-slate-100 text-slate-800 opacity-50' },
};

export default function Billing() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { getFacturas, updateFacturaStatus } = useFacturas();
    const { data: facturas = [], isLoading } = getFacturas;

    const handleChangeStatus = async (id: string, nuevoEstado: string) => {
        try {
            await updateFacturaStatus.mutateAsync({ id, estado: nuevoEstado as any });
            toast.success(`Factura marcada como ${ESTADOS_MAP[nuevoEstado].label}`);
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el estado de la factura');
        }
    };

    const filteredFacturas = useMemo(() => {
        const dateFormatter = new Intl.DateTimeFormat();
        return facturas
            .filter((f: Factura) => {
                const search = searchTerm.toLowerCase();
                const num = f.numero?.toLowerCase() || '';
                const cliente = f.clientes?.razon_social?.toLowerCase() || '';
                return num.includes(search) || cliente.includes(search);
            })
            .map((f: Factura) => ({
                ...f,
                fecha_emision_formatted: f.fecha_emision ? dateFormatter.format(new Date(f.fecha_emision)) : ''
            }));
    }, [facturas, searchTerm]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Control de Horas por Cliente
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Pre-cálculo operativo de costos y valorizado de servicios según carga horaria.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="border-slate-300 dark:border-slate-700 bg-white/50 h-11 shrink-0">
                        <Download className="mr-2 h-4 w-4" /> Exportar ERP
                    </Button>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Crear Registro Libre
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-coreops-primary to-blue-700 text-white shadow-md border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90 text-white">Total Horas Cotizadas (Mes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{facturas.reduce((acc, current) => acc + current.items.reduce((accItem: any, item: any) => accItem + item.cantidad, 0), 0)} Horas</div>
                        <p className="text-sm opacity-80 mt-1">Estimación operativa de carga horaria acumulada</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-slate-900/60 shadow-sm border border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-slate-500">Documentos Generados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{facturas.length} Registros</div>
                        <p className="text-sm text-slate-500 mt-1">Registrados este mes</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">Histórico de Movimientos</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente o Nro de factura..."
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
                                    <TableHead>Número y Fecha</TableHead>
                                    <TableHead>Cliente a Facturar</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Cargando comprobantes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFacturas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Aún no hay facturas emitidas ni registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFacturas.map((f: Factura) => (
                                        <TableRow key={f.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {f.numero}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Emisión: {(f as any).fecha_emision_formatted}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-coreops-primary dark:text-blue-400">
                                                    {f.clientes?.razon_social}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1 break-all">
                                                    RUT: {f.clientes?.rut} | {f.clientes?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select defaultValue={f.estado} onValueChange={(val) => handleChangeStatus(f.id, val)}>
                                                    <SelectTrigger className={`h-8 w-[140px] text-xs font-semibold border ${ESTADOS_MAP[f.estado].color}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(ESTADOS_MAP).map(([key, val]) => (
                                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                                                        <DropdownMenuItem>Enviar por Email</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleChangeStatus(f.id, 'pagada')} className="text-emerald-600">
                                                            Marcar Pagada
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleChangeStatus(f.id, 'anulada')} className="text-red-600">
                                                            Anular Documento
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <FacturaFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
}
