import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface PreferenceSettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
    notifications: boolean;
    setNotifications: (notifications: boolean) => void;
}

export function PreferenceSettings({ theme, setTheme, notifications, setNotifications }: PreferenceSettingsProps) {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Apariencia y Notificaciones</CardTitle>
                <CardDescription>Personaliza tu experiencia dentro de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Tema Visual</h4>
                        <p className="text-sm text-slate-500">Elige entre modo claro o oscuro.</p>
                    </div>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg dark:bg-slate-800">
                        <Button
                            variant={theme === 'light' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTheme('light')}
                            className={theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : ''}
                        >
                            <Sun className="h-4 w-4 mr-2" /> Claro
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTheme('dark')}
                            className={theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : ''}
                        >
                            <Moon className="h-4 w-4 mr-2" /> Oscuro
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Notificaciones UI/UX</h4>
                        <p className="text-sm text-slate-500">Mostrar alertas emergentes en pantalla.</p>
                    </div>
                    <Button
                        variant={notifications ? 'default' : 'outline'}
                        onClick={() => setNotifications(!notifications)}
                        className={notifications ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                        {notifications ? 'Activadas' : 'Desactivadas'}
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
