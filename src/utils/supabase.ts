import { createClient } from '@supabase/supabase-js';

// Provide default values for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aimzresxqchycswspxnj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbXpyZXN4cWNoeWNzd3NweG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTczNTcsImV4cCI6MjA2MTA3MzM1N30.SeC3DrDrMTN0-jg5OZTbRmVb_4ecIgvThZlcfqedvOE';

// Check if URL and key are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
