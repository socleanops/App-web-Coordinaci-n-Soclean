import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    Icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
    };
    colorTheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'orange' | 'dark';
    isLoading?: boolean;
}

const colorMap = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    dark: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
};

export function KPICard({
    title,
    value,
    description,
    Icon,
    trend,
    colorTheme = 'blue',
    isLoading = false,
}: KPICardProps) {
    const iconColorClass = colorMap[colorTheme] || colorMap.blue;

    return (
        <Card className="hover:shadow-md transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-xl", iconColorClass)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1 mb-1"></div>
                ) : (
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </div>
                )}

                {(description || trend) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        {trend && (
                            <span className={cn(
                                "font-medium",
                                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                                {trend.value}
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
