#!/bin/bash

# Restart ngrok tunnel

echo "🔄 Restarting ngrok..."

# Kill existing ngrok processes
echo "🛑 Stopping existing ngrok..."
pkill -f "ngrok http" 2>/dev/null
sleep 2

# Check if port 3000 is accessible
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Next.js is not running on port 3000!"
    echo "   Start Terminal 2 first: npm run dev"
    exit 1
fi

echo "✅ Next.js is running on port 3000"
echo ""
echo "🚀 Starting ngrok..."
echo "   (Press Ctrl+C to stop)"
echo ""

# Start ngrok
ngrok http 3000

