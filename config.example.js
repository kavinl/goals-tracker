// Supabase Configuration Template
// Copy this file to config.js and replace with your actual credentials
// You can find them in: Supabase Dashboard > Project Settings > API

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',  // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY'  // Your public anon key (safe to expose in frontend)
};

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
