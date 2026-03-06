-- 1. Crear la tabla de servicios
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger para actualizar el campo updated_at
CREATE TRIGGER update_servicios_updated_at 
BEFORE UPDATE ON public.servicios 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Activar RLS (Row Level Security)
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Lectura/Escritura
-- Todos los usuarios autenticados pueden ver los servicios
CREATE POLICY "Lectura pública autenticada de servicios" 
ON public.servicios FOR SELECT USING (auth.role() = 'authenticated');

-- Managers (Admins, Superadmins y Supervisores) pueden administrar (crear, editar, borrar) los servicios
CREATE POLICY "Managers administran servicios" 
ON public.servicios FOR ALL USING (public.is_manager());
