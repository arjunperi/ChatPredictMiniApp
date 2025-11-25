#!/bin/bash

# Fix Port 3000 Conflict and Lock File Issues

echo "🔧 Fixing port conflicts and lock files..."
echo ""

# Kill processes on port 3000
echo "🛑 Killing processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  echo "   ✅ Killed processes on port 3000"
else
  echo "   ✅ Port 3000 is free"
fi

# Kill all next dev processes
echo "🛑 Killing all next dev processes..."
pkill -f "next dev" 2>/dev/null
sleep 1
if pgrep -f "next dev" > /dev/null; then
  echo "   ⚠️  Some processes still running, forcing kill..."
  pkill -9 -f "next dev" 2>/dev/null
fi
echo "   ✅ Next dev processes stopped"

# Remove lock files
echo "🧹 Removing lock files..."
rm -rf .next/dev/lock 2>/dev/null
rm -rf .next/cache 2>/dev/null
echo "   ✅ Lock files removed"

# Verify port is free
echo ""
echo "📋 Verification:"
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   ❌ Port 3000 is still in use!"
  echo "   Run: lsof -ti:3000 | xargs kill -9"
else
  echo "   ✅ Port 3000 is free"
fi

if pgrep -f "next dev" > /dev/null; then
  echo "   ❌ Next dev is still running!"
  echo "   Run: pkill -9 -f 'next dev'"
else
  echo "   ✅ No next dev processes running"
fi

echo ""
echo "✅ Ready! You can now run: npm run dev"

