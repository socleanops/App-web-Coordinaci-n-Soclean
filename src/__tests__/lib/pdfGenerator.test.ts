import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRegistroPDF } from '@/lib/pdfGenerator';
import { jsPDF } from 'jspdf';

const mockDoc = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
};

vi.mock('jspdf', () => {
    return {
        jsPDF: vi.fn().mockImplementation(function() { return mockDoc; }),
    };
});

vi.mock('jspdf-autotable', () => ({}));

describe('pdfGenerator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates a PDF with the correct data', () => {
        const mockFactura: any = {
            numero: '123',
            periodo: 'Marzo 2026',
            fecha_emision: '2026-03-01',
            fecha_vencimiento: '2026-03-15',
            clientes: {
                razon_social: 'Empresa Test',
                rut: '123456789012'
            },
            items: [
                { descripcion: 'Servicio 1', cantidad: 10 },
                { descripcion: 'Servicio 2', cantidad: 5 }
            ]
        };

        generateRegistroPDF(mockFactura);

        expect(jsPDF).toHaveBeenCalledWith('p', 'mm', 'a4');

        expect(mockDoc.text).toHaveBeenCalledWith('Control de Horas - Soclean', 14, 20);
        expect(mockDoc.text).toHaveBeenCalledWith('Nro de Registro: 123', 14, 30);
        expect(mockDoc.text).toHaveBeenCalledWith('Período: Marzo 2026', 14, 35);
        expect(mockDoc.text).toHaveBeenCalledWith('Desde: 2026-03-01  |  Hasta: 2026-03-15', 14, 40);
        expect(mockDoc.text).toHaveBeenCalledWith('Razón Social: Empresa Test', 14, 55);
        expect(mockDoc.text).toHaveBeenCalledWith('RUT: 123456789012', 14, 60);

        expect(mockDoc.autoTable).toHaveBeenCalled();

        const autoTableArgs = mockDoc.autoTable.mock.calls[0][0];
        expect(autoTableArgs.head).toEqual([["Detalle del Servicio", "Cantidad de Horas"]]);
        expect(autoTableArgs.body).toEqual([
            ['Servicio 1', '10'],
            ['Servicio 2', '5'],
            [{ content: 'Total de Horas Calculadas', styles: { fontStyle: 'bold', halign: 'right' } }, { content: '15', styles: { fontStyle: 'bold' } }]
        ]);

        expect(mockDoc.save).toHaveBeenCalledWith('Registro_Horas_123.pdf');
    });

    it('handles missing optional fields gracefully', () => {
        const mockFactura: any = {
            numero: '456',
            fecha_emision: '2026-03-01',
        };

        generateRegistroPDF(mockFactura);

        expect(mockDoc.text).toHaveBeenCalledWith('Nro de Registro: 456', 14, 30);
        expect(mockDoc.text).not.toHaveBeenCalledWith(expect.stringContaining('Período:'), expect.any(Number), expect.any(Number));
        expect(mockDoc.text).toHaveBeenCalledWith('Desde: 2026-03-01  |  Hasta: N/A', 14, 40);

        expect(mockDoc.text).toHaveBeenCalledWith('Razón Social: Desconocido', 14, 55);
        expect(mockDoc.text).not.toHaveBeenCalledWith(expect.stringContaining('RUT:'), expect.any(Number), expect.any(Number));

        const autoTableArgs = mockDoc.autoTable.mock.calls[0][0];
        expect(autoTableArgs.body).toEqual([
            [{ content: 'Total de Horas Calculadas', styles: { fontStyle: 'bold', halign: 'right' } }, { content: '0', styles: { fontStyle: 'bold' } }]
        ]);

        expect(mockDoc.save).toHaveBeenCalledWith('Registro_Horas_456.pdf');
    });

    it('handles items with missing descripcion and missing cantidad correctly based on actual implementation', () => {
        const mockFactura: any = {
            numero: '789',
            fecha_emision: '2026-03-01',
            items: [
                { cantidad: 'invalid' }
            ]
        };

        generateRegistroPDF(mockFactura);

        const autoTableArgs = mockDoc.autoTable.mock.calls[0][0];
        expect(autoTableArgs.body).toEqual([
            ['Sin descripción', 'invalid'],
            [{ content: 'Total de Horas Calculadas', styles: { fontStyle: 'bold', halign: 'right' } }, { content: '0', styles: { fontStyle: 'bold' } }]
        ]);
    });
});
