#!/bin/bash

# Quick local testing script
# This script helps test the app locally without Telegram authentication

echo "🚀 Starting ChatPredict Mini App Local Testing"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from env.example..."
    cp env.example .env.local
    echo "✅ Created .env.local - Please update it with your values"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo ""

# Build the app to check for errors
echo "🔨 Building app..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Starting development server..."
    echo "   Open http://localhost:3000 in your browser"
    echo ""
    echo "💡 Tip: For Telegram Mini App testing, use ngrok:"
    echo "   ngrok http 3000"
    echo ""
    npm run dev
else
    echo ""
    echo "❌ Build failed. Please fix the errors above."
    exit 1
fi

