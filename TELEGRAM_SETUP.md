# Telegram Mini App Setup Guide

## Step-by-Step: Testing on Telegram

### Prerequisites
- Telegram account
- Bot token from @BotFather (you already have one: `8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA`)
- ngrok installed (for local testing) OR a deployed URL (for production)

---

## Option 1: Local Testing with ngrok (Recommended for Development)

### Step 1: Install ngrok

**macOS:**
```bash
brew install ngrok
# OR download from https://ngrok.com/download
```

**Other platforms:**
- Download from https://ngrok.com/download
- Or use `npm install -g ngrok` (if available)

### Step 2: Start Your Development Server

```bash
# Make sure you have .env.local set up
cp env.example .env.local

# Start the dev server
npm run dev
```

Your app should be running on `http://localhost:3000`

### Step 3: Expose Local Server with ngrok

In a **new terminal window**, run:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (the one starting with `https://`)

### Step 4: Update Environment Variable

Update your `.env.local`:

```bash
NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"
```

**Important:** Restart your dev server after updating `.env.local`:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Step 5: Configure Bot with @BotFather

1. Open Telegram and search for **@BotFather**
2. Send the command: `/newapp`
3. Select your bot (the one with token `8578438649:...`)
4. Follow the prompts:
   - **App title:** `ChatPredict`
   - **Short description:** `Prediction markets for Telegram groups`
   - **Photo:** (Optional - upload an icon if you have one)
   - **Web App URL:** Paste your ngrok URL: `https://your-ngrok-url.ngrok.io`
   - **Short name:** `chatpredict` (or leave default)

5. BotFather will confirm the Mini App is created

### Step 6: Test in Telegram

1. Open your bot in Telegram (search for your bot username)
2. Click the **"Open App"** button (or send `/start` and click the button)
3. The Mini App should open with Telegram authentication!

---

## Option 2: Production Testing (Deploy First)

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: chatpredict-miniapp
# - Directory: ./
# - Override settings? No
```

### Step 2: Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `TELEGRAM_BOT_TOKEN` - Your bot token
   - `NEXT_PUBLIC_APP_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 3: Configure Bot with Production URL

1. Open @BotFather
2. Send: `/myapps`
3. Select your bot
4. Choose **"Edit Mini App"**
5. Update **Web App URL** to your Vercel URL: `https://your-app.vercel.app`

### Step 4: Test in Telegram

Same as Step 6 above - open your bot and click "Open App"

---

## Troubleshooting

### Issue: "Mini App not loading"

**Solutions:**
1. ✅ Check that your server is running (`npm run dev`)
2. ✅ Verify ngrok is forwarding correctly (check ngrok dashboard: http://localhost:4040)
3. ✅ Ensure the URL in BotFather matches your ngrok URL exactly
4. ✅ Check browser console for errors (in Telegram, tap the Mini App → "Open in Browser")

### Issue: "Authentication failed"

**Solutions:**
1. ✅ Verify `TELEGRAM_BOT_TOKEN` in `.env.local` matches your bot token
2. ✅ Restart dev server after changing `.env.local`
3. ✅ Check that `NEXT_PUBLIC_APP_URL` matches your ngrok URL

### Issue: "CORS errors"

**Solutions:**
1. ✅ Telegram Mini Apps should handle CORS automatically
2. ✅ Make sure you're using HTTPS (ngrok provides this)
3. ✅ Check Next.js config - should be fine by default

### Issue: "Database connection errors"

**Solutions:**
1. ✅ Verify `DATABASE_URL` in `.env.local` is correct
2. ✅ Test database connection: `npx prisma studio` (should open Prisma Studio)
3. ✅ Check if your database allows connections from your IP

### Issue: "ngrok URL changes every time"

**Solutions:**
1. **Free ngrok:** URL changes on restart - update BotFather each time
2. **Paid ngrok:** Use a static domain
3. **Alternative:** Use Cloudflare Tunnel (free, static domain)

---

## Quick Test Checklist

Once your Mini App opens in Telegram:

- [ ] ✅ App loads without errors
- [ ] ✅ Navigation works (Home, Markets, Portfolio, Leaderboard)
- [ ] ✅ Can see markets list
- [ ] ✅ Can create a market
- [ ] ✅ Can view market details
- [ ] ✅ Can place a bet (buy shares)
- [ ] ✅ Balance updates after betting
- [ ] ✅ Portfolio shows your positions
- [ ] ✅ Leaderboard displays

---

## Testing Tips

1. **Keep ngrok running** - Don't close the ngrok terminal while testing
2. **Check ngrok dashboard** - Visit http://localhost:4040 to see requests
3. **Use Telegram Desktop** - Easier to debug than mobile
4. **Check server logs** - Watch the terminal where `npm run dev` is running
5. **Test with multiple users** - Open the bot in different Telegram accounts

---

## Next Steps After Testing

1. Fix any bugs found
2. Deploy to production (Vercel recommended)
3. Update BotFather with production URL
4. Share your bot with test users
5. Gather feedback and iterate

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# In another terminal - expose with ngrok
ngrok http 3000

# Update .env.local with ngrok URL
echo 'NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"' >> .env.local

# Restart dev server
# (Ctrl+C then npm run dev)

# View database
npx prisma studio
```

---

## Need Help?

- Check `TESTING.md` for detailed testing guide
- Check server logs for errors
- Check ngrok dashboard at http://localhost:4040
- Verify environment variables are set correctly

