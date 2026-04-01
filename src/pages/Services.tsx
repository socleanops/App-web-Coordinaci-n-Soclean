import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Search, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ServicioFormDialog } from '@/components/servicios/ServicioFormDialog';
import { useServicios } from '@/hooks/useServicios';
import type { Servicio } from '@/types';

export default function Services() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { getServicios } = useServicios();
    const { data: servicios = [], isLoading } = getServicios;

    const handleEdit = (servicio: Servicio) => {
        setEditingServicio(servicio);
        setIsDialogOpen(true);
    };

    const handeAddNew = () => {
        setEditingServicio(null);
        setIsDialogOpen(true);
    };

    // Performance optimization: Memoize filtered array to prevent O(N) recalculations on every render.
    // We also hoist the searchTerm lowercasing outside the loop so it only runs once per memoization.
    const filteredServicios = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return servicios.filter((serv: Servicio) => {
            const nm = serv.nombre?.toLowerCase() || '';
            const dir = serv.direccion?.toLowerCase() || '';
            // Because fields are joined from the queries
            const clRazon = serv.clientes?.razon_social?.toLowerCase() || '';
            const clFantasia = serv.clientes?.nombre_fantasia?.toLowerCase() || '';
            return nm.includes(search) || dir.includes(search) || clRazon.includes(search) || clFantasia.includes(search);
        });
    }, [servicios, searchTerm]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <MapPin className="h-8 w-8" />
                        Servicios y Locaciones
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Registra los puntos físicos y las tareas de mantenimiento que se realizan para cada cliente.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handeAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Añadir Servicio
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">Servicios Activos</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar locación o Cliente..."
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
                                    <TableHead className="w-[200px]">Cliente a Facturar</TableHead>
                                    <TableHead>Nombre del Servicio / Tarea</TableHead>
                                    <TableHead>Dirección Física</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Cargando servicios en la nube...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredServicios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No se encontraron servicios contratados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredServicios.map((serv: Servicio) => (
                                        <TableRow key={serv.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {serv.clientes?.razon_social || serv.clientes?.nombre || 'Cliente Borrado'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {serv.clientes?.nombre_fantasia ? `(${serv.clientes.nombre_fantasia})` : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{serv.nombre}</div>
                                                {serv.descripcion && <div className="text-xs text-muted-foreground line-clamp-1">{serv.descripcion}</div>}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {serv.direccion || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${serv.estado === 'activo'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                        : 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                    }`}>
                                                    {serv.estado.charAt(0).toUpperCase() + serv.estado.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(serv)}
                                                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Editar servicio"
                                                    title="Editar servicio"
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

            <ServicioFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                servicioToEdit={editingServicio}
            />
        </div>
    );
}
