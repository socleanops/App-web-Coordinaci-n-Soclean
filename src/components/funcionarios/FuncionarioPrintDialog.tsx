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
import { escapeHtml } from '@/lib/utils';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employees: any[];
}

export function FuncionarioPrintDialog({ open, onOpenChange, employees }: Props) {
    const [selectedColumns, setSelectedColumns] = useState({
        nombre: true,
        cedula: true,
        cargo: true,
        departamento: true,
        fecha_ingreso: false,
        direccion: false,
        estado: true,
        email: false
    });

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const dateStr = new Date().toLocaleDateString();

        const activeCount = employees.filter(e => e.estado === 'activo').length;
        const deptsCount = new Set(employees.map(e => e.departamentos?.nombre).filter(Boolean)).size;

        let tableHtml = `
      <html>
        <head>
          <title>Listado de Funcionarios</title>
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
          <h2>Reporte: Listado de Personal</h2>
          <div class="summary">
            <p><strong>Resumen del reporte emitido el ${dateStr}:</strong></p>
            <ul>
              <li><strong>Total de Funcionarios:</strong> ${employees.length}</li>
              <li><strong>Funcionarios Activos:</strong> ${activeCount}</li>
              <li><strong>Departamentos representados:</strong> ${deptsCount}</li>
            </ul>
          </div>
          <table>
            <thead>
              <tr>
                ${selectedColumns.nombre ? '<th>Nombre Completo</th>' : ''}
                ${selectedColumns.cedula ? '<th>Cédula</th>' : ''}
                ${selectedColumns.cargo ? '<th>Cargo</th>' : ''}
                ${selectedColumns.departamento ? '<th>Departamento</th>' : ''}
                ${selectedColumns.fecha_ingreso ? '<th>F. Ingreso</th>' : ''}
                ${selectedColumns.direccion ? '<th>Dirección</th>' : ''}
                ${selectedColumns.email ? '<th>Email</th>' : ''}
                ${selectedColumns.estado ? '<th>Estado</th>' : ''}
              </tr>
            </thead>
            <tbody>
        `;

        employees.forEach(emp => {
            const nombre = escapeHtml(`${emp.profiles?.nombre || ''} ${emp.profiles?.apellido || ''}`);
            const cedula = escapeHtml(emp.cedula || '');
            const cargo = escapeHtml(emp.cargo || '');
            const departamento = escapeHtml(emp.departamentos?.nombre || '');
            const fecha_ingreso = escapeHtml(emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : '');
            const direccion = escapeHtml(emp.direccion || '');
            const email = escapeHtml(emp.profiles?.email || '');
            const estado = escapeHtml(emp.estado || '');

            tableHtml += `
              <tr>
                ${selectedColumns.nombre ? `<td>${nombre}</td>` : ''}
                ${selectedColumns.cedula ? `<td>${cedula}</td>` : ''}
                ${selectedColumns.cargo ? `<td>${cargo}</td>` : ''}
                ${selectedColumns.departamento ? `<td>${departamento}</td>` : ''}
                ${selectedColumns.fecha_ingreso ? `<td>${fecha_ingreso}</td>` : ''}
                ${selectedColumns.direccion ? `<td>${direccion}</td>` : ''}
                ${selectedColumns.email ? `<td>${email}</td>` : ''}
                ${selectedColumns.estado ? `<td>${estado}</td>` : ''}
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
                    <DialogTitle>Imprimir Listado</DialogTitle>
                    <DialogDescription>
                        Selecciona las columnas que deseas incluir en el reporte de impresión para los {employees.length} funcionarios filtrados actualmente.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_nombre" checked={selectedColumns.nombre} onCheckedChange={() => toggleCol('nombre')} />
                        <Label htmlFor="col_nombre">Nombre y Apellido</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_cedula" checked={selectedColumns.cedula} onCheckedChange={() => toggleCol('cedula')} />
                        <Label htmlFor="col_cedula">Cédula</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_cargo" checked={selectedColumns.cargo} onCheckedChange={() => toggleCol('cargo')} />
                        <Label htmlFor="col_cargo">Cargo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_departamento" checked={selectedColumns.departamento} onCheckedChange={() => toggleCol('departamento')} />
                        <Label htmlFor="col_departamento">Departamento</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_fecha_ingreso" checked={selectedColumns.fecha_ingreso} onCheckedChange={() => toggleCol('fecha_ingreso')} />
                        <Label htmlFor="col_fecha_ingreso">Fecha de Ingreso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_direccion" checked={selectedColumns.direccion} onCheckedChange={() => toggleCol('direccion')} />
                        <Label htmlFor="col_direccion">Dirección</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_email" checked={selectedColumns.email} onCheckedChange={() => toggleCol('email')} />
                        <Label htmlFor="col_email">Correo Electrónico</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="col_estado" checked={selectedColumns.estado} onCheckedChange={() => toggleCol('estado')} />
                        <Label htmlFor="col_estado">Estado</Label>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimir Documento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
