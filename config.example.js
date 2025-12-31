// Supabase Configuration Template
// Copy this file to config.js and replace with your actual credentials
// You can find them in: Supabase Dashboard > Project Settings > API

const SUPABASE_CONFIG = {
    url: 'https://mqfyjznizezpnlfxovnc.supabase.co',  // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'sb_publishable_95seyrELR9j2u_9E66DUrg_43rJBUPv'  // Your public anon key (safe to expose in frontend)
};

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
