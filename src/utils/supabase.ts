import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey){
    throw new Error('Variáveis de ambiente não foram encontradas. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_KEY estão definidas no .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
