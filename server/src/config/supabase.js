import { createClient } from '@supabase/supabase-js';
import config from './index.js';

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { persistSession: false },
});

export { supabase };
