# Supabase Setup Guide

This guide will help you configure Supabase for your Goal Tracking Dashboard.

## Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on the **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-schema.sql` and paste it into the SQL editor
6. Click **Run** to execute the SQL

This will create the `goals` table with all necessary columns and indexes.

## Step 2: Get Your API Credentials

1. In your Supabase Dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** under Project Settings
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`

## Step 3: Configure Your Application

1. Open the `config.js` file in your project
2. Replace the placeholder values with your actual credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // Your Project URL
    anonKey: 'eyJ...'  // Your anon public key
};
```

3. **IMPORTANT**: If you're using Git, add `config.js` to your `.gitignore` to keep your keys private

## Step 4: Alternative - Use Environment Variables (Recommended for Netlify)

For better security when deploying to Netlify, you can use environment variables:

1. In Netlify Dashboard, go to: Site Settings > Build & Deploy > Environment
2. Add two environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your anon public key

3. Create a new file `config.js` that reads from build-time environment:

```javascript
// This will be replaced during Netlify build
const SUPABASE_CONFIG = {
    url: 'SUPABASE_URL_PLACEHOLDER',
    anonKey: 'SUPABASE_ANON_KEY_PLACEHOLDER'
};
```

4. Then add a build script to replace these values during deployment

## Step 5: Test Your Setup

1. Open your application in a browser
2. Add a test goal
3. Refresh the page - the goal should persist
4. Check your Supabase Dashboard > Table Editor > goals table to see the data

## Migrating Existing Data

If you already have goals in localStorage, you can export and import them:

1. Before deploying: Click "Export Data" to download your current goals
2. After Supabase is set up: Click "Import Data" to upload the JSON file
3. Your goals will be synced to Supabase automatically

## Security Note

The `anon` key is safe to expose in your frontend code because:
- Row Level Security (RLS) is enabled on the table
- The current policy allows all operations (you can restrict this later)
- It's a public key designed for client-side use

For production apps with user authentication, you should:
1. Enable Supabase Authentication
2. Update RLS policies to restrict access by user ID
3. Add user_id column to the goals table

## Troubleshooting

### "Failed to load from Supabase"
- Check your API credentials are correct
- Verify the table was created successfully
- Check browser console for detailed error messages

### Data not syncing
- Open browser DevTools > Console
- Look for Supabase-related errors
- Verify RLS policies allow your operations

### Offline Mode
The app automatically falls back to localStorage if Supabase is unreachable. Your data will be cached locally and changes will be saved locally until connection is restored.
