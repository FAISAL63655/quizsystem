import { createClient } from '@supabase/supabase-js';

// Provide default values for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqzjofrzsawtjfowtrtn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxempvZnJ6c2F3dGpmb3d0cnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDkzNTEsImV4cCI6MjA2MTg4NTM1MX0.sK6V8pKh7L1uHa6q1tc7bQdmLvulSptGNu9eG_MRWQQ';

// Check if URL and key are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
