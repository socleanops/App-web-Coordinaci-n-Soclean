import { getClients } from './services/clientService';

async function testServiceClient() {
  console.log('--- Probando servicio de clientes ---');
  try {
    const clients = await getClients();
    console.log(`✅ Éxito: Se encontraron ${clients.length} clientes en Supabase.`);
    if (clients.length > 0) {
      console.log('Primer cliente:', {
        id: clients[0].id,
        nombre: clients[0].razon_social
      });
    }
  } catch (error) {
    console.error('❌ Error en el servicio:', error.message);
  }
}

testServiceClient();
