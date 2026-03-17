import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AuditLog } from '@/types';

export function useAuditoria() {
    const getAuditLogs = useQuery({
        queryKey: ['auditoria'],
        queryFn: async (): Promise<AuditLog[]> => {
            const { data, error } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    users:user_id(
                        id,
                        email,
                        raw_user_meta_data
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) throw new Error(error.message);

            // Map the generic user metadata back into a usable 'Profile' like object for display
            const mapped = data.map(log => ({
                ...log,
                users: log.users ? {
                    id: (log.users as Record<string, unknown>).id,
                    email: (log.users as Record<string, unknown>).email,
                    nombre: ((log.users as Record<string, unknown>)?.raw_user_meta_data as Record<string, unknown>)?.nombre || 'Usuario',
                    apellido: ((log.users as Record<string, unknown>)?.raw_user_meta_data as Record<string, unknown>)?.apellido || 'Sistema',
                } : null
            }));

            return mapped as unknown as AuditLog[];
        },
    });

    return {
        getAuditLogs,
    };
}
