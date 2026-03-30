import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const authClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function timeoutFunc(promise, ms, name) {
    let t;
    const timeout = new Promise((_, reject) => {
        t = setTimeout(() => reject(new Error(`Timeout in ${name}`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

async function testCreate() {
    console.log("Starting testCreate...");
    const prefix = Date.now().toString(36);
    const safeEmail = `ci_666777888_${prefix}@soclean.internal`;
    const safePassword = `SC666777888#2026`;

    console.log("1. Checking existing profile...");
    try {
        const { data: existingProfile } = await timeoutFunc(supabase
            .from('profiles')
            .select('id')
            .eq('email', safeEmail)
            .maybeSingle(), 5000, "select existing profile");
            
        let profileId = existingProfile?.id;

        if (!profileId) {
            console.log("2. Signing up via Auth...");
            const { data: authData, error: authError } = await timeoutFunc(authClient.auth.signUp({
                email: safeEmail,
                password: safePassword,
                options: { data: { nombre: 'Test', apellido: 'Tester' } }
            }), 10000, "auth signup");
            if (authError) {
                console.error("Auth Error:", authError);
                return;
            }
            console.log("Auth success", authData.user?.id);
            profileId = authData.user?.id;
        }

        console.log("3. Upserting profile...");
        const { error: profileError } = await timeoutFunc(supabase
            .from('profiles')
            .upsert({
                id: profileId,
                email: safeEmail,
                rol: 'funcionario',
                nombre: 'Test',
                apellido: 'Tester'
            }, { onConflict: 'id' }), 5000, "upsert profile");

        if (profileError) {
            console.error("Profile Error:", profileError);
            return;
        }

        console.log("4. Inserting funcionario...");
        const { data: funcData, error: funcError } = await timeoutFunc(supabase
            .from('funcionarios')
            .insert({
                profile_id: profileId,
                cedula: "666777888",
                cargo: "Test",
                departamento_id: "cbb2694b-4f99-4c28-bb8c-6874e44458cc", 
                direccion: "Test dir 123",
                fecha_ingreso: new Date().toISOString().split('T')[0],
                tipo_contrato: "indefinido",
                salario_base: 0,
                estado: "activo",
            })
            .select()
            .single(), 5000, "insert funcionario");
            
        if (funcError) {
            console.error("Func Error:", funcError);
            return;
        }
        console.log("Done!", funcData);
    } catch (e) {
        console.error("Caught Exception:", e);
    }
}

testCreate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
