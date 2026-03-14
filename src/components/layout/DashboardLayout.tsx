import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/authStore';

export function DashboardLayout() {
    const role = useAuthStore(s => s.role);

    if (role === 'supervisor') {
        return (
            <div className="flex h-screen w-full bg-slate-50/50 dark:bg-slate-900/50 flex-col overflow-hidden">
                <Header isSupervisor />
                <main className="flex-1 overflow-auto p-2 pb-[100px] max-w-lg mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        );
    }
    return (
        <div className="flex h-screen w-full bg-slate-50/50 dark:bg-slate-900/50">
            <div className="hidden md:flex">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
