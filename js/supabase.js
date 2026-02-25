const SUPABASE_URL = "https://jyrgpvozcsuydfvwdbso.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmdwdm96Y3N1eWRmdndkYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzc5NDYsImV4cCI6MjA4NzYxMzk0Nn0.UaO49Ie82pbSosiaLo84NgNBiTXLoQfnzrgEhB6HjFw";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
