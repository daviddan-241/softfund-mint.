import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.SUPABASE_URL || '';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export function getSupabase() {
  if (!SUPA_URL || !SUPA_KEY) return null;
  return createClient(SUPA_URL, SUPA_KEY);
}
