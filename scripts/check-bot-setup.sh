#!/bin/bash

# Check Telegram Bot Mini App Setup

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"

echo "🔍 Checking Telegram Bot Setup..."
echo ""

# Get bot info
echo "📋 Bot Information:"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | python3 -m json.tool 2>/dev/null || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe"

echo ""
echo ""

# Get bot commands
echo "📋 Bot Commands:"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMyCommands" | python3 -m json.tool 2>/dev/null || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMyCommands"

echo ""
echo ""

# Get menu button (Mini App button)
echo "📋 Menu Button (Mini App):"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getChatMenuButton" | python3 -m json.tool 2>/dev/null || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getChatMenuButton"

echo ""
echo ""
echo "💡 If menu button is not set, you need to configure the Mini App in @BotFather"
echo "   Run: /myapps in @BotFather and set up your Mini App"

