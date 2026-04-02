import type { Asistencia } from '@/types';

export interface ReportRow {
    fecha: string;
    funcionario: string;
    servicio: string;
    entrada: string;
    salida: string;
    horasDecimal: number;
    horasDisplay: string;
}

export interface FacturacionResultado {
    rows: ReportRow[];
    totalHoras: number;
}

export function procesarFacturacion(data: Asistencia[]): FacturacionResultado {
    const rows: ReportRow[] = [];
    let sumatoriaHorasDecimal = 0;

    data.forEach(a => {
        const est = a.estado;
        // Calculamos solo presentes o justificados para facturación
        if (est === 'presente' || est === 'tardanza' || est === 'salida_anticipada' || est === 'justificado') {
            const servicioNombre = a.horarios?.servicios?.nombre || 'Servicio Desconocido';
            const nombreFunc = `${a.funcionarios?.profiles?.nombre || ''} ${a.funcionarios?.profiles?.apellido || ''}`.trim();
            const hEntrada = a.horarios?.hora_entrada?.substring(0, 5) || '--:--';
            const hSalida = a.horarios?.hora_salida?.substring(0, 5) || '--:--';
            
            let horasDecimal = 0;
            let horasDisplay = '0 hs';

            if (hEntrada !== '--:--' && hSalida !== '--:--') {
                const [eh, em] = hEntrada.split(':').map(Number);
                const [sh, sm] = hSalida.split(':').map(Number);
                
                let totalHoras = (sh + sm / 60) - (eh + em / 60);
                if (totalHoras < 0) totalHoras += 24; // Turnos noche
                
                horasDecimal = totalHoras;
                
                const h = Math.floor(horasDecimal);
                const m = Math.round((horasDecimal - h) * 60);
                horasDisplay = m === 0 ? `${h}h` : `${h}h ${m}m`;
            }

            sumatoriaHorasDecimal += horasDecimal;

            rows.push({
                fecha: a.fecha,
                funcionario: nombreFunc,
                servicio: servicioNombre,
                entrada: hEntrada,
                salida: hSalida,
                horasDecimal,
                horasDisplay
            });
        }
    });

    return {
        rows,
        totalHoras: sumatoriaHorasDecimal
    };
}

export interface FacturaItemBasico {
    cantidad: number;
    precio_unitario: number;
}

export function calcularTotalesFactura(items: FacturaItemBasico[], descuento: number = 0, impuestoPorcentaje: number = 0) {
    const subtotal = items.reduce((acc, item) => acc + (item.cantidad * Math.max(0, item.precio_unitario)), 0);
    const subtotalConDescuento = Math.max(0, subtotal - descuento);
    const impuesto = subtotalConDescuento * (impuestoPorcentaje / 100);
    const total = subtotalConDescuento + impuesto;
    return { subtotal, descuento, impuesto, total };
}
