-- Enable Row Level Security
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to select (read) departamentos
CREATE POLICY "Permitir lectura de departamentos a usuarios logueados"
ON departamentos
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow authenticated users to insert (create) departamentos
CREATE POLICY "Permitir creacion de departamentos a usuarios logueados"
ON departamentos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Optional: Allow update and delete if needed in the future
CREATE POLICY "Permitir actualizar departamentos a usuarios logueados"
ON departamentos
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir eliminar departamentos a usuarios logueados"
ON departamentos
FOR DELETE
TO authenticated
USING (true);
