import { createClient } from '@supabase/supabase-js';

const client = createClient('https://nonexistent-supabase-url.co', 'fake-key', {
    auth: { storageKey: 'test' }
});

async function run() {
    console.log("Fetching session...");
    try {
        const { data, error } = await client.auth.getSession();
        console.log("Resolved:", data, "Error:", error);
    } catch(e) {
        console.log("Thrown:", e);
    }
}
run();
