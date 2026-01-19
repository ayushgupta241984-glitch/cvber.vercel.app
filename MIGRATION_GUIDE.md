# Supabase Database Migration Guide

Currently, the application cannot automatically create the necessary database tables. You must run the SQL migration manually in your Supabase dashboard.

## Steps to Fix "Missing Table" Errors

1.  **Locate the Migration File**:
    - Open the file `supabase/migrations/001_initial_schema.sql` in your project.
    - Copy the **entire contents** of this file.

2.  **Go to Supabase Dashboard**:
    - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and select your project (`cvber-free`).

3.  **Open SQL Editor**:
    - In the left sidebar, click on the **SQL Editor** icon (it looks like a terminal `>_`).
    - Click **"New Query"**.

4.  **Run the Migration**:
    - Paste the code you copied from `001_initial_schema.sql` into the editor.
    - Click the **"Run"** button (bottom right of the editor).
    - You should see a "Success" message indicating the tables (`profiles`, `audit_logs`, `verification_meta`) have been created.

5.  **Verify**:
    - Go to the **Table Editor** (grid icon in sidebar).
    - You should now see the `profiles` table listed.

## Why is this needed?
The `profiles` table is essential for storing user information that links to your authentication identity. Without it, registration may partially succeed (creating an auth user) but fail to create the profile, leading to login and dashboard errors.
