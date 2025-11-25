# Setup Supabase Database (Free PostgreSQL)

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub (easiest) or email
4. Verify your email if needed

## Step 2: Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `ChatPredict` (or any name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you (e.g., `US East`)
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to be created

## Step 3: Get Connection String

1. Once project is ready, go to **Settings** (gear icon in sidebar)
2. Click **"Database"** in the left menu
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 2
7. Copy the final connection string (you'll use this as `DATABASE_URL`)

## Step 4: Enable Database Access

1. Still in **Settings** → **Database**
2. Scroll to **"Connection pooling"**
3. Note: You can use the direct connection string for now
4. For production, you might want to enable connection pooling later

## Step 5: Test Connection (Optional)

You can test the connection string works, but we'll verify it during deployment.

## Next Steps

Once you have the connection string:
1. Add it to Vercel as `DATABASE_URL` environment variable
2. Deploy to Vercel
3. Run Prisma migrations to create tables

Let me know when you have the connection string!

