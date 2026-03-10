CREATE TABLE IF NOT EXISTS empresa_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razon_social TEXT NOT NULL DEFAULT 'Soclean Coordinación',
    rut TEXT DEFAULT '',
    direccion TEXT DEFAULT 'Montevideo, Uruguay',
    telefono TEXT DEFAULT '+598 90 000 000',
    email TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO empresa_config (razon_social, rut, direccion, telefono, email)
VALUES ('Soclean Coordinación', '210000000018', 'Montevideo, Uruguay', '+598 90 000 000', 'contacto@soclean.uy')
ON CONFLICT DO NOTHING;

ALTER TABLE empresa_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer empresa_config"
    ON empresa_config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Solo superadmin puede actualizar empresa_config"
    ON empresa_config FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );

CREATE POLICY "Solo superadmin puede insertar empresa_config"
    ON empresa_config FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'superadmin'
        )
    );
