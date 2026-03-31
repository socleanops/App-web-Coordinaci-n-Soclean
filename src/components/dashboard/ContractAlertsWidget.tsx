import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { AlertTriangle, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Funcionario } from '@/types';

type Alertado = Funcionario & { dias_transcurridos: number; fecha_vencimiento_prueba: Date };

export function ContractAlertsWidget() {
    const { getFuncionarios } = useFuncionarios();

    const alertas = useMemo(() => {
        const funcionarios = getFuncionarios.data || [];
        const today = new Date();
        const approaching: Alertado[] = [];
        
        funcionarios.forEach((f: Funcionario) => {
            if (f.estado !== 'activo' || !f.fecha_ingreso) return;
            
            const ingreso = parseISO(f.fecha_ingreso);
            const days = differenceInDays(today, ingreso);
            
            // We want to alert when the employee is between 80 and 95 days of their trial
            if (days >= 80 && days <= 95) {
                approaching.push({
                    ...f,
                    dias_transcurridos: days,
                    fecha_vencimiento_prueba: new Date(ingreso.getTime() + 90 * 24 * 60 * 60 * 1000)
                });
            }
        });

        // Sort by how close they are to 90
        return approaching.sort((a, b) => {
            const diffA = Math.abs(90 - a.dias_transcurridos);
            const diffB = Math.abs(90 - b.dias_transcurridos);
            return diffA - diffB;
        });

    }, [getFuncionarios.data]);

    if (getFuncionarios.isLoading || alertas.length === 0) {
        return null;
    }

    return (
        <Card className="mb-10 border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-100/50 dark:bg-orange-900/30 pb-3 border-b border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-400">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas de Evaluación (90 Días)
                    </CardTitle>
                    <div className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs font-bold px-2.5 py-1 rounded-full">
                        {alertas.length} Funcionario{alertas.length > 1 ? 's' : ''}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {alertas.map((f, i) => {
                        const isExpired = f.dias_transcurridos > 90;
                        const isExactly = f.dias_transcurridos === 90;

                        return (
                            <div key={f.id || i} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-orange-100/30 dark:hover:bg-orange-900/20 transition-colors gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full mt-1 ${isExpired ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : isExactly ? 'bg-orange-200 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {isExpired ? <Clock className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                            {f.profiles?.nombre} {f.profiles?.apellido}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                                            <span className="font-mono text-xs bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">CI: {f.cedula}</span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Ingreso: {format(parseISO(f.fecha_ingreso), "d 'de' MMMM, yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end sm:items-center w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-2xl font-black ${isExpired ? 'text-red-600 dark:text-red-400' : isExactly ? 'text-orange-600 dark:text-orange-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                            {f.dias_transcurridos}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">días</span>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider mt-1 text-slate-400">
                                        {isExpired ? 'Vencido' : isExactly ? 'Vence Hoy' : 'Aproximándose'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
