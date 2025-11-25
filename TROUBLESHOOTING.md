# Troubleshooting Guide

## Common Issues and Solutions

### Issue: Both Terminals Stopped/Errors

**Why this happens:**
- ngrok session expired or crashed
- Dev server crashed (port conflict, errors, etc.)
- Network issues
- Process killed manually

**Quick Fix:**

```bash
# Restart everything
./scripts/restart-all.sh
```

**Manual Restart:**

1. **Terminal 1 - Start ngrok:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **Update .env:**
   ```bash
   # Update NEXT_PUBLIC_APP_URL with new ngrok URL
   nano .env
   # Or:
   sed -i '' 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL="https://new-ngrok-url.ngrok.io"|' .env
   ```

3. **Terminal 2 - Start dev server:**
   ```bash
   npm run dev
   ```

4. **Update webhook:**
   ```bash
   WEBHOOK_URL="https://new-ngrok-url.ngrok.io/api/webhook" ./scripts/setup-webhook.sh
   ```

---

### Issue: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

### Issue: ngrok URL Changed

**Problem:** Free ngrok URLs change when you restart ngrok

**Solution:**
1. Get new ngrok URL from Terminal 1
2. Update `.env`: `NEXT_PUBLIC_APP_URL="new-url"`
3. Restart dev server
4. Update webhook: `./scripts/setup-webhook.sh`

**Or use paid ngrok** for static domain.

---

### Issue: Webhook Not Working

**Symptoms:**
- Bot doesn't respond to commands
- No requests in server logs

**Check:**
1. **Webhook status:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. **ngrok running?**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. **Dev server running?**
   ```bash
   curl http://localhost:3000/api/webhook
   ```

4. **Check logs:**
   - Terminal 2 (dev server) - should see webhook requests
   - Terminal 1 (ngrok) - should see requests

**Fix:**
```bash
# Restart everything
./scripts/restart-all.sh
```

---

### Issue: Database Connection Errors

**Error:** `Can't reach database server`

**Check:**
1. **Database URL correct?**
   ```bash
   cat .env | grep DATABASE_URL
   ```

2. **Database accessible?**
   ```bash
   npx prisma studio
   # Should open Prisma Studio if DB is accessible
   ```

**Fix:**
- Verify `DATABASE_URL` in `.env`
- Check database is running (if local)
- Check network/firewall (if remote)

---

### Issue: Module Not Found Errors

**Error:** `Cannot find module '@/...'`

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

---

### Issue: Build Errors

**Error:** TypeScript or build errors

**Fix:**
```bash
# Check for errors
npm run build

# Fix TypeScript errors
# Check linter
npm run lint
```

---

### Issue: Mini App Not Loading

**Symptoms:**
- Blank page
- 404 errors
- "This page could not be found"

**Check:**
1. **ngrok running?**
2. **Dev server running?**
3. **URL correct in @BotFather?**
4. **Check browser console** (in Telegram, tap Mini App → "Open in Browser")

**Fix:**
```bash
# Restart everything
./scripts/restart-all.sh

# Verify URL
curl https://your-ngrok-url.ngrok.io
```

---

### Issue: ChatId Not Detected

**Symptoms:**
- Markets not scoped to group
- "Group Mode" indicator not showing

**Check:**
1. **Open browser console** (in Telegram Mini App)
2. **Check context:**
   ```javascript
   // In browser console
   window.Telegram?.WebApp?.initDataUnsafe
   ```

**Fix:**
- Add `?chatId=<GROUP_ID>` to URL manually for testing
- Check `lib/telegram/context.tsx` is working

---

## Quick Diagnostic Commands

```bash
# Check what's running
lsof -ti:3000 && echo "Dev server running" || echo "Dev server NOT running"
pgrep -f "ngrok http" && echo "ngrok running" || echo "ngrok NOT running"

# Check webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Check dev server
curl http://localhost:3000/api/webhook

# Check ngrok
curl http://localhost:4040/api/tunnels

# View logs
tail -f /tmp/next-dev.log  # Dev server
tail -f /tmp/ngrok.log      # ngrok
```

---

## Restart Everything

**Easiest way:**
```bash
./scripts/restart-all.sh
```

**Manual way:**
1. Stop everything: `pkill -f "ngrok http" && pkill -f "next dev"`
2. Start ngrok: `ngrok http 3000`
3. Update .env with ngrok URL
4. Start dev: `npm run dev`
5. Update webhook: `./scripts/setup-webhook.sh`

---

## Still Having Issues?

1. **Check logs** in both terminals
2. **Check ngrok dashboard**: http://localhost:4040
3. **Check environment variables**: `cat .env`
4. **Verify bot token**: Test with `curl` commands above
5. **Check database**: `npx prisma studio`

