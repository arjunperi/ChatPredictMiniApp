#!/bin/bash

# Send welcome message to group with Mini App button

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"
APP_URL="${NEXT_PUBLIC_APP_URL:-https://outermost-lower-stephanie.ngrok-free.dev}"

if [ -z "$GROUP_CHAT_ID" ]; then
  echo "Enter group chat ID (negative number, e.g., -1001234567890):"
  echo "💡 Tip: Add @userinfobot to your group to get the chat ID"
  read GROUP_CHAT_ID
fi

if [ -z "$GROUP_CHAT_ID" ]; then
  echo "❌ Group chat ID is required"
  exit 1
fi

echo "📤 Sending welcome message to group..."
echo "   Group ID: $GROUP_CHAT_ID"
echo "   App URL: $APP_URL"
echo ""

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
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
  }")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Welcome message sent successfully!"
  echo ""
  echo "💡 Group members can now tap the button to open the Mini App"
else
  echo "❌ Failed to send message"
  echo "Response: $RESPONSE"
fi
