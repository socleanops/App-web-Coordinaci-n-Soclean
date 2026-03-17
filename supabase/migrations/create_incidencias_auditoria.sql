-- ==============================================================================
-- Migration: Incidencias, Reemplazos, y Auditoría
-- ==============================================================================

-- 1. Tabla de Incidencias / Reemplazos
CREATE TABLE IF NOT EXISTS public.incidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('Ausencia injustificada', 'Tardanza', 'Licencia médica', 'Vacaciones', 'Reemplazo', 'Otro')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En proceso', 'Resuelta', 'Cerrada')),
    reemplazo_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Incidencias
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incidencias: Lectura para autenticados"
    ON public.incidencias FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Incidencias: Insert para admins/supervisores"
    ON public.incidencias FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol IN ('superadmin', 'admin', 'supervisor')
        )
    );

CREATE POLICY "Incidencias: Update para admins/supervisores"
    ON public.incidencias FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol IN ('superadmin', 'admin', 'supervisor')
        )
    );

CREATE POLICY "Incidencias: Delete para admins"
    ON public.incidencias FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol IN ('superadmin', 'admin')
        )
    );

-- 2. Tabla de Historial de Auditoría (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Audit Logs (Solo lectura para admins)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AuditLogs: Lectura solo para admins"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol IN ('superadmin', 'admin')
        )
    );

-- Insert allow via internal trigger only, so no public INSERT policy is needed.
-- Or we can allow authenticated users to insert (though it's handled by a SECURITY DEFINER trigger).

-- 3. Función Genérica de Auditoría (Trigger Function)
CREATE OR REPLACE FUNCTION public.audit_record()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME::text, OLD.id, TG_OP, auth.uid(), to_jsonb(OLD), NULL);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME::text, NEW.id, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME::text, NEW.id, TG_OP, auth.uid(), NULL, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Aplicar Triggers a tablas principales
DROP TRIGGER IF IF EXISTS audit_funcionarios ON public.funcionarios;
CREATE TRIGGER audit_funcionarios
AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios
FOR EACH ROW EXECUTE FUNCTION public.audit_record();

DROP TRIGGER IF EXISTS audit_asistencia ON public.asistencia;
CREATE TRIGGER audit_asistencia
AFTER INSERT OR UPDATE OR DELETE ON public.asistencia
FOR EACH ROW EXECUTE FUNCTION public.audit_record();

DROP TRIGGER IF EXISTS audit_horarios ON public.horarios;
CREATE TRIGGER audit_horarios
AFTER INSERT OR UPDATE OR DELETE ON public.horarios
FOR EACH ROW EXECUTE FUNCTION public.audit_record();

DROP TRIGGER IF EXISTS audit_incidencias ON public.incidencias;
CREATE TRIGGER audit_incidencias
AFTER INSERT OR UPDATE OR DELETE ON public.incidencias
FOR EACH ROW EXECUTE FUNCTION public.audit_record();

DROP TRIGGER IF EXISTS audit_servicios ON public.servicios;
CREATE TRIGGER audit_servicios
AFTER INSERT OR UPDATE OR DELETE ON public.servicios
FOR EACH ROW EXECUTE FUNCTION public.audit_record();
