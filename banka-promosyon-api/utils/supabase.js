import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Key, ortam değişkenlerinden okunuyor.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY; // Eğer hassas verilerle çalışıyorsan dikkat!
export const supabase = createClient(supabaseUrl, supabaseKey);
