import { useState, useEffect } from 'react';
import { Bell, Clock, Info, ShieldAlert, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
    id: string;
    table_name: string;
    action: string;
    created_at: string;
    changed_by: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<AuditLog[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            // Fetch recent system actions (last 5)
            const { data, error } = await supabase
                .from('audit_logs')
                .select('id, table_name, action, created_at, changed_by')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setNotifications(data);
                // Just assuming any new fetch might have new unread stuff or map it to 0 if opened
                setUnreadCount(data.length);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen to changes in real-time
        const channel = supabase
            .channel('audit-alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
                setNotifications((prev) => [payload.new as AuditLog, ...prev].slice(0, 5));
                setUnreadCount((prev) => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = () => {
        setUnreadCount(0);
    };

    const getIcon = (table: string, action: string) => {
        if (action === 'DELETE') return <ShieldAlert className="h-4 w-4 text-red-500" />;
        if (table === 'funcionarios') return <Info className="h-4 w-4 text-blue-500" />;
        if (table === 'horarios' || table === 'asistencia') return <Clock className="h-4 w-4 text-amber-500" />;
        return <FileText className="h-4 w-4 text-emerald-500" />;
    };

    const getMessage = (table: string, action: string) => {
        const actionText = action === 'INSERT' ? 'Nuevo registro en' : action === 'UPDATE' ? 'Actualización en' : 'Eliminación en';
        return `${actionText} ${table}`;
    };

    return (
        <DropdownMenu onOpenChange={(open) => { if (open) markAsRead(); }}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground"
                    aria-label={`Notificaciones, ${unreadCount} nuevas`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in duration-300">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
                <DropdownMenuLabel className="font-semibold flex justify-between items-center">
                    Alertas del Sistema
                    {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">{unreadCount} nuevas</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No tienes alertas nuevas
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-muted/50">
                                <div className="flex items-center gap-2 w-full">
                                    {getIcon(notif.table_name, notif.action)}
                                    <span className="text-sm font-medium flex-1">
                                        {getMessage(notif.table_name, notif.action)}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-6">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="w-full text-center text-xs text-primary cursor-pointer justify-center" onClick={markAsRead}>
                    Marcar todo como leído
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
