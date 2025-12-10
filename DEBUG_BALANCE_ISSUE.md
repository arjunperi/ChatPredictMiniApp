# Debugging Balance Issue

## The Problem
You're getting "Insufficient tokens" error when trying to place a bet. This happens because:
1. **UI was showing hardcoded 1000** - but your real balance in the database might be lower
2. **API checks real balance** - so if you've placed bets before, your balance decreased
3. **Mismatch** - UI shows 1000, but API sees lower balance

## What We Fixed
✅ Created `/api/balance` endpoint to fetch real balance
✅ Updated UI (navigation + market detail) to use real balance API
✅ Added detailed error logging to show: Balance, Required, Shortfall

## How to Test & Debug

### Option 1: Deploy to Vercel (Recommended)
This lets you see logs in Vercel dashboard:

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix balance display and add error logging"
   git push origin main
   ```

2. **Wait for Vercel deployment** (auto-deploys from GitHub)

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Click on `/api/bets` function
   - Look for logs showing: `[Bet API] Balance check:`
   - This will show: `userBalance`, `calculatedCost`, `sufficient`

4. **Test in Telegram:**
   - Open Mini App in Telegram
   - Check if balance shows correctly (should be real balance, not 1000)
   - Try placing a bet
   - If it fails, check Vercel logs for the detailed error

### Option 2: Test Locally with ngrok
If you want to test locally:

1. **Check if dev server is running:**
   ```bash
   # Check if npm dev is running
   ps aux | grep "next dev"
   ```

2. **Check terminal logs:**
   - Look at the terminal where `npm run dev` is running
   - You'll see logs like: `[Bet API] Balance check: {...}`

3. **Use ngrok to expose local server:**
   ```bash
   ngrok http 3000
   ```
   - Update Telegram bot Mini App URL to ngrok URL
   - Test in Telegram
   - Check terminal for logs

### Option 3: Check Your Actual Balance
You can check your real balance in the database:

1. **Via Telegram Bot:**
   - Send `/balance` command to your bot
   - It will show your actual token balance

2. **Via API (if you have access):**
   - Open: `https://your-vercel-url.vercel.app/api/balance` in browser
   - (Won't work without Telegram auth, but you can check the endpoint exists)

3. **Via Supabase Dashboard:**
   - Go to Supabase Dashboard → Table Editor → `User` table
   - Find your user (by `telegramId`)
   - Check `tokenBalance` column

## What to Look For

### In Error Messages:
The new error message will show:
```
Insufficient tokens. Balance: X, Required: Y, Shortfall: Z
```

This tells you:
- **Balance (X)**: Your actual balance in database
- **Required (Y)**: Cost calculated by LMSR algorithm
- **Shortfall (Z)**: How much more you need

### In Logs:
Look for:
```
[Bet API] Balance check: {
  userBalance: 500,        // Your actual balance
  requestedAmount: 100,    // What you tried to bet
  calculatedCost: 105,     // What LMSR calculated (might be slightly higher)
  shares: 95.2,            // Shares you'd get
  sufficient: false        // Whether you have enough
}
```

## Common Issues

### Issue 1: Balance shows 0
**Cause:** User doesn't exist in database yet
**Fix:** The `getOrCreateUser` function should create user with 1000 tokens automatically

### Issue 2: Balance is lower than expected
**Cause:** You've placed bets before, which deducted tokens
**Fix:** This is correct behavior - your balance decreases when you bet

### Issue 3: Cost is higher than requested amount
**Cause:** LMSR algorithm calculates cost based on market state
**Fix:** This is normal - the cost might be slightly higher than your input amount due to market dynamics

## Next Steps

1. **Deploy to Vercel** (easiest way to see logs)
2. **Test in Telegram** - check if balance shows correctly
3. **Try placing a bet** - see the detailed error message
4. **Check Vercel logs** - see the balance check details
5. **Report back** with:
   - What balance shows in UI
   - What error message you get
   - What the logs show

