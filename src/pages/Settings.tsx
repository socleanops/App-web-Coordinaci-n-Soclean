import { useState } from 'react';
import { User, Shield, Bell, Store } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { PreferenceSettings } from '@/components/settings/PreferenceSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

export default function Settings() {
    const { user, role } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);

    // Some placeholder state for the demo
    const [activeTab, setActiveTab] = useState('perfil');
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Configuraciones guardadas correctamente");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Store className="h-8 w-8 text-coreops-primary" />
                    Configuración del Sistema
                </h1>
                <p className="text-muted-foreground">
                    Administra tus preferencias, ajustes de cuenta y reglas del negocio.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full mt-6">
                <div className="flex flex-col gap-2 w-full md:w-64 shrink-0 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'perfil' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <User className="h-5 w-5" /> Mi Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('empresa')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'empresa' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Store className="h-5 w-5" /> Datos de Empresa
                    </button>
                    <button
                        onClick={() => setActiveTab('preferencias')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'preferencias' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Bell className="h-5 w-5" /> Preferencias
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'seguridad' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Shield className="h-5 w-5" /> Seguridad
                    </button>
                </div>

                <div className="flex-1">
                    {activeTab === 'perfil' && (
                        <ProfileSettings user={user} role={role} isSaving={isSaving} handleSave={handleSave} />
                    )}
                    {activeTab === 'empresa' && (
                        <CompanySettings isSaving={isSaving} handleSave={handleSave} />
                    )}
                    {activeTab === 'preferencias' && (
                        <PreferenceSettings theme={theme} setTheme={setTheme} notifications={notifications} setNotifications={setNotifications} />
                    )}
                    {activeTab === 'seguridad' && (
                        <SecuritySettings />
                    )}
                </div>
            </div>
        </div>
    );
}

