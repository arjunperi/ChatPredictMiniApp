# How to Access Mini App from Group Chat

## Understanding Group Access

The menu button (☰) only appears in **private chats** with the bot, not in groups. This is Telegram's design.

## How Group Members Access the Mini App

### Option 1: Tap Bot Name (Always Works)

1. In the group, tap the bot's name (`@APChatPredictBot`)
2. Tap "Open App" or the Mini App button
3. Mini App opens with group context

### Option 2: Bot Sends Message with Button (Requires Webhook)

The bot can post a message in the group with a button that opens the Mini App.

**Example:**
```
Bot: "🎲 Welcome to ChatPredict! Tap below to open:"
[🚀 Open ChatPredict] ← Button
```

### Option 3: Share Direct Link

Share this link in the group:
```
https://t.me/APChatPredictBot/app
```

Members tap it → Mini App opens

## Setting Up Group Access

### Method 1: Configure Webhook (Recommended)

If you have the webhook set up, the bot can automatically send welcome messages with buttons when added to groups.

**Current webhook handler** (`app/api/webhook/route.ts`) already handles this:
- When someone sends `/start` in a group
- Bot responds with a message and Mini App button

### Method 2: Manual Welcome Message

Send a welcome message to the group manually:

```bash
# Replace GROUP_CHAT_ID with your group's chat ID
# (Get it by adding @userinfobot to the group)

GROUP_CHAT_ID="your-group-chat-id"
BOT_TOKEN="8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA"
APP_URL="https://outermost-lower-stephanie.ngrok-free.dev"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": ${GROUP_CHAT_ID},
    \"text\": \"🎲 Welcome to ChatPredict!\\n\\nCreate and trade prediction markets in this group.\\n\\nTap the button below to open the Mini App:\",
    \"reply_markup\": {
      \"inline_keyboard\": [[
        {
          \"text\": \"🚀 Open ChatPredict\",
          \"web_app\": {\"url\": \"${APP_URL}\"}
        }
      ]]
    }
  }"
```

### Method 3: Use Bot Commands

In the group, users can:
1. Send `/start` → Bot responds with Mini App button
2. Send `/help` → Bot shows commands + Mini App button
3. Send `/create_market [question]` → Bot creates market + shows button

## Getting Group Chat ID

To send messages to a group, you need the group's chat ID:

1. Add `@userinfobot` to your group
2. It will show the group chat ID (usually a negative number like `-1001234567890`)
3. Use this ID in API calls

Or check webhook logs when bot receives a message in the group.

## Testing Group Access

1. **Add bot to group** (already done ✅)
2. **In the group:**
   - Tap bot name → Should see "Open App" option
   - Or send `/start` → Bot responds with button
   - Or use the direct link: `https://t.me/APChatPredictBot/app`

3. **Open Mini App:**
   - Should detect group `chatId` automatically
   - Markets scoped to that group

## Quick Setup Script

Save this as `send-group-welcome.sh`:

```bash
#!/bin/bash

# Send welcome message to group with Mini App button

BOT_TOKEN="8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA"
APP_URL="https://outermost-lower-stephanie.ngrok-free.dev"

echo "Enter group chat ID (negative number, e.g., -1001234567890):"
read GROUP_CHAT_ID

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": ${GROUP_CHAT_ID},
    \"text\": \"🎲 Welcome to ChatPredict!\\n\\nTap below to open the Mini App:\",
    \"reply_markup\": {
      \"inline_keyboard\": [[
        {
          \"text\": \"🚀 Open ChatPredict\",
          \"web_app\": {\"url\": \"${APP_URL}\"}
        }
      ]]
    }
  }"
```

## Summary

**In Groups:**
- ❌ Menu button doesn't appear (Telegram limitation)
- ✅ Tap bot name → "Open App" works
- ✅ Bot can send messages with buttons (via webhook)
- ✅ Direct link works: `https://t.me/APChatPredictBot/app`

**In Private Chat:**
- ✅ Menu button appears (☰)
- ✅ "Open App" button works

The easiest way for group members: **Tap the bot's name** → "Open App"

