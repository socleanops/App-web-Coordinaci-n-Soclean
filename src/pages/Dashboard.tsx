import { Users, Calendar, ClipboardList, Briefcase, Building2, Map } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { ManagerModules } from '@/components/dashboard/ManagerModules';
import { DashboardSupportSection } from '@/components/dashboard/DashboardSupportSection';

export default function Dashboard() {
    const { role } = useAuthStore();
    const isManager = role === 'superadmin' || role === 'admin';

    return (
        <main className="max-w-7xl mx-auto py-8 animate-in fade-in duration-500">
            {/* Title Section */}
            <section className="mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Panel Principal</h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                    Selecciona un módulo para gestionar tu personal, asistencia, operaciones de limpieza y finanzas de la empresa.
                </p>
            </section>

            {/* Grid based on the Stitch exported design aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ModuleCard
                    title="Módulo de Personal"
                    description="Gestiona la información de todos los empleados, contratos, salarios, y asignaciones a departamentos."
                    Icon={Users}
                    colorTheme="blue"
                    linkTo="/funcionarios"
                    linkText="Ver Funcionarios"
                />

                <ModuleCard
                    title="Horarios y Turnos"
                    description="Programa qué días de la semana y en qué horario un empleado cubre el servicio de cierto cliente de manera habitual."
                    Icon={Calendar}
                    colorTheme="green"
                    linkTo="/horarios"
                    linkText="Ver Asignaciones"
                />

                <ModuleCard
                    title="Control de Asistencia"
                    description="Monitorea en tiempo real quién se presentó y a qué hora en cada ubicación operativa del cliente."
                    Icon={ClipboardList}
                    colorTheme="purple"
                    linkTo="/asistencia"
                    linkText="Ver Asistencias del Día"
                />

                <ModuleCard
                    title="Servicios a Clientes"
                    description="Administra los servicios agendados y en curso para tus diferentes clientes."
                    Icon={Briefcase}
                    colorTheme="amber"
                    linkTo="/servicios"
                    linkText="Ver Servicios"
                />

                <ModuleCard
                    title="Empresas / Clientes"
                    description="Administra tu cartera de clientes, contratos y ubicaciones base."
                    Icon={Building2}
                    colorTheme="red"
                    linkTo="/clientes"
                    linkText="Ir a Clientes"
                />

                <ModuleCard
                    title="Logística y Rutas"
                    description="Localiza geográficamente los servicios y calcula trayectos y buses para el personal."
                    Icon={Map}
                    colorTheme="orange"
                    linkTo="/logistica"
                    linkText="Abrir Logística"
                    isNew={true}
                />

                <ManagerModules isManager={isManager} />
            </div>

            <DashboardSupportSection />
        </main>
    );
}

