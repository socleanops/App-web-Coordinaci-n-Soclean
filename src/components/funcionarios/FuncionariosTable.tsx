import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Printer, KeyRound, Stethoscope, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { Funcionario } from '@/types';
import { FuncionarioPrintDialog } from './FuncionarioPrintDialog';


interface FuncionariosTableProps {
    employees: Funcionario[];
    isLoading: boolean;
    onEdit: (funcionario: Funcionario) => void;
    onResetPassword: (funcionario: Funcionario) => void;
    onCertificaciones: (funcionario: Funcionario) => void;
    onDelete?: (funcionario: Funcionario) => void;
}


export function FuncionariosTable({ employees, isLoading, onEdit, onResetPassword, onCertificaciones, onDelete }: FuncionariosTableProps) {
    const { role } = useAuthStore();
    const isSuperAdmin = role?.toLowerCase() === 'superadmin';
    const [searchTerm, setSearchTerm] = useState('');
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    // Optimize array filtering by memoizing it to prevent recalculation on every render
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp: Funcionario) => {
            const search = searchTerm.toLowerCase();
            const n = emp?.profiles?.nombre?.toLowerCase() || '';
            const a = emp?.profiles?.apellido?.toLowerCase() || '';
            const cedula = emp?.cedula || '';
            const cargo = emp?.cargo?.toLowerCase() || '';
            return n.includes(search) || a.includes(search) || cedula.includes(search) || cargo.includes(search);
        });
    }, [employees, searchTerm]);

    // Pre-instantiate dateFormatter to avoid object allocation in .map()
    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }), []);

    return (
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
                    <Button
                        variant="outline"
                        onClick={() => setIsPrintDialogOpen(true)}
                        disabled={filteredEmployees.length === 0}
                    >
                        <Printer className="h-4 w-4 mr-2" /> Imprimir
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-background/50 overflow-x-auto overflow-y-hidden">
                    <Table className="min-w-[800px]">
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
                                filteredEmployees.map((emp: Funcionario) => (
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
                                            {dateFormatter.format(new Date(emp.fecha_ingreso))}
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
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onCertificaciones(emp)}
                                                className="text-muted-foreground hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Certificaciones Médicas"
                                                aria-label="Certificaciones Médicas"
                                            >
                                                <Stethoscope className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onResetPassword(emp)}
                                                className="text-muted-foreground hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Forzar Reseteo de Contraseña"
                                                aria-label="Forzar Reseteo de Contraseña"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(emp)}
                                                className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Editar Ficha"
                                                aria-label="Editar Ficha"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            {isSuperAdmin && onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm(`¿Estás seguro de eliminar a ${emp.profiles?.nombre} ${emp.profiles?.apellido}? Esta acción es irreversible.`)) {
                                                            onDelete(emp);
                                                        }
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                                    title="Eliminar Funcionario permanentemente"
                                                    aria-label="Eliminar Funcionario"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <FuncionarioPrintDialog
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                employees={filteredEmployees}
            />
        </Card>
    );
}
