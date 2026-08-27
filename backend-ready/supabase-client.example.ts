// Example only. Move this into the application/backend project when Supabase is connected.
// Requires @supabase/supabase-js in the real app.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.example';

const url = process.env.PUBLIC_SUPABASE_URL;
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
}

// Browser client: ANON key only. Never place SUPABASE_SERVICE_ROLE_KEY here.
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
