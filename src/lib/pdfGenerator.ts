import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Factura } from '@/types';

export const generateRegistroPDF = (factura: Factura) => {
    // Inicializar PDF (Vertical, milímetros, formato A4)
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Título Principal
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 60, 114); // Azul oscuro
    doc.text('Control de Horas - Soclean', 14, 20);

    // Información del Documento
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80); // Gris
    
    doc.text(`Nro de Registro: ${factura.numero}`, 14, 30);
    if(factura.periodo) doc.text(`Período: ${factura.periodo}`, 14, 35);
    doc.text(`Desde: ${factura.fecha_emision}  |  Hasta: ${factura.fecha_vencimiento || 'N/A'}`, 14, 40);
    
    // Información del Cliente
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Cliente a Facturar:', 14, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Razón Social: ${factura.clientes?.razon_social || 'Desconocido'}`, 14, 55);
    if(factura.clientes?.rut) doc.text(`RUT: ${factura.clientes?.rut}`, 14, 60);

    // Tabla de Ítems (Conceptos)
    const tableColumn = ["Detalle del Servicio", "Cantidad de Horas"];
    const tableRows: Record<string, unknown>[] = [];
    
    let totalCantidad = 0;

    // Llenar datos de la tabla (usando cast any porque a veces TypeScript molesta con autoTable)
    const items = (factura as unknown as Record<string, unknown>).items || [];
    items.forEach((item: Record<string, unknown>) => {
        const itemData = [
            item.descripcion || 'Sin descripción',
            item.cantidad.toString()
        ];
        totalCantidad += parseFloat(item.cantidad) || 0;
        tableRows.push(itemData);
    });

    // Agregar Fila de Totales
    tableRows.push([{ content: 'Total de Horas Calculadas', styles: { fontStyle: 'bold', halign: 'right' } }, { content: totalCantidad.toString(), styles: { fontStyle: 'bold' } }]);

    (doc as unknown as Record<string, unknown>).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        styles: {
            fontSize: 10,
            cellPadding: 4,
        },
        headStyles: {
            fillColor: [30, 60, 114],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
    });

    // Guardar el PDF y simular descarga
    doc.save(`Registro_Horas_${factura.numero}.pdf`);
};
