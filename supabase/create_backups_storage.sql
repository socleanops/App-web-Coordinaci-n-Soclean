-- =========================================
-- Tabla: backups_log
-- Almacena el historial de respaldos realizados
-- =========================================

CREATE TABLE IF NOT EXISTS backups_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL DEFAULT 'MANUAL', -- 'MANUAL', 'AUTO_DIARIO', 'AUTO_SEMANAL'
    estado TEXT NOT NULL DEFAULT 'COMPLETADO', -- 'COMPLETADO', 'ERROR'
    archivo_url TEXT,
    detalles TEXT,
    realizado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE backups_log ENABLE ROW LEVEL SECURITY;

-- Limpiamos reglas antiguas para evitar el error "policy already exists"
DROP POLICY IF EXISTS "Superadmin puede ver el historial de backups" ON backups_log;
DROP POLICY IF EXISTS "Superadmin puede registrar backups" ON backups_log;

CREATE POLICY "Superadmin puede ver el historial de backups"
    ON backups_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );

CREATE POLICY "Superadmin puede registrar backups"
    ON backups_log FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );

-- =========================================
-- Crear el "Bucket" (Carpeta) privado en Supabase Storage
-- =========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false) 
ON CONFLICT (id) DO NOTHING;

-- Limpiamos reglas de la nube por si ya existían
DROP POLICY IF EXISTS "Superadmin puede subir archivos de backup" ON storage.objects;
DROP POLICY IF EXISTS "Superadmin puede descargar archivos de backup" ON storage.objects;

CREATE POLICY "Superadmin puede subir archivos de backup"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'backups' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );

CREATE POLICY "Superadmin puede descargar archivos de backup"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'backups' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );
