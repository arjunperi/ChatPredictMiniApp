# ChatPredict Mini App Testing Guide

## Pre-Testing Setup

1. **Open Mini App in Telegram**
   - Open Telegram → Your bot (@APChatPredictBot)
   - Click "Open App" button or use `/start` command in group chat
   - Mini App should load in Telegram's WebView

2. **Verify You're Testing on Vercel**
   - Check URL bar shows: `https://chat-predict-mini-app.vercel.app`
   - Not localhost or ngrok URL

3. **Open Browser Dev Tools** (for debugging)
   - In Telegram Mini App, you can't directly access dev tools
   - For testing, you can open the Vercel URL directly in a browser
   - Or use Telegram Desktop which allows inspecting WebView

## Core Feature Tests

### Test 1: Markets Page ✅
**Goal:** Verify markets list loads and displays correctly

**Steps:**
1. Navigate to Markets page (click "Markets" in navigation)
2. Wait for markets to load
3. Check if markets display (may be empty if no markets exist)

**Expected Results:**
- ✅ Markets page loads without "Error loading markets" message
- ✅ Page loads quickly (< 2 seconds)
- ✅ Shows markets list OR empty state message
- ✅ No loading spinner stuck forever

**What to Check:**
- Look for any error messages
- Verify page is responsive (not frozen)
- Check browser console for errors (if accessible)

**If it fails:**
- Check Vercel Function Logs → `/api/markets` endpoint
- Look for database connection errors or Prisma errors
- Verify `DATABASE_URL` is set correctly in Vercel

---

### Test 2: Create a Market ✅
**Goal:** Verify market creation works end-to-end

**Steps:**
1. On Markets page, click "Create Market" button
2. Fill in market question: "Will it rain tomorrow?"
3. Optionally set a closing date
4. Click "Create" or "Submit"

**Expected Results:**
- ✅ Modal/form opens correctly
- ✅ Form validation works (try submitting empty form - should show error)
- ✅ Market creates successfully
- ✅ Redirects to market detail page
- ✅ New market appears in markets list

**What to Check:**
- Success message appears
- Market detail page shows your question
- Market appears in markets list when you go back

**If it fails:**
- Check Vercel Function Logs → `/api/markets` POST endpoint
- Verify Telegram authentication is working
- Check if user exists in database

---

### Test 3: View Market Detail ✅
**Goal:** Verify market detail page displays correctly

**Steps:**
1. Click on any market card (or the one you just created)
2. View the market detail page

**Expected Results:**
- ✅ Market question displays
- ✅ Probability bars show YES/NO percentages
- ✅ Trading panel is visible
- ✅ Market info (creator, created date) displays
- ✅ Current probability is shown

**What to Check:**
- All market information is visible
- Page layout looks correct
- No missing data or broken UI

---

### Test 4: Place a Bet (Buy Shares) ✅
**Goal:** Verify betting functionality works

**Steps:**
1. On market detail page, select "YES" or "NO" outcome
2. Enter bet amount (e.g., 50 tokens)
3. Review the price preview (cost, shares, new probability)
4. Click "Buy" button

**Expected Results:**
- ✅ Trading panel shows YES/NO tabs
- ✅ Amount input accepts numbers
- ✅ Price preview updates as you type
- ✅ Bet places successfully
- ✅ Success message/notification appears
- ✅ Balance updates (if balance API is working)

**What to Check:**
- No "Insufficient tokens" error (balance is hardcoded to 1000)
- Bet appears in your positions
- Market probability updates after bet

**If it fails:**
- Check Vercel Function Logs → `/api/bets` POST endpoint
- Verify Telegram authentication headers are being sent
- Check user exists in database
- Verify balance is sufficient

---

### Test 5: Sell Shares ✅
**Goal:** Verify selling shares works (if you have positions)

**Steps:**
1. Go to a market where you have a position
2. Click "Sell" tab in trading panel
3. Select shares to sell (or sell all)
4. Click "Sell" button

**Expected Results:**
- ✅ Sell tab shows your position
- ✅ Can select number of shares to sell
- ✅ Payout preview shows correctly
- ✅ Sell executes successfully
- ✅ Balance increases by payout amount

**What to Check:**
- Position updates after selling
- Balance reflects the payout

**If it fails:**
- Check Vercel Function Logs → `/api/bets/sell` endpoint
- Verify you have shares to sell
- Check payout calculation is correct

---

### Test 6: Leaderboard ✅
**Goal:** Verify leaderboard loads and displays

**Steps:**
1. Navigate to Leaderboard page (click "Leaderboard" in navigation)
2. Wait for leaderboard to load

**Expected Results:**
- ✅ Leaderboard page loads without errors
- ✅ Shows top users ranked by balance
- ✅ Displays username, balance, total bets
- ✅ Page loads quickly

**What to Check:**
- No "Error loading leaderboard" message
- Table displays correctly
- Your user appears in the list (if you have bets)

**If it fails:**
- Check Vercel Function Logs → `/api/leaderboard` endpoint
- Look for database connection errors
- Verify Prisma queries are working

---

### Test 7: Portfolio Page ✅
**Goal:** Verify portfolio displays user data

**Steps:**
1. Navigate to Portfolio page (click "Portfolio" in navigation)
2. View your portfolio

**Expected Results:**
- ✅ Portfolio page loads
- ✅ Shows token balance
- ✅ Shows active positions (if any)
- ✅ Shows transaction history (if any)
- ✅ Displays P&L summary

**What to Check:**
- All sections display correctly
- Data matches your actual bets/positions

**If it fails:**
- Check if portfolio API endpoint exists
- Verify user data is being fetched correctly

---

### Test 8: Balance Display ✅
**Goal:** Verify balance shows correctly in navigation

**Steps:**
1. Look at top right corner of navigation bar
2. Check balance number

**Expected Results:**
- ✅ Balance displays in navigation (currently hardcoded to 1000)
- ✅ Balance is visible on all pages

**Note:** Balance is currently hardcoded in `components/layout/navigation.tsx` (line 22), so it should always show 1000 regardless of actual balance.

---

### Test 9: Market Resolution (If You Created Market) ✅
**Goal:** Verify you can resolve markets you created

**Steps:**
1. Go to a market you created
2. Look for "Resolve" button (should appear for creator)
3. Click "Resolve"
4. Select YES or NO resolution
5. Confirm resolution

**Expected Results:**
- ✅ Resolve button appears for market creator
- ✅ Resolution modal opens
- ✅ Can select YES/NO
- ✅ Market resolves successfully
- ✅ Payouts are distributed to winners

**What to Check:**
- Market status changes to RESOLVED
- Winners receive payouts
- Market no longer accepts new bets

**If it fails:**
- Check Vercel Function Logs → `/api/markets/[id]/resolve` endpoint
- Verify you are the market creator
- Check payout calculation

---

### Test 10: Navigation and Routing ✅
**Goal:** Verify all navigation works

**Steps:**
1. Navigate between all pages: Home → Markets → Portfolio → Leaderboard
2. Use browser back button
3. Click logo to go home

**Expected Results:**
- ✅ All navigation links work
- ✅ Pages load correctly
- ✅ Back button works
- ✅ No broken routes

---

## Performance Tests

### Test 11: App Responsiveness ✅
**Goal:** Verify app is fast and responsive

**Steps:**
1. Navigate between pages quickly
2. Create multiple markets
3. Place multiple bets

**Expected Results:**
- ✅ Pages load quickly (< 2 seconds)
- ✅ No noticeable lag
- ✅ UI is responsive to interactions
- ✅ No frozen screens

**What to Check:**
- Page load times
- API response times
- UI responsiveness

---

## Error Handling Tests

### Test 12: Error Scenarios ✅
**Goal:** Verify error handling works

**Steps:**
1. Try to create market with invalid data (empty question, too short)
2. Try to bet more than balance (if balance API is working)
3. Try to access non-existent market

**Expected Results:**
- ✅ Validation errors display correctly
- ✅ Error messages are clear and helpful
- ✅ App doesn't crash on errors

**What to Check:**
- Error messages are user-friendly
- App recovers gracefully from errors

---

## Final Verification Checklist

After completing all tests, verify:

- [ ] Markets page loads correctly
- [ ] Can create markets successfully
- [ ] Market detail pages display correctly
- [ ] Can place bets (buy shares)
- [ ] Can sell shares (if applicable)
- [ ] Leaderboard loads correctly
- [ ] Portfolio displays user data
- [ ] Balance shows in navigation
- [ ] Can resolve markets (as creator)
- [ ] Navigation works between all pages
- [ ] App is fast and responsive
- [ ] Error handling works correctly
- [ ] No console errors in browser dev tools
- [ ] No errors in Vercel Function Logs

---

## Troubleshooting Guide

### If markets don't load:
1. Check browser console for errors (if accessible)
2. Check Vercel Function Logs for `/api/markets` endpoint
3. Verify database connection is working
4. Check `DATABASE_URL` environment variable in Vercel
5. Verify Prisma client is properly initialized

### If betting fails:
1. Check Telegram authentication headers are being sent
2. Verify user exists in database
3. Check balance is sufficient (currently hardcoded to 1000)
4. Check Vercel Function Logs for `/api/bets` endpoint
5. Verify LMSR calculation is working

### If app is slow:
1. Check network tab for slow API calls (if accessible)
2. Check Vercel Function Logs for slow endpoints
3. Verify database queries are optimized
4. Check Prisma connection pooling settings
5. Verify no connection pool exhaustion

### If leaderboard fails:
1. Check Vercel Function Logs for `/api/leaderboard` endpoint
2. Verify database connection
3. Check Prisma queries are correct
4. Verify users exist in database

### General Debugging:
1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Click on specific function to see logs
   - Look for error messages or slow queries

2. **Check Database:**
   - Go to Supabase Dashboard
   - Verify tables exist and have data
   - Check if users and markets are being created

3. **Check Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DATABASE_URL` is set correctly
   - Verify `TELEGRAM_BOT_TOKEN` is set

---

## Success Criteria

The app is working correctly if:
- ✅ All core features work (create market, bet, sell)
- ✅ All pages load without errors
- ✅ App is responsive and fast
- ✅ No critical bugs or crashes
- ✅ User can complete full workflow: create → bet → resolve
- ✅ No errors in Vercel Function Logs
- ✅ Database operations work correctly

---

## Testing Notes

- **Balance is hardcoded:** Currently shows 1000 tokens in navigation, regardless of actual balance
- **Single account testing:** You can test all features with one Telegram account
- **Database state:** Markets and bets persist between sessions
- **Telegram auth:** Required for creating markets and placing bets

---

## Next Steps After Testing

If all tests pass:
1. ✅ App is ready for use
2. Consider fixing hardcoded balance to use real API
3. Add more markets and test with multiple users

If tests fail:
1. Document specific failures
2. Check Vercel logs for errors
3. Fix issues and retest
4. Update this guide with solutions

