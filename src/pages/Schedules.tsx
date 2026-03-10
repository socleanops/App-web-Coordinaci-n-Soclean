import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Search, CalendarClock, Trash2, Smartphone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { HorarioFormDialog } from '@/components/horarios/HorarioFormDialog';
import { useHorarios } from '@/hooks/useHorarios';
import type { Horario } from '@/types';
import { toast } from 'sonner';

const DIAS_MAP: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

export default function Schedules() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { getHorarios, deleteHorario } = useHorarios();
    const { data: horarios = [], isLoading } = getHorarios;

    const handleEdit = (horario: Horario) => {
        setEditingHorario(horario);
        setIsDialogOpen(true);
    };

    const handeAddNew = () => {
        setEditingHorario(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este horario asignado?')) {
            try {
                await deleteHorario.mutateAsync(id);
                toast.success('Horario eliminado');
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : 'Error al eliminar');
            }
        }
    };

    const filteredHorarios = horarios.filter((h: Horario) => {
        const search = searchTerm.toLowerCase();
        const func = h.funcionarios?.profiles?.nombre?.toLowerCase() + ' ' + h.funcionarios?.profiles?.apellido?.toLowerCase();
        const serv = h.servicios?.clientes?.razon_social?.toLowerCase() + ' ' + h.servicios?.nombre?.toLowerCase();
        return func.includes(search) || serv.includes(search);
    });

    const openWhatsApp = (h: Horario) => {
        const nombreFuncionario = `${h.funcionarios?.profiles?.nombre} ${h.funcionarios?.profiles?.apellido}`;
        const cliente = h.servicios?.clientes?.razon_social || '';
        const direccion = h.servicios?.direccion || '';
        const dia = DIAS_MAP[h.dia_semana] || '';
        const entrada = h.hora_entrada.substring(0, 5);
        const salida = h.hora_salida.substring(0, 5);

        const text = `Hola *${nombreFuncionario}*, te informamos de tu coordinación de servicio:\n\n*📌 Cliente:* ${cliente}\n*📍 Ubicación:* ${direccion}\n*🗓 Día:* ${dia}\n*⌚ Horario:* ${entrada} hs a ${salida} hs\n\nPor favor, confirmá la recepción de este mensaje. ¡Gracias!`;

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <CalendarClock className="h-8 w-8" />
                        Horarios y Turnos
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Programa qué días de la semana un empleado cubre el servicio de cierto cliente.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handeAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Asignar Horario
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
                        <CardTitle className="text-lg flex-1">Cronograma de Asignaciones</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por empleado o cliente..."
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
                                    <TableHead>Día y Franja</TableHead>
                                    <TableHead>Funcionario Asignado</TableHead>
                                    <TableHead>Cliente y Ubicación</TableHead>
                                    <TableHead>Vigencia</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Cargando horarios de trabajo...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredHorarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Aún no hay horarios o turnos asigandos al personal.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredHorarios.map((h: Horario) => (
                                        <TableRow key={h.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-bold text-coreops-primary dark:text-blue-400">
                                                    {DIAS_MAP[h.dia_semana]}
                                                </div>
                                                <div className="text-sm font-mono text-slate-600 dark:text-slate-300">
                                                    {h.hora_entrada.substring(0, 5)} - {h.hora_salida.substring(0, 5)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                                    {h.funcionarios?.profiles?.nombre} {h.funcionarios?.profiles?.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{h.funcionarios?.cargo}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{h.servicios?.clientes?.razon_social}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {h.servicios?.nombre} | {h.servicios?.direccion}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-muted-foreground">
                                                    Desde: {new Date(h.vigente_desde).toLocaleDateString()}
                                                    {h.vigente_hasta ? <><br />Hasta: {new Date(h.vigente_hasta).toLocaleDateString()}</> : ''}
                                                </div>
                                                {!h.vigente_hasta && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Activo Indefinido</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openWhatsApp(h)}
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        title="Enviar por WhatsApp"
                                                    >
                                                        <Smartphone className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(h)}
                                                        className="text-muted-foreground hover:text-primary"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(h.id)}
                                                        className="text-muted-foreground hover:text-red-500"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

            <HorarioFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                horarioToEdit={editingHorario}
            />
        </div>
    );
}
