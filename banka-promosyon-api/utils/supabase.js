import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Key, ortam değişkenlerinden okunuyor.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Eğer hassas verilerle çalışıyorsan dikkat!
export const supabase = createClient(supabaseUrl, supabaseKey);
