// js/supabase.js
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY";

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
