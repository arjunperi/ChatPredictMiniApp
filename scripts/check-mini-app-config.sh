#!/bin/bash

# Check Mini App configuration status

# Load .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Use TELEGRAM_BOT_TOKEN from .env, or fallback to hardcoded value
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"

echo "🔍 Checking Mini App Configuration..."
echo ""

# Check bot info
echo "1. Bot Info:"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | python3 -c "
import sys, json
data = json.load(sys.stdin)
result = data['result']
print(f\"   Username: {result.get('username')}\")
print(f\"   Bot ID: {result.get('id')}\")
print(f\"   has_main_web_app: {result.get('has_main_web_app', False)}\")
"

echo ""
echo "2. Menu Button:"
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/getChatMenuButton" -H "Content-Type: application/json" -d '{}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('ok'):
    result = data['result']
    print(f\"   Type: {result.get('type')}\")
    if result.get('web_app'):
        print(f\"   URL: {result.get('web_app', {}).get('url', 'N/A')}\")
else:
    print(f\"   Error: {data.get('description', 'Unknown')}\")
"

echo ""
echo "3. Status:"
HAS_WEB_APP=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | python3 -c "import sys, json; print(json.load(sys.stdin)['result'].get('has_main_web_app', False))" 2>/dev/null)

if [ "$HAS_WEB_APP" = "True" ]; then
    echo "   ✅ Mini App is configured!"
    echo "   web_app buttons should work."
else
    echo "   ❌ Mini App NOT configured"
    echo "   has_main_web_app: false"
    echo ""
    echo "   To fix:"
    echo "   1. Open @BotFather in Telegram"
    echo "   2. Send /newapp"
    echo "   3. Select APChatPredictBot"
    echo "   4. Enter URL: https://outermost-lower-stephanie.ngrok-free.dev"
    echo "   5. Complete ALL prompts"
    echo ""
    echo "   Note: You must complete ALL steps, not just start it!"
fi

