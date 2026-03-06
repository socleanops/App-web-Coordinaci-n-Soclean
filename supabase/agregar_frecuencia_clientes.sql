-- Agregar columnas de frecuencia y carga horaria a la tabla clientes
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS frecuencia_visita TEXT,
ADD COLUMN IF NOT EXISTS carga_horaria TEXT;
