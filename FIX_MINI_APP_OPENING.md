# Fix: Mini App Opening in Browser Instead of Telegram

## The Problem
Buttons are opening in a browser instead of directly in Telegram Mini App.

## Root Cause
The Mini App is **NOT fully configured** in @BotFather. `has_main_web_app` is still `false`.

## Solution: Complete Mini App Configuration

### Step 1: Open @BotFather
1. Open Telegram
2. Search for `@BotFather`
3. Start a chat

### Step 2: Configure Mini App
1. Send `/newapp` to @BotFather
2. Select your bot: `APChatPredictBot`
3. When asked for **Mini App URL**, enter EXACTLY:
   ```
   https://outermost-lower-stephanie.ngrok-free.dev
   ```
   **Important:** 
   - NO trailing slash
   - Must be HTTPS
   - Must match your ngrok URL exactly

4. Complete ALL remaining prompts:
   - Short name: `ChatPredict`
   - Description: `Prediction markets for Telegram groups`
   - Photo (optional): Skip or upload
   - Complete the setup

### Step 3: Verify Configuration
Run this command:
```bash
./scripts/check-mini-app-config.sh
```

Should show: `has_main_web_app: True`

### Step 4: Restart Terminal 2
```bash
# In Terminal 2
Ctrl+C
npm run dev
```

### Step 5: Test
1. Send `/start` in your Telegram group
2. **CRITICAL: Click the button FROM WITHIN Telegram app** (not from browser!)
3. It should open directly in Telegram Mini App

## Important Notes

### ⚠️ CRITICAL: Where You Click Matters!
- ✅ **Works**: Click button INSIDE Telegram app → Opens Mini App in Telegram
- ❌ **Doesn't work**: Click button from browser/external link → Opens as website

**`web_app` buttons ONLY work when clicked FROM WITHIN Telegram!**

### If Still Not Working

1. **Check URL matches exactly:**
   ```bash
   # Check what's configured
   curl "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getChatMenuButton" -d '{}'
   
   # Should match your .env
   grep NEXT_PUBLIC_APP_URL .env
   ```

2. **Try removing and re-adding:**
   - @BotFather → `/deleteapp` → Select bot
   - @BotFather → `/newapp` → Configure again

3. **Make sure ngrok is running:**
   ```bash
   # Terminal 1 should show ngrok running
   ps aux | grep ngrok
   ```

4. **Verify URL is accessible:**
   ```bash
   curl https://outermost-lower-stephanie.ngrok-free.dev
   ```

## Why This Happens

- `url` buttons → Always open in browser
- `web_app` buttons → Open in Telegram Mini App (but require configuration)

The code was falling back to `url` buttons when `web_app` failed. Now it always uses `web_app` buttons, but you MUST complete the `/newapp` setup in @BotFather for them to work.
