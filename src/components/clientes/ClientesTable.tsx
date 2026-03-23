import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pencil } from 'lucide-react';
import type { Cliente } from '@/types';

interface ClientesTableProps {
    clientes: Cliente[];
    isLoading: boolean;
    onEdit: (cliente: Cliente) => void;
}

export function ClientesTable({ clientes, isLoading, onEdit }: ClientesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClientes = clientes.filter((cli) => {
        const search = searchTerm.toLowerCase();
        const rs = cli.razon_social?.toLowerCase() || '';
        const nf = cli.nombre_fantasia?.toLowerCase() || '';
        const rut = cli.rut || '';
        return rs.includes(search) || nf.includes(search) || rut.includes(search);
    });

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                    <CardTitle className="text-lg flex-1">Listado de Empresas/Clientes</CardTitle>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, fantasía o RUT..."
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
                                <TableHead className="w-[250px]">Razón Social o Nombre / Fantasía</TableHead>
                                <TableHead>RUT / Cédula</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Acuerdo Op.</TableHead>
                                <TableHead>Teléfono / Email</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Cargando clientes...
                                    </TableCell>
                                </TableRow>
                            ) : filteredClientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No se encontraron clientes activos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClientes.map((emp) => (
                                    <TableRow key={emp.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-slate-800 dark:text-slate-200">{emp.razon_social}</div>
                                            <div className="text-xs text-muted-foreground">{emp.nombre_fantasia || 'Sin nombre fantasía'}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm">{emp.rut}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{emp.contacto_principal || '-'}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-coreops-primary dark:text-blue-400 text-sm">{emp.frecuencia_visita || '-'}</div>
                                            <div className="text-xs text-muted-foreground">{emp.carga_horaria || ''}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{emp.telefono || '-'}</div>
                                            <div className="text-xs text-muted-foreground">{emp.email || '-'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.estado === 'activo'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                : 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                }`}>
                                                {emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(emp)}
                                                className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Editar cliente"
                                                title="Editar cliente"
                                            >
                                                <Pencil className="h-4 w-4" />
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
    );
}
