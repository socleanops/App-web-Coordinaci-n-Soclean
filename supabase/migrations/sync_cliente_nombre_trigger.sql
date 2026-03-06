-- Create a trigger function to automatically set the legacy 'nombre' column to match 'razon_social'
CREATE OR REPLACE FUNCTION set_cliente_nombre()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.razon_social IS NOT NULL THEN
    NEW.nombre := NEW.razon_social;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the clientes table
DROP TRIGGER IF EXISTS sync_cliente_nombre ON clientes;
CREATE TRIGGER sync_cliente_nombre
BEFORE INSERT OR UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION set_cliente_nombre();
