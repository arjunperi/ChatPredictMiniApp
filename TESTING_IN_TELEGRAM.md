# Testing Guide: Telegram Mini App

## Quick Test Checklist

### ✅ Prerequisites (Verify These First)

1. **Terminal 1**: ngrok running (`ngrok http 3000`)
2. **Terminal 2**: Dev server running (`npm run dev` on port 3000)
3. **Webhook**: Configured and active
4. **Bot**: Added to your test group

---

## Test 1: Bot Commands in Group

### Step 1: Open Your Test Group

1. Open Telegram
2. Go to your test group (where you added the bot)

### Step 2: Test `/start` Command

Send this message in the group:
```
/start
```

**Expected Result:**
- Bot responds with welcome message
- Message includes a button: "🚀 Open ChatPredict"
- Button opens the Mini App

**If it doesn't work:**
- Check Terminal 2 (dev server) for webhook requests
- Check Terminal 1 (ngrok) for incoming requests
- Verify webhook is set: `./scripts/check-bot-setup.sh`

---

## Test 2: Create Market via Bot Command

### Step 1: Send Command

In your group, send:
```
/create_market Will it rain tomorrow?
```

**Expected Result:**
- Bot responds: "✅ Market Created!"
- Shows market question
- Button: "📈 Trade This Market"
- Button opens Mini App to that specific market

**Verify:**
- Market appears in Mini App
- Market is scoped to the group (check `chatId`)

---

## Test 3: Open Mini App from Group

### Option A: From Bot Response Button

1. Bot sends message with button (from `/start` or `/create_market`)
2. Tap the button: "🚀 Open ChatPredict"
3. Mini App should open

### Option B: From Bot Profile

1. In the group, tap the bot's name (`@APChatPredictBot`)
2. Tap "Open App" or Mini App button
3. Mini App should open

**Expected Result:**
- Mini App opens
- Shows home page
- Should show "📍 Group Mode" indicator (if `chatId` detected)
- Markets list shows group markets

---

## Test 4: Create Market in Mini App

### Step 1: Open Mini App

From group → Tap bot name → "Open App"

### Step 2: Create Market

1. Click "Create Market" button
2. Enter question: "Will Bitcoin hit $100k this year?"
3. Click "Create Market"

**Expected Result:**
- Market created successfully
- Redirects to market detail page
- Market is scoped to the group (`chatId`)

**Verify:**
- Other group members see the market
- Market appears in `/markets` command

---

## Test 5: Trade in Mini App

### Step 1: Open a Market

From markets list, click on any market

### Step 2: Place a Bet

1. Select YES or NO
2. Enter amount (e.g., 100 tokens)
3. Click "Buy Shares"

**Expected Result:**
- Bet placed successfully
- Balance updates
- Position shows your shares
- Price updates based on LMSR

**Verify:**
- Balance decreases by cost
- Position shows in portfolio
- Market probability updates

---

## Test 6: Group Scoping

### Test with Multiple Users

1. **User A** (you): Create a market in the group
2. **User B** (friend): Open Mini App from same group
3. **User B**: Should see the market User A created

**Expected Result:**
- Both users see same markets (scoped to group)
- Markets created in group appear to all group members
- Markets created in private chat don't appear in group

---

## Test 7: All Bot Commands

Try these commands in your group:

### `/markets`
```
/markets
```
**Expected:** List of active markets + button

### `/balance`
```
/balance
```
**Expected:** Your token balance + portfolio button

### `/help`
```
/help
```
**Expected:** List of commands + Mini App button

---

## Troubleshooting

### Bot Not Responding?

1. **Check webhook:**
   ```bash
   curl "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getWebhookInfo"
   ```

2. **Check Terminal 2** (dev server logs)
   - Should see POST requests to `/api/webhook`
   - Check for errors

3. **Check Terminal 1** (ngrok)
   - Visit http://localhost:4040
   - Should see requests to `/api/webhook`

4. **Restart webhook:**
   ```bash
   ./scripts/setup-webhook.sh
   ```

### Mini App Not Opening?

1. **Check ngrok URL** matches webhook URL
2. **Check @BotFather**: Run `/myapps` → Verify URL
3. **Check dev server** is running on port 3000
4. **Try direct link**: `https://t.me/APChatPredictBot/app`

### ChatId Not Detected?

1. **Check browser console** (in Telegram Mini App)
   - Tap Mini App → "Open in Browser"
   - Check console for `chatId` value

2. **Manual test**: Add `?chatId=123456789` to URL

3. **Check context**: Verify `TelegramContext` is working

### Markets Not Scoped to Group?

1. **Check market `chatId`** in database:
   ```bash
   npx prisma studio
   # Check Market table → chatId field
   ```

2. **Verify group chat ID** is correct
3. **Check API filtering** by `chatId`

---

## Quick Test Script

Save this and run it to test everything:

```bash
#!/bin/bash

echo "🧪 Testing ChatPredict Setup..."
echo ""

# Test 1: Dev server
echo "1. Testing dev server..."
if curl -s http://localhost:3000/api/webhook > /dev/null; then
  echo "   ✅ Dev server running"
else
  echo "   ❌ Dev server NOT running"
fi

# Test 2: ngrok
echo "2. Testing ngrok..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)
if [ ! -z "$NGROK_URL" ]; then
  echo "   ✅ ngrok running: $NGROK_URL"
else
  echo "   ❌ ngrok NOT running"
fi

# Test 3: Webhook
echo "3. Testing webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getWebhookInfo")
if echo "$WEBHOOK_INFO" | grep -q '"url"'; then
  echo "   ✅ Webhook configured"
else
  echo "   ❌ Webhook NOT configured"
fi

echo ""
echo "📱 Now test in Telegram:"
echo "   1. Send /start in your group"
echo "   2. Tap bot name → Open App"
echo "   3. Create a market"
echo "   4. Trade on markets"
```

---

## Expected Behavior Summary

### In Group:
- ✅ Bot responds to commands (`/start`, `/create_market`, etc.)
- ✅ Bot messages include Mini App buttons
- ✅ Mini App opens from buttons or bot profile
- ✅ Markets scoped to group (`chatId` detected)
- ✅ All group members see same markets

### In Private Chat:
- ✅ Same commands work
- ✅ Menu button (☰) appears
- ✅ Mini App opens
- ✅ Markets scoped to user (`user-{userId}`)

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Test with multiple users** in the group
3. **Verify group scoping** works correctly
4. **Test all features**: Create, trade, resolve markets
5. **Deploy to production** when ready

---

## Quick Reference

**Test Commands:**
- `/start` - Welcome + button
- `/create_market [question]` - Create market
- `/markets` - List markets
- `/balance` - Check balance
- `/help` - Show help

**Test URLs:**
- Mini App: `https://t.me/APChatPredictBot/app`
- Direct: `https://outermost-lower-stephanie.ngrok-free.dev`

**Check Status:**
- Webhook: `./scripts/check-bot-setup.sh`
- Port conflict: `./scripts/fix-port-conflict.sh`
- Restart all: `./scripts/restart-all.sh`

