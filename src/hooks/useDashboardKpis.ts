import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DashboardKpis {
    empleadosActivos: number;
    serviciosActivos: number;
    ausenciasHoy: number;
    alertasIncumplimiento: number;
}

export function useDashboardKpis() {
    return useQuery<DashboardKpis>({
        queryKey: ['dashboard-kpis'],
        queryFn: async () => {
            const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' local time

            // 1. Empleados activos
            const { count: empleadosActivos, error: empError } = await supabase
                .from('funcionarios')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'activo');

            if (empError) throw new Error(empError.message);

            // 2. Servicios activos
            const { count: serviciosActivos, error: servError } = await supabase
                .from('servicios')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'activo');

            if (servError) throw new Error(servError.message);

            // 3. Ausencias del día (estado = 'ausente')
            const { count: ausenciasHoy, error: ausError } = await supabase
                .from('asistencia')
                .select('*', { count: 'exact', head: true })
                .eq('fecha', today)
                .eq('estado', 'ausente');

            if (ausError) throw new Error(ausError.message);

            // 4. Alertas de incumplimiento del día (tardanza o falta sin justificar, pending entries, etc.)
            // Let's count 'tardanza', 'salida_anticipada', 'pendiente' that might need attention today
            const { count: alertasIncumplimiento, error: alertError } = await supabase
                .from('asistencia')
                .select('*', { count: 'exact', head: true })
                .eq('fecha', today)
                .in('estado', ['tardanza', 'salida_anticipada', 'pendiente']);

            if (alertError) throw new Error(alertError.message);

            return {
                empleadosActivos: empleadosActivos || 0,
                serviciosActivos: serviciosActivos || 0,
                ausenciasHoy: ausenciasHoy || 0,
                alertasIncumplimiento: alertasIncumplimiento || 0,
            };
        },
        // Refetch every 5 minutes
        refetchInterval: 5 * 60 * 1000,
    });
}
