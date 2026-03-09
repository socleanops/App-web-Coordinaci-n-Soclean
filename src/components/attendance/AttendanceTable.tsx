import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { Asistencia } from '@/types';
import { AttendanceRow } from './AttendanceRow';

interface AttendanceTableProps {
    asistencias: Asistencia[];
    isLoading: boolean;
    isPendingGenerar: boolean;
    onGenerarPlanilla: () => void;
    onUpdateEstado: (id: string, nuevoEstado: string) => void;
    onUpdateObservaciones: (id: string, nuevaObservacion: string) => void;
}

export function AttendanceTable({
    asistencias,
    isLoading,
    isPendingGenerar,
    onGenerarPlanilla,
    onUpdateEstado,
    onUpdateObservaciones,
}: AttendanceTableProps) {
    return (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Cliente / Servicio</TableHead>
                    <TableHead>Horario Coordinado</TableHead>
                    <TableHead>Estado Cumplimiento</TableHead>
                    <TableHead>Observaciones / Diferencia Horaria</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            Buscando registros biométricos del día...
                        </TableCell>
                    </TableRow>
                ) : asistencias.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <AlertCircle className="h-10 w-10 text-slate-400" />
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No hay turnos registrados para la fecha seleccionada</p>
                                    <p className="text-sm">Genera la planilla para volcar los horarios teóricos correspondientes a este día y poder chequearlos.</p>
                                </div>
                                <Button
                                    onClick={onGenerarPlanilla}
                                    disabled={isPendingGenerar}
                                    className="mt-2"
                                >
                                    {isPendingGenerar ? 'Generando...' : 'Generar Planilla del Día'}
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    asistencias.map((a: Asistencia) => (
                        <AttendanceRow
                            key={a.id}
                            asistencia={a}
                            onUpdateEstado={onUpdateEstado}
                            onUpdateObservaciones={onUpdateObservaciones}
                        />
                    ))
                )}
            </TableBody>
        </Table>
    );
}
