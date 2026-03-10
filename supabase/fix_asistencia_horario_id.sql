-- Agregar la columna 'horario_id' a la tabla 'asistencia'
-- Esta columna relaciona la asistencia diaria con el horario base asignado
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='asistencia' AND column_name='horario_id') THEN
        ALTER TABLE public.asistencia ADD COLUMN horario_id UUID REFERENCES public.horarios(id) ON DELETE CASCADE;
    END IF;
END $$;
