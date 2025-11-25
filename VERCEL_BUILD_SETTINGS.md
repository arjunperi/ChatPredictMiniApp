# Vercel Build and Output Settings

## Build Settings for Next.js + Prisma

### Framework Preset
- Should auto-detect: **Next.js** ✅
- If not, select "Next.js"

### Root Directory
- Leave as `.` (root directory)

### Build Command
**Change this to:**
```
prisma generate && next build
```

This ensures Prisma generates the client before building.

**Or leave default** (`next build`) if you add `prisma generate` to your `package.json` scripts.

### Output Directory
- Leave as `.next` (auto-detected) ✅

### Install Command
- Leave as `npm install` (auto-detected) ✅

### Development Command
- Leave as `next dev` (auto-detected) ✅

## After Configuring Build Settings

1. **Look for "Environment Variables" section** (usually below Build Settings)
2. **Add your environment variables** there before deploying
3. **Then click "Deploy"**

## If You Don't See Environment Variables Section

1. Click **"Deploy"** anyway (you can add them later)
2. After deployment, go to **Settings** → **Environment Variables**
3. Add the variables
4. **Redeploy** (or push a new commit)

## Quick Checklist

- ✅ Framework: Next.js
- ✅ Build Command: `prisma generate && next build` (or default)
- ✅ Output Directory: `.next`
- ✅ Environment Variables: Add before deploy (or after)
- ✅ Then: Deploy!

