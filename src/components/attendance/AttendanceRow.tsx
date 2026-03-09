import { TableCell, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ESTADOS_MAP } from './constants';
import type { Asistencia } from '@/types';

interface AttendanceRowProps {
    asistencia: Asistencia;
    onUpdateEstado: (id: string, nuevoEstado: string) => void;
    onUpdateObservaciones: (id: string, nuevaObservacion: string) => void;
}

export function AttendanceRow({ asistencia: a, onUpdateEstado, onUpdateObservaciones }: AttendanceRowProps) {
    return (
        <TableRow key={a.id} className="group hover:bg-muted/30 transition-colors">
            <TableCell>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {a.funcionarios?.profiles?.nombre} {a.funcionarios?.profiles?.apellido}
                </div>
                <div className="text-xs text-muted-foreground">ID: {a.funcionario_id.substring(0, 8)}...</div>
            </TableCell>
            <TableCell>
                <div className="text-xs text-muted-foreground font-semibold line-clamp-1">
                    {a.horarios?.servicios?.clientes?.razon_social}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1">
                    {a.horarios?.servicios?.nombre}
                </div>
            </TableCell>
            <TableCell>
                <div className="text-sm font-mono font-medium text-coreops-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                    {a.horarios?.hora_entrada?.substring(0, 5)} hrs a {a.horarios?.hora_salida?.substring(0, 5)} hrs
                </div>
            </TableCell>
            <TableCell>
                <Select defaultValue={a.estado} onValueChange={(val) => onUpdateEstado(a.id, val)}>
                    <SelectTrigger className={`h-9 w-[150px] text-xs font-semibold border ${ESTADOS_MAP[a.estado].color}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(ESTADOS_MAP).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="max-w-xs">
                <Input
                    defaultValue={a.observaciones || ''}
                    placeholder="Ej: Faltó 1 hora, Salida tarde..."
                    className="h-9 text-xs"
                    onBlur={(e) => {
                        const newVal = e.target.value;
                        if (newVal !== a.observaciones) {
                            onUpdateObservaciones(a.id, newVal);
                        }
                    }}
                />
            </TableCell>
        </TableRow>
    );
}
