#!/bin/bash

# Set Menu Button (Mini App Button) for Telegram Bot

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"

# Get APP_URL from environment or prompt
if [ -z "$APP_URL" ]; then
  echo "Enter your Mini App URL (e.g., https://abc123.ngrok.io):"
  read APP_URL
fi

if [ -z "$APP_URL" ]; then
  echo "❌ APP_URL is required"
  exit 1
fi

echo "🔧 Setting menu button for bot..."
echo "   Bot Token: ${BOT_TOKEN:0:20}..."
echo "   App URL: $APP_URL"
echo ""

# Set menu button
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"Open ChatPredict\",
      \"web_app\": {
        \"url\": \"${APP_URL}\"
      }
    }
  }")

echo "Response: $RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Menu button set successfully!"
  echo ""
  echo "💡 Now open your bot in Telegram and you should see:"
  echo "   - A menu button (☰) that opens the Mini App"
  echo "   - Or an 'Open App' button"
else
  echo "❌ Failed to set menu button"
  echo "   Check your bot token and URL"
fi

