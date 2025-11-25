# How to Add Environment Variables in Vercel

## Step 1: Import Project First

1. In Vercel, click **"Add New..."** → **"Project"**
2. Find `arjunperi/ChatPredictMiniApp`
3. Click **"Import"**
4. **Don't deploy yet!** We need to add environment variables first.

## Step 2: Add Environment Variables

**Before clicking "Deploy", add environment variables:**

### Option A: During Import (Before Deploy)

1. After clicking "Import", you'll see the project configuration page
2. Look for **"Environment Variables"** section (usually below Framework Preset)
3. Click **"Add"** or **"Add Environment Variable"**
4. Add each variable one by one

### Option B: After Import (Before Deploy)

1. After importing, you'll see the project page
2. Click on **"Settings"** tab (at the top)
3. Click **"Environment Variables"** in the left sidebar
4. Click **"Add New"** button
5. Add each variable

## Step 3: Add These Variables

Add these environment variables one by one:

### 1. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** Your Supabase connection string
  ```
  postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres
  ```
- **Environment:** Select all (Production, Preview, Development)

### 2. TELEGRAM_BOT_TOKEN
- **Key:** `TELEGRAM_BOT_TOKEN`
- **Value:** `8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA`
- **Environment:** Select all (Production, Preview, Development)

### 3. TELEGRAM_WEBHOOK_SECRET
- **Key:** `TELEGRAM_WEBHOOK_SECRET`
- **Value:** Your webhook secret (or create a new one, e.g., `my_secret_123`)
- **Environment:** Select all (Production, Preview, Development)

### 4. NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** Leave empty for now - we'll update after first deploy
- **Environment:** Select all (Production, Preview, Development)
- **Note:** After deployment, update this to your Vercel URL

## Step 4: Deploy

1. After adding all environment variables
2. Click **"Deploy"** button
3. Wait for build to complete (2-5 minutes)
4. Get your production URL: `https://your-app-name.vercel.app`

## If You Already Deployed

If you already clicked "Deploy" without adding variables:

1. Go to your project in Vercel dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left sidebar
4. Add the variables
5. Go to **"Deployments"** tab
6. Click **"Redeploy"** on the latest deployment
7. Or push a new commit to trigger redeploy

## Visual Guide

The environment variables section looks like this:
```
┌─────────────────────────────────────┐
│ Environment Variables               │
├─────────────────────────────────────┤
│ Key              Value    Environment│
│ DATABASE_URL     [hidden] [✓✓✓]     │
│ TELEGRAM_BOT...  [hidden] [✓✓✓]     │
│ ...                                 │
│                                     │
│ [+ Add New]                         │
└─────────────────────────────────────┘
```

## Troubleshooting

**Can't find Environment Variables?**
- Make sure you're in the project settings, not the import page
- Look for "Settings" tab after importing
- It might be under "Build & Development Settings"

**Variables not showing after adding?**
- Make sure you selected the right environment (Production/Preview/Development)
- Try refreshing the page
- Check if you're in the right project

Let me know if you can find the Environment Variables section now!

