# Group Chat Testing Setup Guide

This guide will help you test ChatPredict in a Telegram group chat.

## Overview

The bot can work in two ways:
1. **Mini App** - Full-featured web interface (already set up)
2. **Group Chat Bot** - Commands in Telegram groups with Mini App buttons

## Step 1: Set Up Webhook

Your webhook endpoint is: `https://your-ngrok-url.ngrok.io/api/webhook`

### Option A: Using ngrok (Local Testing)

1. Make sure your dev server is running (`npm run dev`)
2. Make sure ngrok is running (`ngrok http 3000`)
3. Copy your ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Your webhook URL is: `https://abc123.ngrok.io/api/webhook`

### Option B: Using Production URL

If deployed to Vercel:
- Webhook URL: `https://your-app.vercel.app/api/webhook`

## Step 2: Configure Webhook with Telegram

### Method 1: Using Bot API (Recommended)

Run this command (replace with your webhook URL and secret):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-ngrok-url.ngrok.io/api/webhook",
    "secret_token": "kalsh_for_the_homies"
  }'
```

Or use this script:

```bash
# Update these variables
BOT_TOKEN="8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA"
WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/webhook"
SECRET="kalsh_for_the_homies"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${SECRET}\"}"
```

### Method 2: Using @BotFather

1. Open @BotFather in Telegram
2. Send: `/setwebhook`
3. Select your bot
4. Enter webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
5. Enter secret token: `kalsh_for_the_homies`

## Step 3: Verify Webhook

Check if webhook is set correctly:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You should see your webhook URL in the response.

## Step 4: Add Bot to Group

1. Create a Telegram group (or use an existing one)
2. Add your bot to the group
3. Make the bot an admin (optional, but recommended)
4. Send `/start` in the group

## Step 5: Test Commands

Try these commands in your group:

### Create a Market
```
/create_market Will it rain tomorrow?
```

The bot should:
- Create the market
- Reply with a message
- Show a button to open the Mini App

### List Markets
```
/markets
```

Shows active markets in the group with Mini App button.

### Check Balance
```
/balance
```

Shows your token balance with portfolio button.

### Help
```
/help
```

Shows all available commands.

## Step 6: Test Mini App Integration

1. When you create a market, click the "Trade This Market" button
2. The Mini App should open with that specific market
3. You can trade directly from the Mini App
4. Changes will be reflected in the group

## Troubleshooting

### Bot Not Responding

1. **Check webhook is set:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

2. **Check webhook logs:**
   - Check your terminal where `npm run dev` is running
   - Look for webhook requests and errors

3. **Verify environment variables:**
   - `TELEGRAM_BOT_TOKEN` - Your bot token
   - `NEXT_PUBLIC_APP_URL` - Your ngrok/production URL
   - `TELEGRAM_WEBHOOK_SECRET` - Secret token (optional but recommended)

### Webhook Errors

1. **401 Unauthorized:**
   - Check `TELEGRAM_WEBHOOK_SECRET` matches the secret_token in webhook config

2. **404 Not Found:**
   - Verify webhook URL is correct
   - Make sure `/api/webhook` route exists

3. **500 Internal Server Error:**
   - Check server logs
   - Verify database connection
   - Check that all environment variables are set

### Bot Not Receiving Messages

1. Make sure bot is added to the group
2. Check bot has permission to read messages
3. Try sending `/start` in private chat first

## Quick Test Script

Save this as `test-webhook.sh`:

```bash
#!/bin/bash

BOT_TOKEN="8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA"
WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/webhook"
SECRET="kalsh_for_the_homies"

echo "Setting webhook..."
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${SECRET}\"}"

echo -e "\n\nChecking webhook status..."
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

Make it executable and run:
```bash
chmod +x test-webhook.sh
./test-webhook.sh
```

## Next Steps

Once webhook is working:
1. Test creating markets in the group
2. Test trading via Mini App buttons
3. Test all commands
4. Invite friends to test together!

## Commands Reference

- `/start` - Initialize your account
- `/create_market [question]` - Create a new market
- `/markets` - List active markets
- `/balance` - Check your balance
- `/help` - Show help message

All commands work in:
- Private chats with the bot
- Group chats (where bot is added)
- Supergroups

