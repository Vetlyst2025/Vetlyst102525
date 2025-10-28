import { createClient } from '@supabase/supabase-js';

// The Supabase URL provided by the user.
const supabaseUrl = 'https://qklnxfkwjpdboqawxpts.supabase.co';
// The Supabase anon key provided by the user.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbG54Zmt3anBkYm9xYXd4cHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE4NTIsImV4cCI6MjA3NTk0Nzg1Mn0.Y7w1pV-BC5rfYMFo_vMlhYVq7KaFOdUtcyG3eHYMmms';

if (!supabaseUrl || !supabaseAnonKey) {
  // This check is kept as a safeguard, but with hardcoded values, it should not be triggered.
  throw new Error('Supabase configuration is missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
