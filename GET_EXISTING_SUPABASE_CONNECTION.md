# Get Connection String from Existing Supabase Project

## Steps to Get Your Database Connection String

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Log in if needed

2. **Select Your Project**
   - Find and click on your `chatpredict` project

3. **Go to Settings**
   - Click the **gear icon** (⚙️) in the left sidebar
   - Or go to **Settings** → **Database**

4. **Get Connection String**
   - Scroll down to **"Connection string"** section
   - Click on the **"URI"** tab
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

5. **Replace Password Placeholder**
   - The `[YOUR-PASSWORD]` is a placeholder
   - You need to replace it with your actual database password
   - If you forgot the password, you can reset it in Settings → Database → Database password

6. **Copy the Final Connection String**
   - It should look like:
     ```
     postgresql://postgres:your_actual_password@db.xxxxx.supabase.co:5432/postgres
     ```
   - This is your `DATABASE_URL` for Vercel

## Alternative: Connection Pooling (Recommended for Production)

For better performance, you can use connection pooling:

1. Still in **Settings** → **Database**
2. Scroll to **"Connection pooling"**
3. Copy the **"Connection string"** from the pooling section
4. It will look like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your password

**Note:** Connection pooling is better for serverless environments like Vercel.

## Next Steps

Once you have the connection string:
1. Add it to Vercel as `DATABASE_URL` environment variable
2. Deploy to Vercel
3. Run Prisma migrations (if needed) to ensure tables exist

Let me know when you have the connection string!

