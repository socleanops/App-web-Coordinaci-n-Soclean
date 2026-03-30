export interface NominaFuncionario {
    id: string;
    nombreCompleto: string;
    cedula: string;
    totalHoras: number;
    horasNocturnas: number;
    horasFeriado: number;
    diasTrabajados: number;
    faltas: number;
    certificados: number;
}

export function procesarNomina(asistencias: any[], searchTerm: string = ''): NominaFuncionario[] {
    const agrupar: Record<string, NominaFuncionario> = {};

    asistencias.forEach(a => {
        const funcId = a.funcionario_id;
        if (!agrupar[funcId]) {
            agrupar[funcId] = {
                id: funcId,
                nombreCompleto: `${a.funcionarios?.profiles?.nombre} ${a.funcionarios?.profiles?.apellido}`,
                cedula: a.funcionarios?.cedula || '',
                totalHoras: 0,
                horasNocturnas: 0,
                horasFeriado: 0,
                diasTrabajados: 0,
                faltas: 0,
                certificados: 0
            };
        }

        if (a.estado === 'presente' || a.estado === 'tardanza' || a.estado === 'salida_anticipada') {
            agrupar[funcId].diasTrabajados += 1;

            let hours = 0;
            let nightHours = 0;

            if (a.hora_entrada_registrada && a.hora_salida_registrada) {
                const start = new Date(a.hora_entrada_registrada);
                const end = new Date(a.hora_salida_registrada);

                hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

                // Precision: iterate in 15-minute blocks for accurate nocturnal calculation
                const current = new Date(start.getTime());
                while (current < end) {
                    const h = current.getHours();
                    if (h >= 22 || h < 6) nightHours += 0.25;
                    current.setTime(current.getTime() + 15 * 60 * 1000); // +15 min
                }
            } else if (a.horarios?.hora_entrada && a.horarios?.hora_salida) {
                const [hIn, mIn] = a.horarios.hora_entrada.split(':').map(Number);
                const [hOut, mOut] = a.horarios.hora_salida.split(':').map(Number);

                let endHours = hOut + mOut / 60;
                const startHours = hIn + mIn / 60;

                if (endHours < startHours) endHours += 24;
                hours = endHours - startHours;

                // 15-minute precision for schedule-based calculation
                for (let mins = startHours * 60; mins < endHours * 60; mins += 15) {
                    const actualHour = Math.floor(mins / 60) % 24;
                    if (actualHour >= 22 || actualHour < 6) nightHours += 0.25;
                }
            }

            agrupar[funcId].totalHoras += Math.max(0, hours);
            agrupar[funcId].horasNocturnas += Math.max(0, nightHours);

            // Feriados de Uruguay (fijos + móviles 2026)
            const FERIADOS_UY = [
                '01-01', '01-06', '02-16', '02-17', '04-06', '04-07', '04-08', '04-09', '04-10',
                '04-19', '05-01', '05-18', '06-19', '07-18', '08-25', '10-12', '11-02', '12-25'
            ];
            const mmdd = a.fecha?.substring(5, 10);
            if (mmdd && FERIADOS_UY.includes(mmdd)) {
                agrupar[funcId].horasFeriado += Math.max(0, hours);
            }

        } else if (a.estado === 'ausente') {
            agrupar[funcId].faltas += 1;
        } else if (a.estado === 'certificado') {
            agrupar[funcId].certificados += 1;
        }
    });

    return Object.values(agrupar).filter(f => {
        const search = searchTerm.toLowerCase();
        return f.nombreCompleto.toLowerCase().includes(search) || f.cedula.includes(search);
    }).sort((a, b) => b.totalHoras - a.totalHoras);
}
