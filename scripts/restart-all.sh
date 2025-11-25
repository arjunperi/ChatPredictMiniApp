#!/bin/bash

# Restart Script for ChatPredict Development

echo "🔄 Restarting ChatPredict Development Environment"
echo ""

# Kill existing processes
echo "🛑 Stopping existing processes..."

# Kill dev server
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   Stopping dev server on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  sleep 1
fi

# Kill ngrok
if pgrep -f "ngrok http" > /dev/null; then
  echo "   Stopping ngrok..."
  pkill -f "ngrok http" 2>/dev/null
  sleep 1
fi

echo "✅ Processes stopped"
echo ""

# Check environment
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating from env.example..."
  cp env.example .env
  echo "✅ Created .env - Please update it with your values"
  echo ""
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
  echo "❌ ngrok not found!"
  echo "   Install with: brew install ngrok"
  echo "   Or download from: https://ngrok.com/download"
  exit 1
fi

# Start ngrok in background
echo "🌐 Starting ngrok..."
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
  echo "⚠️  Could not get ngrok URL. Check ngrok is running."
  echo "   Check: http://localhost:4040"
else
  echo "✅ ngrok running: $NGROK_URL"
  
  # Update .env with ngrok URL
  if grep -q "NEXT_PUBLIC_APP_URL" .env; then
    sed -i '' "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"${NGROK_URL}\"|" .env
    echo "✅ Updated .env with ngrok URL"
  fi
fi

echo ""

# Start dev server
echo "🚀 Starting dev server..."
npm run dev > /tmp/next-dev.log 2>&1 &
DEV_PID=$!
sleep 5

# Check if dev server started
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Dev server running on http://localhost:3000"
else
  echo "⚠️  Dev server might not be ready yet. Check logs:"
  echo "   tail -f /tmp/next-dev.log"
fi

echo ""
echo "📋 Summary:"
echo "   ngrok: $NGROK_URL"
echo "   Dev server: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   ngrok: tail -f /tmp/ngrok.log"
echo "   dev server: tail -f /tmp/next-dev.log"
echo ""
echo "🛑 To stop:"
echo "   kill $NGROK_PID $DEV_PID"
echo "   Or: pkill -f 'ngrok http' && pkill -f 'next dev'"
echo ""

# Update webhook if ngrok URL changed
if [ ! -z "$NGROK_URL" ]; then
  echo "🔧 Updating webhook..."
  BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA}"
  SECRET="${TELEGRAM_WEBHOOK_SECRET:-kalsh_for_the_homies}"
  WEBHOOK_URL="${NGROK_URL}/api/webhook"
  
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${SECRET}\"}" > /dev/null
  
  echo "✅ Webhook updated: ${WEBHOOK_URL}"
fi

echo ""
echo "✅ Ready! Test by sending /start to your bot in a group."

