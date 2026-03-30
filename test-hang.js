import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function timeoutFunc(promise, ms, name) {
    let t;
    const timeout = new Promise((_, reject) => {
        t = setTimeout(() => reject(new Error(`Timeout in ${name}`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

async function testCreate() {
    console.log("Starting testCreate...");
    // 1. Log in as an admin
    const adminEmail = 'leomacaris@gmail.com'; // I will use known admin email if I can guess one, wait, no, I don't know the password
    // Instead I'll just check if the profile table hangs when selecting without auth
    console.log("Checking profiles table...");
    try {
        const { data, error } = await timeoutFunc(supabase.from('profiles').select('id').limit(1), 5000, "fetch profiles");
        console.log("Fetch result:", { data, error });
    } catch(e) {
        console.log("Caught:", e.message);
    }
}

testCreate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
