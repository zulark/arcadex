
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey){
    throw new Error('Variáveis de ambiente não foram encontradas, verifique se está corretamente inseridas em .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey);
        