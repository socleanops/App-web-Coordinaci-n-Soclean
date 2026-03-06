-- Agregar la columna 'direccion' a la tabla 'funcionarios'
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS direccion TEXT;
