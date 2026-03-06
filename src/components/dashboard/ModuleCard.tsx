import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
    title: string;
    description: string;
    linkText: string;
    linkTo: string;
    Icon: LucideIcon;
    colorTheme: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'orange' | 'dark' | 'gradient';
    isNew?: boolean;
}

export function ModuleCard({ title, description, linkText, linkTo, Icon, colorTheme, isNew }: ModuleCardProps) {
    // Define themes based on the existing Dashboard styles
    const themes = {
        blue: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/50',
            iconColor: 'text-coreops-primary dark:text-blue-400',
            btn: 'bg-coreops-primary hover:bg-coreops-secondary text-white',
            title: 'text-slate-900 dark:text-white',
        },
        green: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
            iconBg: 'bg-green-100 dark:bg-green-900/50',
            iconColor: 'text-green-700 dark:text-green-400',
            btn: 'bg-coreops-primary hover:bg-coreops-secondary text-white',
            title: 'text-slate-900 dark:text-white',
        },
        purple: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
            iconBg: 'bg-purple-100 dark:bg-purple-900/50',
            iconColor: 'text-purple-700 dark:text-purple-400',
            btn: 'bg-coreops-primary hover:bg-coreops-secondary text-white',
            title: 'text-slate-900 dark:text-white',
        },
        amber: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/50',
            iconColor: 'text-amber-700 dark:text-amber-400',
            btn: 'bg-coreops-primary hover:bg-coreops-secondary text-white',
            title: 'text-slate-900 dark:text-white',
        },
        red: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
            iconBg: 'bg-red-100 dark:bg-red-900/50',
            iconColor: 'text-red-700 dark:text-red-400',
            btn: 'bg-coreops-primary hover:bg-coreops-secondary text-white',
            title: 'text-slate-900 dark:text-white',
        },
        orange: {
            bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 relative overflow-hidden group',
            iconBg: 'bg-orange-100 dark:bg-orange-900/60 shadow-inner',
            iconColor: 'text-orange-600 dark:text-orange-400',
            btn: 'bg-slate-900 dark:bg-white dark:hover:bg-slate-200 hover:bg-slate-800 text-white dark:text-slate-900 shadow-lg hover:shadow-xl',
            title: 'text-slate-900 dark:text-white relative',
        },
        dark: {
            bg: 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-slate-300',
            iconBg: 'bg-white/10',
            iconColor: 'text-white',
            btn: 'bg-white hover:bg-slate-100 text-slate-900',
            title: 'text-white',
        },
        gradient: {
            bg: 'bg-gradient-to-br from-coreops-primary to-blue-900 border-0 text-white/80 hover:-translate-y-1',
            iconBg: 'bg-white/20 backdrop-blur-sm',
            iconColor: 'text-white',
            btn: '', // Special rendering below
            title: 'text-white',
        }
    };

    const theme = themes[colorTheme] || themes.blue;

    return (
        <article className={`${theme.bg} p-8 rounded-2xl shadow-sm border flex flex-col h-full hover:shadow-md transition-all`}>
            {colorTheme === 'orange' && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-orange-100 dark:bg-orange-900/40 w-32 h-32 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            )}
            <div className="flex items-center gap-4 mb-6 relative">
                <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.iconColor}`}>
                    <Icon className="h-8 w-8" strokeWidth={2} />
                </div>
                <h3 className={`text-xl font-bold ${theme.title}`}>{title}</h3>
            </div>
            <p className={`mb-6 flex-grow relative ${colorTheme === 'orange' ? 'text-slate-600 dark:text-slate-400' : ''}`}>
                {isNew && <span className="font-semibold text-orange-500 mr-1">¡Nuevo!</span>}
                {description}
            </p>

            {colorTheme === 'gradient' ? (
                <div className="mt-auto pt-4 border-t border-white/20">
                    <Link to={linkTo} className="flex items-center text-sm font-semibold hover:text-white group transition-colors text-white">
                        {linkText}
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            ) : (
                <div className="mt-8 flex gap-3 relative">
                    <Link to={linkTo} className={`flex-1 py-3 px-4 ${theme.btn} text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2`}>
                        {linkText} <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </article>
    );
}
