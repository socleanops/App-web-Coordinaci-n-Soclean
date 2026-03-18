import { useState, useMemo, memo } from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Printer, KeyRound, Stethoscope } from 'lucide-react';
import { FuncionarioPrintDialog } from './FuncionarioPrintDialog';
import type { Funcionario } from '@/types';

interface FuncionariosTableProps {
    employees: Funcionario[];
    isLoading: boolean;
    onEdit: (funcionario: Funcionario) => void;
    onResetPassword: (funcionario: Funcionario) => void;
    onCertificaciones: (funcionario: Funcionario) => void;
}

/**
 * Tabla virtualizada de funcionarios.
 * Optimizada con React.memo para prevenir re-renderizados innecesarios.
 */
export const FuncionariosTable = memo(function FuncionariosTable({ employees, isLoading, onEdit, onResetPassword, onCertificaciones }: FuncionariosTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    // Optimize array filtering by memoizing it to prevent recalculation on every render
    const filteredEmployees = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        return employees.filter((emp) => {
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

    interface RowProps {
        filteredEmployees: Funcionario[];
        onEdit: (funcionario: Funcionario) => void;
        onResetPassword: (funcionario: Funcionario) => void;
        onCertificaciones: (funcionario: Funcionario) => void;
        dateFormatter: Intl.DateTimeFormat;
    }

    // Define Row outside to ensure stable reference, passing data via rowProps
    const rowProps = useMemo<RowProps>(() => ({
        filteredEmployees,
        onEdit,
        onResetPassword,
        onCertificaciones,
        dateFormatter
    }), [filteredEmployees, onEdit, onResetPassword, onCertificaciones, dateFormatter]);

    const Row = ({ index, style, ariaAttributes, filteredEmployees, onEdit, onResetPassword, onCertificaciones, dateFormatter }: RowComponentProps & RowProps): React.ReactElement => {
        const emp = filteredEmployees[index];
        return (
            <div style={style} {...ariaAttributes} className="flex w-full border-b border-slate-200 dark:border-slate-800 hover:bg-muted/30 transition-colors group">
                <div className="flex-1 min-w-0 px-4 py-3 w-[200px]">
                    <div className="font-medium">{emp.profiles?.nombre} {emp.profiles?.apellido}</div>
                    <div className="text-xs text-muted-foreground">{emp.profiles?.email}</div>
                </div>
                <div className="w-32 px-4 py-3 text-muted-foreground">{emp.cedula}</div>
                <div className="w-32 px-4 py-3">{emp.cargo}</div>
                <div className="w-24 px-4 py-3">
                    <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md border border-secondary/30">
                        {emp.departamentos?.nombre || 'N/A'}
                    </span>
                </div>
                <div className="w-24 px-4 py-3 text-muted-foreground text-sm">
                    {dateFormatter.format(new Date(emp.fecha_ingreso))}
                </div>
                <div className="w-24 px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.estado === 'activo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                        emp.estado === 'inactivo' ? 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                            emp.estado === 'vacaciones' ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                        {emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)}
                    </span>
                </div>
                <div className="w-32 px-4 py-3 text-right whitespace-nowrap">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCertificaciones(emp)}
                        className="text-muted-foreground hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Certificaciones Médicas"
                    >
                        <Stethoscope className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResetPassword(emp)}
                        className="text-muted-foreground hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Forzar Reseteo de Contraseña"
                    >
                        <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(emp)}
                        className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar Ficha"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

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
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-background/50 overflow-hidden">
                    {/* Header */}
                    <div className="flex w-full bg-muted/50 border-b border-slate-200 dark:border-slate-800 font-medium text-sm text-muted-foreground">
                        <div className="flex-1 min-w-0 px-4 py-3 w-[200px]">Funcionario</div>
                        <div className="w-32 px-4 py-3">Cédula</div>
                        <div className="w-32 px-4 py-3">Cargo</div>
                        <div className="w-24 px-4 py-3">Dpto.</div>
                        <div className="w-24 px-4 py-3">Ingreso</div>
                        <div className="w-24 px-4 py-3">Estado</div>
                        <div className="w-32 px-4 py-3 text-right">Acciones</div>
                    </div>
                    
                    {/* Virtualized Body */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                            Cargando información...
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                            No se encontraron funcionarios.
                        </div>
                    ) : (
                        <List<object>
                            defaultHeight={400}
                            rowCount={filteredEmployees.length}
                            rowHeight={64}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            rowComponent={Row as any}
                            rowProps={rowProps}
                            style={{ width: '100%' }}
                        />
                    )}
                </div>
            </CardContent>

            <FuncionarioPrintDialog
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                employees={filteredEmployees}
            />
        </Card>
    );
});
