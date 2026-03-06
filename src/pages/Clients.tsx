import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Search, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ClienteFormDialog } from '@/components/clientes/ClienteFormDialog';
import { ClienteBulkImportDialog } from '@/components/clientes/ClienteBulkImportDialog';
import { useClientes } from '@/hooks/useClientes';
import type { Cliente } from '@/types';

export default function Clientes() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { getClientes } = useClientes();
    const { data: clientes = [], isLoading } = getClientes;

    const handleEdit = (cliente: Cliente) => {
        setEditingCliente(cliente);
        setIsDialogOpen(true);
    };

    const handeAddNew = () => {
        setEditingCliente(null);
        setIsDialogOpen(true);
    };

    const filteredClientes = clientes.filter((cli: Cliente) => {
        const search = searchTerm.toLowerCase();
        const rs = cli.razon_social?.toLowerCase() || '';
        const nf = cli.nombre_fantasia?.toLowerCase() || '';
        const rut = cli.rut || '';
        return rs.includes(search) || nf.includes(search) || rut.includes(search);
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Building2 className="h-8 w-8" />
                        Clientes
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Gestiona la cartera de empresas o particulares a los que prestas servicios.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => setIsBulkDialogOpen(true)} variant="outline" className="border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 h-11">
                        Carga Masiva
                    </Button>
                    <Button onClick={handeAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Añadir Cliente
                    </Button>
                </div>
            </div>

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
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Cargando clientes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredClientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No se encontraron clientes activos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClientes.map((emp: Cliente) => (
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
                                                    onClick={() => handleEdit(emp)}
                                                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
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

            <ClienteFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                clienteToEdit={editingCliente}
            />

            <ClienteBulkImportDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
            />
        </div>
    );
}
