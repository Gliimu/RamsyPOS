// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// =====================================================================
// EDIT YOUR SUPABASE CREDENTIALS HERE
// =====================================================================
const SUPABASE_URL = 'https://ertymkcoktyxgixgecjk.supabase.co'; // <--- REPLACE WITH REAL URL

const SUPABASE_ANON_KEY = 'sb_publishable_YEpZkT2hixXb4e4kIIKP-g_MpCsxHtm'; // <--- REPLACE WITH REAL ANON KEY
// =====================================================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
