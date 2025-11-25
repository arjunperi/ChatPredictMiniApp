# Fix Webhook Errors

## Common Webhook Errors

### Error: BUTTON_TYPE_INVALID
**Cause:** Button format is incorrect
**Fix:** Already updated in code - restart Terminal 2

### Error: Unauthorized (401)
**Cause:** Webhook secret token mismatch
**Fix:** Check `TELEGRAM_WEBHOOK_SECRET` matches

### Error: 500 Internal Server Error
**Cause:** Server-side error in webhook handler
**Fix:** Check Terminal 2 logs for details

---

## Quick Debug Steps

### 1. Check Webhook Status
```bash
curl "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getWebhookInfo"
```

### 2. Check ngrok Dashboard
Visit: http://localhost:4040
- See incoming requests
- Check response codes
- View request/response bodies

### 3. Check Terminal 2 Logs
Look for:
- Error messages
- Stack traces
- API errors

### 4. Test Webhook Endpoint
```bash
curl http://localhost:3000/api/webhook
```
Should return: `{"message":"Telegram webhook endpoint","status":"ready"}`

---

## If Errors Persist

### Option 1: Temporarily Remove Buttons
Test if webhook works without buttons first.

### Option 2: Check Button Format
Verify web_app button structure matches Telegram API.

### Option 3: Check URL Format
Ensure Mini App URL is valid HTTPS.

---

## Share Error Details

Please share:
1. Exact error message from Terminal 1 (ngrok)
2. Exact error message from Terminal 2 (dev server)
3. What command you sent in Telegram

This will help diagnose the issue.

