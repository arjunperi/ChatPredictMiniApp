# Fix: "Open App" Button Not Showing

If you don't see the "Open App" button when viewing your bot, here's how to fix it:

## Problem

The Mini App button doesn't appear because:
1. Mini App not configured in @BotFather
2. Menu button not set for the bot
3. Bot needs to be updated

## Solution: Configure Mini App in @BotFather

### Step 1: Open @BotFather

1. Open Telegram
2. Search for `@BotFather`
3. Start a chat with BotFather

### Step 2: Set Up Mini App

Send this command:
```
/myapps
```

If you see your bot listed:
- Select your bot
- Choose "Edit Mini App" or "Add Mini App"
- Follow the prompts

If you don't see your bot or need to create a new Mini App:
```
/newapp
```

### Step 3: Configure Mini App

When prompted, provide:

1. **Select Bot**: Choose your bot from the list
2. **App Title**: `ChatPredict` (or any name)
3. **Short Description**: `Prediction markets for Telegram groups`
4. **Photo**: (Optional - upload an icon)
5. **Web App URL**: Your app URL
   - Local: `https://your-ngrok-url.ngrok.io`
   - Production: `https://your-app.vercel.app`
6. **Short Name**: `chatpredict` (optional)

### Step 4: Verify Setup

After setup, check:

1. **In @BotFather**: Run `/myapps` → Select your bot → Should show Mini App details
2. **In Telegram**: Open your bot → Should see "Open App" button or menu button

## Alternative: Set Menu Button via API

If @BotFather doesn't work, set it via API:

```bash
BOT_TOKEN="your-bot-token"
APP_URL="https://your-app-url.com"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"Open ChatPredict\",
      \"web_app\": {
        \"url\": \"${APP_URL}\"
      }
    }
  }"
```

Or use the script:

```bash
# Update APP_URL in the script first
./scripts/set-menu-button.sh
```

## Check Current Setup

Run this to see your bot's current configuration:

```bash
./scripts/check-bot-setup.sh
```

This will show:
- Bot information
- Bot commands
- Menu button status

## After Setup

Once configured:

1. **Open your bot** in Telegram
2. You should see:
   - A menu button (☰) that opens the Mini App
   - Or an "Open App" button
   - Or a button in the bot's profile

3. **In groups**:
   - Bot can be added
   - Members can tap bot name → "Open App"
   - Or use the menu button

## Troubleshooting

### Still No Button?

1. **Restart Telegram**: Close and reopen the app
2. **Check Bot**: Make sure you're looking at the right bot
3. **Check @BotFather**: Run `/myapps` and verify Mini App is set
4. **Try API**: Use the `setChatMenuButton` API call above

### Button Shows But Doesn't Work?

1. **Check URL**: Verify the Mini App URL is correct
2. **Check HTTPS**: URL must be HTTPS (not HTTP)
3. **Check ngrok**: If using ngrok, make sure it's running
4. **Check Server**: Make sure your dev server is running

### Button Works But ChatId Not Detected?

1. **Check URL**: Add `?chatId=<GROUP_ID>` manually for testing
2. **Check Console**: Look for errors in browser console
3. **Check Context**: Verify `TelegramContext` is working

## Quick Test

1. Open @BotFather
2. Send: `/myapps`
3. Select your bot
4. If Mini App is configured, you'll see the URL
5. If not, set it up with `/newapp`

## Summary

The "Open App" button appears when:
- ✅ Mini App is configured in @BotFather
- ✅ Menu button is set (automatic when Mini App is configured)
- ✅ Bot is properly set up

If it's still not showing, use the API method above to set it manually.

