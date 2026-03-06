-- Activar RLS en las tablas si no lo estaban
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de Seguridad (RLS) para la tabla: profiles
CREATE POLICY "Permitir lectura de perfiles a logueados"
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir creacion de perfiles a logueados"
ON profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir modificar perfiles a logueados"
ON profiles FOR UPDATE TO authenticated USING (true);

-- 2. Políticas de Seguridad (RLS) para la tabla: funcionarios
CREATE POLICY "Permitir lectura de funcionarios a logueados"
ON funcionarios FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir creacion de funcionarios a logueados"
ON funcionarios FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir modificar funcionarios a logueados"
ON funcionarios FOR UPDATE TO authenticated USING (true);
