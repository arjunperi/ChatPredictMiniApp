#!/bin/bash

# Telegram Webhook Setup Script

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"
SECRET="${TELEGRAM_WEBHOOK_SECRET:-kalsh_for_the_homies}"

# Get webhook URL from environment or prompt
if [ -z "$WEBHOOK_URL" ]; then
  echo "Enter your webhook URL (e.g., https://abc123.ngrok.io/api/webhook):"
  read WEBHOOK_URL
fi

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Webhook URL is required"
  exit 1
fi

echo "🔧 Setting up Telegram webhook..."
echo "   Bot Token: ${BOT_TOKEN:0:20}..."
echo "   Webhook URL: $WEBHOOK_URL"
echo "   Secret: $SECRET"
echo ""

# Set webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${SECRET}\"}")

echo "Response: $RESPONSE"
echo ""

# Check webhook status
echo "📋 Checking webhook status..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool 2>/dev/null || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"

echo ""
echo "✅ Done! Try sending /start to your bot in a group or private chat."

