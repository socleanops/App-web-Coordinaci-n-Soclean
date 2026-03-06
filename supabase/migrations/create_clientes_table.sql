-- 1. Crear la tabla principal de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  rut TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  contacto_principal TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activar Seguridad por Filas (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para permitir operaciones a usuarios logueados
CREATE POLICY "Permitir lectura de clientes a logueados"
ON clientes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir creacion de clientes a logueados"
ON clientes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir modificar clientes a logueados"
ON clientes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Permitir eliminar clientes a logueados"
ON clientes FOR DELETE TO authenticated USING (true);
