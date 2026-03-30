import { read, utils } from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// 1. Cargar configuración de Supabase desde .env.local
const envFile = readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importClients() {
  console.log('🔑 Iniciando sesión como administrador...');
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: 'lmacaris@soclean.com.uy',
    password: 'Hereford12'
  });

  if (loginError) {
    console.error('❌ Error de autenticación:', loginError.message);
    return;
  }

  console.log('✅ Sesión iniciada. 🚀 Iniciando importación de Clientes.xlsx...');

  try {
    // 2. Leer Excel
    const fileBuffer = readFileSync('Clientes.xlsx');
    const workbook = read(fileBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json(sheet);

    console.log(`📊 Se encontraron ${rawData.length} registros en el Excel.`);

    const clientsToInsert = rawData.map((row: any) => {
      const nombre = row['Nombre'] || 'Sin Nombre';
      const direccion = row['Dirección'] || 'Sin Dirección';
      const frecuencia = row['Frecuencia'] || '';
      // 3. Extracción de Nombre y Teléfono (Opción 3)
      const contactoRaw = row['Contacto\xa0'] || row['Contacto'] || ''; 
      const contactoRawStr = String(contactoRaw).trim();
      let nombreContacto = contactoRawStr;
      let telefono = '';

      if (contactoRawStr) {
        const phoneMatch = contactoRawStr.match(/(\d{7,10})/);
        if (phoneMatch) {
          telefono = phoneMatch[1];
          nombreContacto = contactoRawStr.replace(telefono, '').trim();
        }
      }

      // 4. Mapeo final al esquema de Supabase (Opción 2: Placeholder RUT)
      return {
        razon_social: nombre,
        nombre: nombre,
        nombre_fantasia: nombre,
        direccion: direccion,
        frecuencia_visita: frecuencia,
        contacto_principal: nombreContacto || '',
        telefono: telefono || '',
        rut: '00000000', // RUT Placeholder
        estado: 'activo'
      };
    });

    // 5. Insertar en Supabase
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientsToInsert)
      .select();

    if (error) throw error;

    console.log(`✅ ¡Éxito! Se han importado ${data.length} clientes correctamente.`);
    console.log('--- Resumen ---');
    console.log(`- Clientes con Teléfono extraído: ${clientsToInsert.filter(c => c.telefono).length}`);
    console.log('----------------');

  } catch (err: any) {
    console.error('❌ Error fatal en la importación:', err.message);
  }
}

importClients();
