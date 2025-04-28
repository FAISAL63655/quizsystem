import { createClient } from '@supabase/supabase-js';

// Provide default values for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jepcmqatgghcdmvllcau.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGNtcWF0Z2doY2RtdmxsY2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njk2ODUsImV4cCI6MjA2MTQ0NTY4NX0.yo075g6Wt7FSlzn9EIQjI6v7abctCPdIevOG736c9dQ';

// Check if URL and key are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
