# Vercel Deployment - Step by Step

## Step 1: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. **Sign in with GitHub** (recommended - connects to your repo automatically)

## Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository: `arjunperi/ChatPredictMiniApp`
3. Click **"Import"**

## Step 3: Configure Project

### Framework Preset
- Vercel should auto-detect **Next.js** ✅
- If not, select "Next.js"

### Root Directory
- Leave as `.` (root)

### Build and Output Settings
- **Build Command:** `prisma generate && next build` (or leave default)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

## Step 4: Set Environment Variables

**Before deploying, add these environment variables:**

Click **"Environment Variables"** and add:

1. **DATABASE_URL**
   - Value: Your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database`
   - Note: You'll need a production database (see Step 5)

2. **TELEGRAM_BOT_TOKEN**
   - Value: `8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA`
   - Environment: Production, Preview, Development (select all)

3. **TELEGRAM_WEBHOOK_SECRET**
   - Value: Your webhook secret (or generate a new one)
   - Environment: Production, Preview, Development (select all)

4. **NEXT_PUBLIC_APP_URL**
   - Value: Will be set automatically after first deploy
   - Format: `https://your-app-name.vercel.app`
   - You can update this after deployment

## Step 5: Set Up Production Database

### Option A: Vercel Postgres (Easiest)

1. In Vercel dashboard → **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Select your project
4. Copy the connection string (starts with `postgresql://`)
5. Use this as your `DATABASE_URL` environment variable

### Option B: Supabase (Free Alternative)

1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create new project
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI format)
6. Use this as your `DATABASE_URL` environment variable

### Option C: Railway Postgres

1. Go to https://railway.app
2. Create new project
3. Add **PostgreSQL** service
4. Copy connection string
5. Use this as your `DATABASE_URL` environment variable

## Step 6: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Get your production URL: `https://your-app-name.vercel.app`

## Step 7: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Option A: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

### Option B: Via Vercel Dashboard

1. Go to your project → **Settings** → **Build & Development Settings**
2. Add build command: `prisma generate && prisma migrate deploy && next build`
3. Redeploy

### Option C: Manual Migration

Connect to your database and run migrations manually, or use a database GUI tool.

## Step 8: Update Telegram Configuration

### Update Webhook

```bash
curl -X POST "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/setWebhook?url=https://YOUR_VERCEL_URL.vercel.app/api/webhook&secret_token=YOUR_SECRET"
```

Replace:
- `YOUR_VERCEL_URL` with your actual Vercel URL
- `YOUR_SECRET` with your `TELEGRAM_WEBHOOK_SECRET`

### Update Mini App URL in @BotFather

1. Open @BotFather in Telegram
2. Send `/mybots`
3. Select `@APChatPredictBot`
4. **Bot Settings** → **Configure Mini App** → **Edit Mini App**
5. Update URL to: `https://YOUR_VERCEL_URL.vercel.app`
6. Save

### Update Environment Variable

1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to: `https://YOUR_VERCEL_URL.vercel.app`
3. Redeploy (or it will auto-update)

## Step 9: Test

1. Send `/start` in your Telegram group
2. Click the button - should open Mini App
3. Test other commands (`/markets`, `/balance`, etc.)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Check that `prisma generate` runs before build

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from internet
- Ensure migrations have run

### Webhook Not Working
- Verify webhook URL is correct
- Check `TELEGRAM_WEBHOOK_SECRET` matches
- Test webhook: `curl https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getWebhookInfo`

### Mini App Not Opening
- Verify `NEXT_PUBLIC_APP_URL` matches Vercel URL
- Check Mini App URL in @BotFather matches production URL
- Ensure short_name deep link is correct

## Next Steps After Deployment

1. ✅ Stop local terminals (ngrok and dev server)
2. ✅ Everything runs on Vercel 24/7
3. ✅ Automatic deployments on git push
4. ✅ Monitor in Vercel dashboard

