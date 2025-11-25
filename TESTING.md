# Testing Guide for ChatPredict Mini App

## Prerequisites

1. **Node.js** (v20 or higher)
2. **PostgreSQL Database** (already configured in env.example)
3. **Telegram Bot Token** (from @BotFather)

## Step 1: Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

2. Update `.env.local` with your actual values:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
   - `NEXT_PUBLIC_APP_URL` - Your app URL (use `http://localhost:3000` for local testing)

## Step 2: Database Setup

1. Generate Prisma client:
```bash
npx prisma generate
```

2. (Optional) Run migrations if you have any:
```bash
npx prisma migrate dev
```

## Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 4: Testing Options

### Option A: Test Locally (Without Telegram)

For basic functionality testing without Telegram authentication:

1. **Temporarily disable auth** in API routes for testing:
   - Comment out `requireTelegramAuth` calls in API routes
   - Use mock user IDs for testing

2. **Test the UI:**
   - Open `http://localhost:3000` in your browser
   - Navigate through all pages
   - Test market creation, trading, portfolio, leaderboard

### Option B: Test as Telegram Mini App (Recommended)

#### Setup Telegram Mini App:

1. **Get your bot token** from @BotFather if you don't have one:
   ```
   /newbot
   ```

2. **Set up Mini App** with @BotFather:
   ```
   /newapp
   ```
   - Select your bot
   - Provide app title: "ChatPredict"
   - Provide short description
   - Upload app icon (optional)
   - Provide web app URL: `https://your-domain.com` (or use ngrok for local testing)

3. **For Local Testing with Telegram:**
   
   Use **ngrok** to expose your local server:
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3000
   ```
   
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and use it as your Mini App URL in BotFather.

4. **Update environment:**
   ```bash
   NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"
   ```

5. **Open Mini App:**
   - Open your bot in Telegram
   - Click the "Open App" button or use `/start` command
   - The Mini App will open with Telegram authentication

## Step 5: Testing Checklist

### Core Features to Test:

#### 1. **Home/Dashboard** (`/`)
- [ ] Page loads without errors
- [ ] Stats cards display correctly
- [ ] Recent markets show up
- [ ] Navigation works

#### 2. **Markets List** (`/markets`)
- [ ] Markets display correctly
- [ ] Search functionality works
- [ ] Filters (status, sort) work
- [ ] Create Market button opens modal
- [ ] Market cards are clickable

#### 3. **Market Creation**
- [ ] Modal opens/closes correctly
- [ ] Form validation works (min 10 chars, etc.)
- [ ] Can create market successfully
- [ ] Redirects to market detail after creation

#### 4. **Market Detail** (`/markets/[id]`)
- [ ] Market information displays correctly
- [ ] Probability bars show correct percentages
- [ ] Trading panel appears
- [ ] Can select YES/NO outcome
- [ ] Amount input works
- [ ] Price preview updates correctly
- [ ] Can place a bet
- [ ] Position displays after betting

#### 5. **Trading**
- [ ] Buy YES shares works
- [ ] Buy NO shares works
- [ ] Price preview shows correct cost/shares
- [ ] Insufficient balance error shows correctly
- [ ] Sell shares works (if you have positions)
- [ ] Balance updates after trades

#### 6. **Portfolio** (`/portfolio`)
- [ ] Portfolio summary displays
- [ ] Active positions list shows
- [ ] Transaction history displays
- [ ] P&L calculations are correct

#### 7. **Leaderboard** (`/leaderboard`)
- [ ] Leaderboard displays top users
- [ ] Filters work (all-time, week, month)
- [ ] Rankings are correct

#### 8. **Market Resolution** (as creator)
- [ ] Resolve button appears for market creator
- [ ] Resolution modal opens
- [ ] Can select YES/NO resolution
- [ ] Market resolves successfully
- [ ] Payouts are distributed correctly

### API Testing

You can also test API endpoints directly:

```bash
# Get markets
curl http://localhost:3000/api/markets

# Create market (requires Telegram auth header)
curl -X POST http://localhost:3000/api/markets \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <telegram-init-data>" \
  -d '{"question": "Will it rain tomorrow?", "liquidity": 100}'

# Get market by ID
curl http://localhost:3000/api/markets/<market-id>

# Place bet (requires Telegram auth)
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <telegram-init-data>" \
  -d '{"marketId": "<market-id>", "outcome": "YES", "amount": 100}'
```

## Step 6: Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Check your `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running.

### Issue: "Telegram authentication failed"
**Solution:** 
- Ensure `TELEGRAM_BOT_TOKEN` is correct
- For local testing, you may need to temporarily disable auth or use ngrok

### Issue: "Module not found" errors
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: "Prisma client not generated"
**Solution:** Run `npx prisma generate`

### Issue: Build errors
**Solution:** Run `npm run build` to see detailed error messages and fix TypeScript issues.

## Step 7: Production Testing

Before deploying:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

4. **Update Telegram Bot:**
   - Set Mini App URL to your production domain
   - Test the Mini App in Telegram

## Debugging Tips

1. **Check browser console** for client-side errors
2. **Check server logs** in terminal where `npm run dev` is running
3. **Use React Query DevTools** (can be added for debugging)
4. **Check Network tab** in browser DevTools to see API calls
5. **Verify database** - use Prisma Studio: `npx prisma studio`

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance
3. Add missing features
4. Deploy to production
5. Monitor usage and gather feedback

