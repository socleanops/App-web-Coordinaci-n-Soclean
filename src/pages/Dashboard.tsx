import { Users, Calendar, ClipboardList, Briefcase, ChevronRight, HelpCircle, Building2, Map, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

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

                {/* Module 1: Funcionarios */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 text-coreops-primary dark:bg-blue-900/50 dark:text-blue-400 rounded-xl">
                            <Users className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Módulo de Personal</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                        Gestiona la información de todos los empleados, contratos, salarios, y asignaciones a departamentos.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link to="/funcionarios" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                            Ver Funcionarios <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {/* Module 2: Horarios */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded-xl">
                            <Calendar className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Horarios y Turnos</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                        Programa qué días de la semana y en qué horario un empleado cubre el servicio de cierto cliente de manera habitual.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link to="/horarios" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                            Ver Asignaciones <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {/* Module 3: Asistencia */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded-xl">
                            <ClipboardList className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Control de Asistencia</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                        Monitorea en tiempo real quién se presentó y a qué hora en cada ubicación operativa del cliente.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link to="/asistencia" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                            Ver Asistencias del Día <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {/* Module 4: Servicios */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-xl">
                            <Briefcase className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Servicios a Clientes</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                        Administra los servicios agendados y en curso para tus diferentes clientes.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link to="/servicios" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                            Ver Servicios <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {/* Module 5: Clientes */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 rounded-xl">
                            <Building2 className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Empresas / Clientes</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                        Administra tu cartera de clientes, contratos y ubicaciones base.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link to="/clientes" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                            Ir a Clientes <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {/* Module 6: Logística */}
                <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-orange-100 dark:bg-orange-900/40 w-32 h-32 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-400 rounded-xl shadow-inner">
                            <Map className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Logística y Rutas</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow relative">
                        ¡Nuevo! Localiza geográficamente los servicios y calcula trayectos y buses para el personal.
                    </p>
                    <div className="mt-8 flex gap-3 relative">
                        <Link to="/logistica" className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white dark:hover:bg-slate-200 hover:bg-slate-800 text-white dark:text-slate-900 text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 shadow-lg hover:shadow-xl">
                            Abrir Logística <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </article>

                {isManager && (
                    <>
                        {/* Module 7: Reportes Operativos */}
                        <article className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-sm border border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/10 text-white rounded-xl">
                                    <FileText className="h-8 w-8" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Reportes Gerenciales</h3>
                            </div>
                            <p className="text-slate-300 mb-6 flex-grow">
                                Extracción de horas, asistencia quincenal y reportes del cierre por cliente.
                            </p>
                            <div className="mt-8 flex gap-3">
                                <Link to="/reportes" className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                                    Generar Reportes <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>

                        {/* Module 8: Facturación */}
                        <article className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 rounded-xl">
                                    <HelpCircle className="h-8 w-8" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white">Control de Horas por Cliente</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                                Pre-cálculo económico operativo y costos de servicio (proformas).
                            </p>
                            <div className="mt-8 flex gap-3">
                                <Link to="/facturacion" className="flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                                    Ver Horas por Cliente <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>

                        {/* Module 9: Nómina (Horas RRHH) */}
                        <article className="bg-gradient-to-br from-coreops-primary to-blue-900 text-white p-8 rounded-2xl shadow-sm border-0 flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Clock className="h-8 w-8 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold">Horas RRHH</h3>
                            </div>
                            <p className="text-white/80 mb-6 flex-grow">
                                Reporte consolidado mensual de horas y ausentismos para Recursos Humanos.
                            </p>
                            <div className="mt-auto pt-4 border-t border-white/20">
                                <Link to="/nomina" className="flex items-center text-sm font-semibold hover:text-white group transition-colors">
                                    Ir a Horas RRHH
                                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    </>
                )}

            </div>

            {/* Support Section */}
            <section className="mt-16 bg-coreops-dark text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-2">¿Necesitas repasar operaciones?</h3>
                    <p className="text-slate-400">Accede a la documentación del sistema o contacta a soporte por errores.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                        Ver Configuración
                    </button>
                    <button className="px-6 py-3 bg-white text-coreops-dark font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" /> Soporte
                    </button>
                </div>
            </section>
        </main>
    );
}
