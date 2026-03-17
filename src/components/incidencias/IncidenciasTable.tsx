import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Search, ArrowUpDown, UserPlus } from 'lucide-react';
import type { Incidencia } from '@/types';
import { useIncidencias } from '@/hooks/useIncidencias';
import { format } from 'date-fns';

export function IncidenciasTable({ data }: { data: Incidencia[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { deleteIncidencia } = useIncidencias();

    const filteredData = data.filter((incidencia) => {
        const funcName = `${incidencia.funcionarios?.profiles?.nombre} ${incidencia.funcionarios?.profiles?.apellido}`.toLowerCase();
        const repName = `${incidencia.reemplazo?.profiles?.nombre} ${incidencia.reemplazo?.profiles?.apellido}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return funcName.includes(searchLower) || repName.includes(searchLower) || incidencia.tipo.toLowerCase().includes(searchLower);
    });

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
            case 'En proceso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'Resuelta': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
            case 'Cerrada': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Buscar funcionario o tipo..."
                        className="pl-9 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus-visible:ring-primary shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto m-4">
                <Table>
                    <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1 cursor-pointer">
                                    Funcionario <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tipo</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Fechas</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Reemplazo Asignado</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Estado</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No se encontraron incidencias.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((incidencia) => (
                                <TableRow key={incidencia.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                    <TableCell className="font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {incidencia.funcionarios?.profiles?.nombre?.[0] || '?'}
                                                {incidencia.funcionarios?.profiles?.apellido?.[0] || '?'}
                                            </div>
                                            {incidencia.funcionarios?.profiles?.nombre} {incidencia.funcionarios?.profiles?.apellido}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{incidencia.tipo}</span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {format(new Date(incidencia.fecha_inicio), 'dd/MM/yyyy')}
                                        {incidencia.fecha_fin && ` al ${format(new Date(incidencia.fecha_fin), 'dd/MM/yyyy')}`}
                                    </TableCell>
                                    <TableCell>
                                        {incidencia.reemplazo ? (
                                            <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <UserPlus className="h-4 w-4 text-blue-500" />
                                                {incidencia.reemplazo.profiles?.nombre} {incidencia.reemplazo.profiles?.apellido}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(incidencia.estado)}`}>
                                            {incidencia.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Abrir menú">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                                                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 font-normal text-xs uppercase tracking-wider">Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                                                    <Edit className="mr-2 h-4 w-4" /> Editar Incidencia
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (confirm('¿Estás seguro de eliminar esta incidencia?')) {
                                                            deleteIncidencia.mutate(incidencia.id);
                                                        }
                                                    }}
                                                    className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
            <div className="flex items-center justify-between px-4 pb-4">
                <div className="text-sm text-slate-500">
                    Mostrando <span className="font-medium text-slate-900 dark:text-white">{filteredData.length}</span> resultados
                </div>
            </div>
        </div>
    );
}
