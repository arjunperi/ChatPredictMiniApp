#!/bin/bash

# Telegram Mini App Testing Setup Script

echo "🚀 Setting up Telegram Mini App Testing"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from env.example..."
    cp env.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok not found!"
    echo ""
    echo "Please install ngrok:"
    echo "  macOS: brew install ngrok"
    echo "  Other: https://ngrok.com/download"
    echo ""
    echo "Or sign up at https://ngrok.com (free account works)"
    echo ""
    exit 1
fi

echo "✅ ngrok found"
echo ""

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Dev server is running on port 3000"
else
    echo "⚠️  Dev server not running on port 3000"
    echo "   Starting dev server in background..."
    npm run dev > /dev/null 2>&1 &
    sleep 3
    echo "✅ Dev server started"
fi

echo ""
echo "🌐 Starting ngrok tunnel..."
echo ""
echo "📋 Next steps:"
echo "   1. Copy the HTTPS URL from ngrok (starts with https://)"
echo "   2. Update .env.local: NEXT_PUBLIC_APP_URL=\"<your-ngrok-url>\""
echo "   3. Restart dev server (Ctrl+C and run 'npm run dev')"
echo "   4. In Telegram, open @BotFather and run: /newapp"
echo "   5. Set Web App URL to your ngrok URL"
echo "   6. Open your bot and click 'Open App'"
echo ""
echo "Press Ctrl+C to stop ngrok when done"
echo ""

# Start ngrok
ngrok http 3000

