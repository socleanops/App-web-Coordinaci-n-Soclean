import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import type { Horario } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    horarios: Horario[];
}

const DIAS_MAP: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

const dateFormatter = new Intl.DateTimeFormat('es-UY');

export function HorarioPrintDialog({ open, onOpenChange, horarios }: Props) {
    const [selectedColumns, setSelectedColumns] = useState({
        dia: true,
        franja: true,
        funcionario: true,
        cliente: true,
        ubicacion: true,
        vigencia: false
    });

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const dateStr = dateFormatter.format(new Date());

        const uniqueFuncionarios = new Set(horarios.map(h => h.funcionario_id)).size;
        const uniqueServicios = new Set(horarios.map(h => h.servicio_id)).size;

        let tableHtml = `
      <html>
        <head>
          <title>Coordinación de Horarios</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { margin-bottom: 5px; }
            .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #e9ecef; }
            .summary ul { margin: 5px 0 0 0; padding-left: 20px; color: #444; font-size: 14px; }
            p { color: #555; font-size: 14px; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <h2>Reporte: Coordinación de Horarios</h2>
          <div class="summary">
            <p><strong>Resumen de la coordinación emitida el ${dateStr}:</strong></p>
            <ul>
              <li><strong>Total de Asignaciones (Horarios):</strong> ${horarios.length}</li>
              <li><strong>Funcionarios distintos asignados:</strong> ${uniqueFuncionarios}</li>
              <li><strong>Servicios distintos coordinados:</strong> ${uniqueServicios}</li>
            </ul>
          </div>
          <table>
            <thead>
              <tr>
                ${selectedColumns.dia ? '<th>Día</th>' : ''}
                ${selectedColumns.franja ? '<th>Horario</th>' : ''}
                ${selectedColumns.funcionario ? '<th>Funcionario Asignado</th>' : ''}
                ${selectedColumns.cliente ? '<th>Cliente / Servicio</th>' : ''}
                ${selectedColumns.ubicacion ? '<th>Ubicación</th>' : ''}
                ${selectedColumns.vigencia ? '<th>Vigencia</th>' : ''}
              </tr>
            </thead>
            <tbody>
        `;

        // Sort by day optionally, or just use current view
        const sortedHorarios = [...horarios].sort((a, b) => a.dia_semana - b.dia_semana);

        sortedHorarios.forEach(h => {
            const funcionario = `${h.funcionarios?.profiles?.nombre || ''} ${h.funcionarios?.profiles?.apellido || ''}`;
            const cliente = h.servicios?.clientes?.razon_social || '';
            const servicio = h.servicios?.nombre || '';
            const ubicacion = h.servicios?.direccion || '';
            const dia = DIAS_MAP[h.dia_semana] || '';
            const horario = `${h.hora_entrada.substring(0, 5)} - ${h.hora_salida.substring(0, 5)}`;
            const vigencia = `Desde: ${dateFormatter.format(new Date(h.vigente_desde))} ${h.vigente_hasta ? `Hasta: ${dateFormatter.format(new Date(h.vigente_hasta))}` : ' (Indefinido)'}`;

            tableHtml += `
              <tr>
                ${selectedColumns.dia ? `<td>${dia}</td>` : ''}
                ${selectedColumns.franja ? `<td>${horario}</td>` : ''}
                ${selectedColumns.funcionario ? `<td>${funcionario}</td>` : ''}
                ${selectedColumns.cliente ? `<td>${cliente} (${servicio})</td>` : ''}
                ${selectedColumns.ubicacion ? `<td>${ubicacion}</td>` : ''}
                ${selectedColumns.vigencia ? `<td>${vigencia}</td>` : ''}
              </tr>
            `;
        });

        tableHtml += `
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

        printWindow.document.write(tableHtml);
        printWindow.document.close();
        onOpenChange(false);
    };

    const toggleCol = (col: keyof typeof selectedColumns) => {
        setSelectedColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Imprimir Coordinación</DialogTitle>
                    <DialogDescription>
                        Selecciona los datos que deseas incluir en el reporte de programación.
                        Imprimirá los {horarios.length} horarios filtrados actualmente, ordenados por día.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_dia" checked={selectedColumns.dia} onCheckedChange={() => toggleCol('dia')} />
                        <Label htmlFor="col_dia">Día de la semana</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_franja" checked={selectedColumns.franja} onCheckedChange={() => toggleCol('franja')} />
                        <Label htmlFor="col_franja">Horario (Entrada/Salida)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_funcionario" checked={selectedColumns.funcionario} onCheckedChange={() => toggleCol('funcionario')} />
                        <Label htmlFor="col_funcionario">Funcionario Asignado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_cliente" checked={selectedColumns.cliente} onCheckedChange={() => toggleCol('cliente')} />
                        <Label htmlFor="col_cliente">Cliente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_ubicacion" checked={selectedColumns.ubicacion} onCheckedChange={() => toggleCol('ubicacion')} />
                        <Label htmlFor="col_ubicacion">Dirección</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_vigencia" checked={selectedColumns.vigencia} onCheckedChange={() => toggleCol('vigencia')} />
                        <Label htmlFor="col_vigencia">Vigencia (Desde/Hasta)</Label>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimir Coordinación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
