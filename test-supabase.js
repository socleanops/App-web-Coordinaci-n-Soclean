import { createClient } from '@supabase/supabase-js';
try {
  const client = createClient('', '', {});
  console.log("Success");
} catch(e) {
  console.log("Error caught:", e.message);
}
