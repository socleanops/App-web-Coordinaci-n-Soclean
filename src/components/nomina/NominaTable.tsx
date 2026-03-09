import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface FuncionarioHoras {
    id: string;
    nombreCompleto: string;
    cedula: string;
    totalHoras: number;
    horasNocturnas: number;
    horasFeriado: number;
    diasTrabajados: number;
    faltas: number;
}

interface NominaTableProps {
    horasPorFuncionario: FuncionarioHoras[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function NominaTable({ horasPorFuncionario, isLoading, searchTerm, setSearchTerm }: NominaTableProps) {
    return (
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
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="pl-6">Funcionario (CI)</TableHead>
                                <TableHead className="text-center">Días Asistidos</TableHead>
                                <TableHead className="text-center text-red-500">Ausencias</TableHead>
                                <TableHead className="text-right">Horas Nocturnas <br /><span className="text-[10px] font-normal text-slate-400">(22 a 06 hs)</span></TableHead>
                                <TableHead className="text-right">Horas Feriado <br /><span className="text-[10px] font-normal text-slate-400">Irrenunciable</span></TableHead>
                                <TableHead className="text-right pr-6 font-bold text-coreops-primary">Suma Total Mensual</TableHead>
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
                                        <TableCell className="text-right font-medium text-indigo-500 dark:text-indigo-400">
                                            {f.horasNocturnas > 0 ? `${f.horasNocturnas.toFixed(1)} Hrs` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">
                                            {f.horasFeriado > 0 ? `${f.horasFeriado.toFixed(1)} Hrs` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="inline-flex flex-col items-end">
                                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800/50">
                                                    {f.totalHoras.toFixed(1)} Hrs
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
