import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env
const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const authClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function testCreate() {
    console.log("Starting testCreate...");
    const safeEmail = `ci_123123123_test@soclean.internal`;
    const safePassword = `SC123123123#2026`;

    console.log("1. Checking existing profile...");
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', safeEmail)
        .maybeSingle();

    let profileId = existingProfile?.id;

    if (!profileId) {
        console.log("2. Signing up via Auth...");
        const { data: authData, error: authError } = await authClient.auth.signUp({
            email: safeEmail,
            password: safePassword,
            options: { data: { nombre: 'Test', apellido: 'Tester' } }
        });
        if (authError) {
            console.error("Auth Error:", authError);
            return;
        }
        console.log("Auth success", authData.user?.id);
        profileId = authData.user?.id;
    }

    console.log("3. Upserting profile...");
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: profileId,
            email: safeEmail,
            rol: 'funcionario',
            nombre: 'Test',
            apellido: 'Tester'
        }, { onConflict: 'id' });

    if (profileError) {
        console.error("Profile Error:", profileError);
        return;
    }

    console.log("4. Inserting funcionario...");
    const { data: funcData, error: funcError } = await supabase
        .from('funcionarios')
        .insert({
            profile_id: profileId,
            cedula: "123123123",
            cargo: "Test",
            departamento_id: "cbb2694b-4f99-4c28-bb8c-6874e44458cc", // need a valid uuid? Let's just use any random uuid if nullable or omit if possible
            direccion: "Test dir 123",
            fecha_ingreso: new Date().toISOString().split('T')[0],
            tipo_contrato: "indefinido",
            salario_base: 0,
            estado: "activo",
        })
        .select()
        .single();
        
    if (funcError) {
        console.error("Func Error:", funcError);
        return;
    }
    console.log("Done!", funcData);
}

testCreate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
