import { Construction, Sparkles } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full min-h-[70vh] text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-coreops-primary to-coreops-secondary opacity-30 blur-lg animate-pulse"></div>
                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-full shadow-xl border border-slate-100 dark:border-slate-800">
                    <Construction className="h-16 w-16 text-coreops-primary" />
                </div>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                Módulo <span className="text-coreops-primary">{title}</span> en Construcción
            </h2>

            <p className="text-lg text-slate-500 max-w-xl mx-auto flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Estamos preparando la mejor experiencia logística y de coordinación para este apartado.
            </p>

            <button
                className="mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg shadow-md hover:scale-105 transition-all outline-none"
                onClick={() => window.history.back()}
            >
                Volver Atrás
            </button>
        </div>
    );
}
