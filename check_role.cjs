const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvqcwptxwoejaolcmnkb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cWN3cHR4d29lamFvbGNtbmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzM1NTUsImV4cCI6MjA4ODIwOTU1NX0.agJol8E3OtWfkUzo-mTMCaBJH0goXeeCzx8JdsbgnFw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'lmacaris@soclean.com.uy');
    
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
