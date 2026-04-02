import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, Briefcase, Activity, UserMinus, FilePlus } from 'lucide-react';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { useClientes } from '@/hooks/useClientes';
import { useServicios } from '@/hooks/useServicios';
import { useAsistencia } from '@/hooks/useAsistencia';

export function OperationsOverviewWidget() {
    const { getFuncionarios } = useFuncionarios();
    const { getClientes } = useClientes();
    const { getServicios } = useServicios();
    
    const today = new Date().toISOString().split('T')[0];
    const { getAsistencias } = useAsistencia(today, today);

    const activeEmployeesCount = useMemo(() => {
        return getFuncionarios.data?.filter(f => f.estado === 'activo').length || 0;
    }, [getFuncionarios.data]);

    const activeClientsCount = useMemo(() => {
        return getClientes.data?.filter(c => c.estado === 'activo').length || 0;
    }, [getClientes.data]);

    const activeServicesCount = useMemo(() => {
        return getServicios.data?.filter(s => s.estado === 'activo').length || 0;
    }, [getServicios.data]);

    const { presentesCount, ausentesCount, certificadosCount } = useMemo(() => {
        const asist = getAsistencias.data || [];
        const presentes = asist.filter(a => ['presente', 'tardanza', 'salida_anticipada'].includes(a.estado)).length;
        const ausentes = asist.filter(a => a.estado === 'ausente').length;
        const certificados = asist.filter(a => a.estado === 'certificado').length;
        return { presentesCount: presentes, ausentesCount: ausentes, certificadosCount: certificados };
    }, [getAsistencias.data]);

    const loading = getFuncionarios.isLoading || getClientes.isLoading || getServicios.isLoading || getAsistencias.isLoading;

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mb-10">
                {[1, 2, 3, 4, 5, 6].map(idx => (
                    <Card key={idx} className="h-32 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            {/* Widget 1 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <Users className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Users className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Plantilla Activa</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{activeEmployeesCount}</span>
                        <span className="text-xs opacity-80">Funcionarios</span>
                    </div>
                </CardContent>
            </Card>

            {/* Widget 2 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <Building2 className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Building2 className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Cartera</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{activeClientsCount}</span>
                        <span className="text-xs opacity-80">Clientes Operativos</span>
                    </div>
                </CardContent>
            </Card>

            {/* Widget 3 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <Briefcase className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Briefcase className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Despliegue</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{activeServicesCount}</span>
                        <span className="text-xs opacity-80">Servicios Contratados</span>
                    </div>
                </CardContent>
            </Card>

            {/* Widget 4 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <Activity className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Activity className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Presentes</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{presentesCount}</span>
                        <span className="text-xs opacity-80">Asistencia Hoy</span>
                    </div>
                </CardContent>
            </Card>
            
            {/* Widget 5 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <UserMinus className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <UserMinus className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Ausencias</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{ausentesCount}</span>
                        <span className="text-xs opacity-80">Faltas de Hoy</span>
                    </div>
                </CardContent>
            </Card>

            {/* Widget 6 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 text-white rounded-2xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110">
                    <FilePlus className="w-24 h-24" />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <FilePlus className="w-4 h-4" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider">Certificados</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold">{certificadosCount}</span>
                        <span className="text-xs opacity-80">Certificaciones Hoy</span>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
