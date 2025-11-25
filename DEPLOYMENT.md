# Deployment Guide - Run Without Local Terminals

## Current Setup (Local Development)

- **Terminal 1:** ngrok tunnel (`ngrok http 3000`)
- **Terminal 2:** Next.js dev server (`npm run dev`)
- **URL:** `https://outermost-lower-stephanie.ngrok-free.dev` (temporary, changes on restart)

## Goal: Production Deployment

Deploy to a hosting service so it runs 24/7 without your local terminals.

## Option 1: Vercel (Recommended for Next.js)

### Why Vercel?
- ✅ Built for Next.js (made by Next.js creators)
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy deployment from GitHub
- ✅ Environment variables management
- ✅ Automatic deployments on git push

### Steps:

1. **Push code to GitHub** (already done ✅)

2. **Sign up for Vercel:**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import your repository: `arjunperi/ChatPredictMiniApp`

3. **Configure Environment Variables:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from your `.env`:
     ```
     DATABASE_URL=your_postgres_url
     TELEGRAM_BOT_TOKEN=8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA
     TELEGRAM_WEBHOOK_SECRET=your_secret
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app (will be set automatically)
     ```

4. **Deploy:**
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Get your production URL: `https://your-app-name.vercel.app`

5. **Update Telegram Configuration:**
   - Update webhook: `curl -X POST "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/setWebhook?url=https://your-app.vercel.app/api/webhook&secret_token=YOUR_SECRET"`
   - Update Mini App URL in @BotFather: `/mybots` → Configure Mini App → Edit → Set new URL
   - Update code: Change `NEXT_PUBLIC_APP_URL` in Vercel environment variables

## Option 2: Railway

### Why Railway?
- ✅ Easy PostgreSQL setup
- ✅ Free tier available
- ✅ Simple deployment
- ✅ Automatic HTTPS

### Steps:

1. **Sign up:** https://railway.app
2. **Create new project** → Deploy from GitHub
3. **Add PostgreSQL database** (if needed)
4. **Set environment variables**
5. **Deploy**

## Option 3: Render

### Why Render?
- ✅ Free tier available
- ✅ PostgreSQL included
- ✅ Easy setup

### Steps:

1. **Sign up:** https://render.com
2. **Create Web Service** → Connect GitHub repo
3. **Add PostgreSQL database**
4. **Set environment variables**
5. **Deploy**

## Required Environment Variables

Make sure these are set in your hosting platform:

```bash
DATABASE_URL=postgresql://...          # Your PostgreSQL connection string
TELEGRAM_BOT_TOKEN=8578438649:...     # Your bot token
TELEGRAM_WEBHOOK_SECRET=your_secret   # Webhook secret (optional but recommended)
NEXT_PUBLIC_APP_URL=https://...       # Your production URL (set automatically on Vercel)
```

## After Deployment

### 1. Update Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/setWebhook?url=https://YOUR_PRODUCTION_URL/api/webhook&secret_token=YOUR_SECRET"
```

### 2. Update Mini App URL in @BotFather

1. Open @BotFather
2. `/mybots` → Select `@APChatPredictBot`
3. **Bot Settings** → **Configure Mini App** → **Edit Mini App**
4. Update URL to your production URL: `https://your-app.vercel.app`
5. Save

### 3. Update Code (if short_name changes)

If you need to update the short_name deep link, edit `app/api/webhook/route.ts`:

```typescript
const telegramDeepLink = `https://t.me/${BOT_USERNAME}/mini3`;
```

## Database Setup

If you need a production database:

### Option A: Vercel Postgres
- Built into Vercel
- Easy setup in dashboard

### Option B: Supabase (Free)
- https://supabase.com
- Free PostgreSQL database
- Get connection string

### Option C: Railway Postgres
- Add PostgreSQL service
- Get connection string

## Migration Steps

1. **Deploy to production** (Vercel/Railway/Render)
2. **Set environment variables** in hosting platform
3. **Run Prisma migrations:**
   ```bash
   npx prisma migrate deploy
   ```
   (Or set up in hosting platform's build command)

4. **Update Telegram webhook** to production URL
5. **Update Mini App URL** in @BotFather
6. **Test** - Send `/start` in your group

## Stopping Local Development

Once deployed:
- ✅ Stop Terminal 1 (ngrok) - no longer needed
- ✅ Stop Terminal 2 (dev server) - no longer needed
- ✅ Everything runs on production server 24/7

## Recommended: Vercel

For Next.js apps, **Vercel is the easiest option**:
- Zero configuration needed
- Automatic deployments
- Free tier is generous
- Built for Next.js

Would you like me to help you deploy to Vercel?

