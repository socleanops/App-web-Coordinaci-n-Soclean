-- 1. Asegurar que la tabla exista
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- 2. Asegurar que TODAS las columnas existan
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS razon_social TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombre_fantasia TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rut TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto_principal TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Activar Seguridad (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- 4. Borrar políticas viejas (para evitar el error "policy already exists")
DROP POLICY IF EXISTS "Permitir lectura de clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir creacion de clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir modificar clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir eliminar clientes" ON clientes;

-- 5. Crear las políticas limpias
CREATE POLICY "Permitir lectura de clientes" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir creacion de clientes" ON clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir modificar clientes" ON clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir eliminar clientes" ON clientes FOR DELETE TO authenticated USING (true);

-- 6. Forzar a Supabase a refrescar la memoria caché de las tablas (MUY IMPORTANTE)
NOTIFY pgrst, 'reload schema';
