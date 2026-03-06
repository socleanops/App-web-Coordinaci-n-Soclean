import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Search, UploadCloud } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FuncionarioFormDialog } from '@/components/funcionarios/FuncionarioFormDialog';
import { FuncionarioBulkImportDialog } from '@/components/funcionarios/FuncionarioBulkImportDialog';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import type { Funcionario } from '@/types';

export default function Employees() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    const { getFuncionarios } = useFuncionarios();
    const { data: employees = [], isLoading } = getFuncionarios;

    const handleEdit = (funcionario: Funcionario) => {
        setEditingFuncionario(funcionario);
        setIsDialogOpen(true);
    };

    const handeAddNew = () => {
        setEditingFuncionario(null);
        setIsDialogOpen(true);
    };

    const filteredEmployees = employees.filter((emp: any) => {
        const search = searchTerm.toLowerCase();
        const n = emp?.profiles?.nombre?.toLowerCase() || '';
        const a = emp?.profiles?.apellido?.toLowerCase() || '';
        const cedula = emp?.cedula || '';
        const cargo = emp?.cargo?.toLowerCase() || '';
        return n.includes(search) || a.includes(search) || cedula.includes(search) || cargo.includes(search);
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Funcionarios</h2>
                    <p className="text-muted-foreground text-sm mt-1">Gestiona el personal, contratos y perfiles de acceso.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="gap-2 bg-white dark:bg-slate-800 shadow-sm hover:shadow transition-all h-11 shrink-0 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                        <UploadCloud className="h-4 w-4 text-coreops-secondary" />
                        <span className="hidden sm:inline">Importar Excel</span>
                    </Button>
                    <Button onClick={handeAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Añadir Funcionario
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">Listado de Personal</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, CI o cargo..."
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
                                    <TableHead className="w-[200px]">Funcionario</TableHead>
                                    <TableHead>Cédula</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Dpto.</TableHead>
                                    <TableHead>Ingreso</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Cargando información...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No se encontraron funcionarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((emp: any) => (
                                        <TableRow key={emp.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-medium">{emp.profiles?.nombre} {emp.profiles?.apellido}</div>
                                                <div className="text-xs text-muted-foreground">{emp.profiles?.email}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{emp.cedula}</TableCell>
                                            <TableCell>{emp.cargo}</TableCell>
                                            <TableCell>
                                                <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md border border-secondary/30">
                                                    {emp.departamentos?.nombre || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(emp.fecha_ingreso).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.estado === 'activo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                    emp.estado === 'inactivo' ? 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                                                        emp.estado === 'vacaciones' ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                            'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
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

            <FuncionarioFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                funcionarioToEdit={editingFuncionario}
            />

            <FuncionarioBulkImportDialog
                open={isBulkOpen}
                onOpenChange={setIsBulkOpen}
            />
        </div>
    );
}
