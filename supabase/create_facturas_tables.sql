-- Facturas Tables
CREATE TABLE facturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  numero text not null unique,
  fecha_emision date not null,
  fecha_vencimiento date,
  estado text not null default 'borrador' check (estado in ('borrador', 'emitida', 'pagada', 'vencida', 'anulada')),
  subtotal numeric not null default 0,
  impuesto numeric not null default 0,
  descuento numeric not null default 0,
  total numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Factura Items Table
CREATE TABLE factura_items (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references facturas(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete set null,
  descripcion text not null,
  cantidad numeric not null default 1,
  precio_unitario numeric not null default 0,
  total numeric not null default 0
);

-- RLS para Facturas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facturas son visibles para todos excepto funcionarios" ON facturas
  FOR SELECT USING (auth.uid() IN (SELECT id from auth.users));

CREATE POLICY "Permitir insertar/actualizar facturas a todos excepto funcionarios" ON facturas
  FOR ALL USING (auth.uid() IN (SELECT id from auth.users));

CREATE POLICY "Factura items son visibles para todos excepto funcionarios" ON factura_items
  FOR SELECT USING (auth.uid() IN (SELECT id from auth.users));

CREATE POLICY "Permitir insertar/actualizar items a todos excepto funcionarios" ON factura_items
  FOR ALL USING (auth.uid() IN (SELECT id from auth.users));
