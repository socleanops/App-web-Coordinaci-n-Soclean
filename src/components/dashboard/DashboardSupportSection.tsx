import { HelpCircle } from 'lucide-react';

export function DashboardSupportSection() {
    return (
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
    );
}
