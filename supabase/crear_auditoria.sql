-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS solo de lectura para managers
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo lectura auth audit logs" ON public.audit_logs;
CREATE POLICY "Solo lectura auth audit logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Función del Trigger
CREATE OR REPLACE FUNCTION public.log_table_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparadores (Triggers) en tablas principales
DROP TRIGGER IF EXISTS trg_audit_clientes ON public.clientes;
CREATE TRIGGER trg_audit_clientes
AFTER INSERT OR UPDATE OR DELETE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.log_table_change();

DROP TRIGGER IF EXISTS trg_audit_funcionarios ON public.funcionarios;
CREATE TRIGGER trg_audit_funcionarios
AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios
FOR EACH ROW EXECUTE FUNCTION public.log_table_change();

DROP TRIGGER IF EXISTS trg_audit_servicios ON public.servicios;
CREATE TRIGGER trg_audit_servicios
AFTER INSERT OR UPDATE OR DELETE ON public.servicios
FOR EACH ROW EXECUTE FUNCTION public.log_table_change();

DROP TRIGGER IF EXISTS trg_audit_horarios ON public.horarios;
CREATE TRIGGER trg_audit_horarios
AFTER INSERT OR UPDATE OR DELETE ON public.horarios
FOR EACH ROW EXECUTE FUNCTION public.log_table_change();

DROP TRIGGER IF EXISTS trg_audit_asistencia ON public.asistencia;
CREATE TRIGGER trg_audit_asistencia
AFTER INSERT OR UPDATE OR DELETE ON public.asistencia
FOR EACH ROW EXECUTE FUNCTION public.log_table_change();
