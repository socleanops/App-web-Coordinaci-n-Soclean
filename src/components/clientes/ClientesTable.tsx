import { useState, memo, useMemo } from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pencil } from 'lucide-react';
import type { Cliente } from '@/types';

interface ClientesTableProps {
    clientes: Cliente[];
    isLoading: boolean;
    onEdit: (cliente: Cliente) => void;
}

interface RowProps {
    filteredClientes: Cliente[];
    onEdit: (cliente: Cliente) => void;
}

/**
 * Tabla virtualizada de clientes.
 * Optimizada con React.memo para prevenir re-renderizados innecesarios.
 */
export const ClientesTable = memo(function ClientesTable({ clientes, isLoading, onEdit }: ClientesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClientes = useMemo(() => {
        return clientes.filter((cli) => {
            const search = searchTerm.toLowerCase();
            const rs = cli.razon_social?.toLowerCase() || '';
            const nf = cli.nombre_fantasia?.toLowerCase() || '';
            const rut = cli.rut || '';
            return rs.includes(search) || nf.includes(search) || rut.includes(search);
        });
    }, [clientes, searchTerm]);

    // Define Row outside to ensure stable reference, passing data via rowProps
    const rowProps = useMemo<RowProps>(() => ({
        filteredClientes,
        onEdit
    }), [filteredClientes, onEdit]);

    const Row = ({ index, style, ariaAttributes, filteredClientes, onEdit }: RowComponentProps & RowProps): React.ReactElement => {
        const emp = filteredClientes[index];
        return (
            <div style={style} {...ariaAttributes} className="flex w-full border-b border-slate-200 dark:border-slate-800 hover:bg-muted/30 transition-colors group">
                <div className="flex-1 min-w-0 px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{emp.razon_social}</div>
                    <div className="text-xs text-muted-foreground">{emp.nombre_fantasia || 'Sin nombre fantasía'}</div>
                </div>
                <div className="w-32 px-4 py-3 text-muted-foreground font-mono text-sm">{emp.rut}</div>
                <div className="w-32 px-4 py-3 text-muted-foreground text-sm">{emp.contacto_principal || '-'}</div>
                <div className="w-24 px-4 py-3">
                    <div className="font-semibold text-coreops-primary dark:text-blue-400 text-sm">{emp.frecuencia_visita || '-'}</div>
                    <div className="text-xs text-muted-foreground">{emp.carga_horaria || ''}</div>
                </div>
                <div className="w-40 px-4 py-3">
                    <div className="text-sm">{emp.telefono || '-'}</div>
                    <div className="text-xs text-muted-foreground">{emp.email || '-'}</div>
                </div>
                <div className="w-24 px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.estado === 'activo'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                        {emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)}
                    </span>
                </div>
                <div className="w-16 px-4 py-3 text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(emp)}
                        className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
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
                    {/* Header */}
                    <div className="flex w-full bg-muted/50 border-b border-slate-200 dark:border-slate-800 font-medium text-sm text-muted-foreground">
                        <div className="flex-1 min-w-0 px-4 py-3">Razón Social o Nombre / Fantasía</div>
                        <div className="w-32 px-4 py-3">RUT / Cédula</div>
                        <div className="w-32 px-4 py-3">Contacto</div>
                        <div className="w-24 px-4 py-3">Acuerdo Op.</div>
                        <div className="w-40 px-4 py-3">Teléfono / Email</div>
                        <div className="w-24 px-4 py-3">Estado</div>
                        <div className="w-16 px-4 py-3 text-right">Acciones</div>
                    </div>
                    
                    {/* Virtualized Body */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                            Cargando clientes...
                        </div>
                    ) : filteredClientes.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                            No se encontraron clientes activos.
                        </div>
                    ) : (
                        <List<object>
                            defaultHeight={400}
                            rowCount={filteredClientes.length}
                            rowHeight={64}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            rowComponent={Row as any}
                            rowProps={rowProps}
                            style={{ width: '100%' }}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
