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
import { Badge } from '@/components/ui/badge';
import { Search, Database, Clock } from 'lucide-react';
import type { AuditLog } from '@/types';
import { format } from 'date-fns';

export function AuditoriaTable({ data }: { data: AuditLog[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((log) => {
        const userName = `${log.users?.nombre} ${log.users?.apellido}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return userName.includes(searchLower) || log.table_name.toLowerCase().includes(searchLower) || log.action.toLowerCase().includes(searchLower);
    });

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">INSERT</Badge>;
            case 'UPDATE': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">UPDATE</Badge>;
            case 'DELETE': return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">DELETE</Badge>;
            default: return <Badge variant="outline">{action}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Buscar por tabla, acción o usuario..."
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
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-48">Fecha/Hora</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Usuario</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Acción</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tabla Afectada</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Registro ID</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Detalles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No se encontraron registros de auditoría.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((log) => (
                                <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">
                                        {log.users ? `${log.users.nombre} ${log.users.apellido}` : 'Sistema / Usuario Borrado'}
                                        {log.users?.email && <div className="text-xs text-slate-500 font-normal">{log.users.email}</div>}
                                    </TableCell>
                                    <TableCell>
                                        {getActionBadge(log.action)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-mono text-sm text-slate-600 dark:text-slate-400">
                                            <Database className="h-3.5 w-3.5 text-slate-400" />
                                            {log.table_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500 max-w-[150px] truncate" title={log.record_id}>
                                        {log.record_id}
                                    </TableCell>
                                    <TableCell>
                                        <details className="cursor-pointer group">
                                            <summary className="text-sm text-primary font-medium hover:underline">Ver Payload JSON</summary>
                                            <div className="mt-2 p-2 bg-slate-900 text-emerald-400 rounded-md text-xs font-mono overflow-auto max-w-md max-h-48 shadow-inner border border-slate-700">
                                                {log.action === 'UPDATE' && (
                                                    <div className="mb-2">
                                                        <span className="text-slate-400 block mb-1">Old Data:</span>
                                                        <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-slate-400 block mb-1">
                                                        {log.action === 'DELETE' ? 'Deleted Data:' : 'New Data:'}
                                                    </span>
                                                    <pre>{JSON.stringify(log.action === 'DELETE' ? log.old_data : log.new_data, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </details>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
