# Commands to Restart Terminals

## Terminal 1 (ngrok)

### Stop:
```bash
pkill -f "ngrok http"
```

### Start:
```bash
ngrok http 3000
```

**After starting, copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

---

## Terminal 2 (Dev Server)

### Stop:
```bash
# Press Ctrl+C in Terminal 2
# OR kill the process:
lsof -ti:3000 | xargs kill -9
```

### Start:
```bash
npm run dev
```

---

## Quick Restart (Both)

### Option 1: Use the script
```bash
./scripts/restart-all.sh
```

### Option 2: Manual (copy-paste these)

**Terminal 1:**
```bash
pkill -f "ngrok http" && sleep 2 && ngrok http 3000
```

**Terminal 2:**
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; rm -rf .next/dev/lock 2>/dev/null; npm run dev
```

---

## After Restarting

### 1. Update .env with new ngrok URL (if it changed)

```bash
# Get ngrok URL from Terminal 1, then:
sed -i '' 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL="https://new-ngrok-url.ngrok.io"|' .env
```

### 2. Update webhook (if ngrok URL changed)

```bash
WEBHOOK_URL="https://new-ngrok-url.ngrok.io/api/webhook" ./scripts/setup-webhook.sh
```

### 3. Verify both are running

**Check Terminal 1:**
- Should show: `Forwarding https://... -> http://localhost:3000`

**Check Terminal 2:**
- Should show: `✓ Ready in Xms`
- Should show: `Local: http://localhost:3000`

---

## One-Line Commands

**Terminal 1 (ngrok):**
```bash
pkill -f "ngrok http"; sleep 2; ngrok http 3000
```

**Terminal 2 (dev server):**
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; rm -rf .next/dev/lock 2>/dev/null; npm run dev
```

