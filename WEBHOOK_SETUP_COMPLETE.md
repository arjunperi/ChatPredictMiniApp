# ✅ Webhook Setup Complete!

Your Telegram bot webhook is now configured and ready to respond to commands in groups.

## What's Set Up

- **Webhook URL**: `https://outermost-lower-stephanie.ngrok-free.dev/api/webhook`
- **Secret Token**: `kalsh_for_the_homies` (for security)
- **Status**: ✅ Active

## How to Test

### In a Group:

1. **Send `/start`** in the group
   - Bot should respond with welcome message + Mini App button

2. **Send `/create_market Will it rain tomorrow?`**
   - Bot creates market and responds with button

3. **Send `/markets`**
   - Bot shows active markets + button

4. **Send `/balance`**
   - Bot shows your balance + portfolio button

5. **Send `/help`**
   - Bot shows all commands + Mini App button

### In Private Chat:

Same commands work in private chat with the bot.

## What Happens

When someone sends a command:

1. Telegram sends update to your webhook
2. Your server processes the command (`app/api/webhook/route.ts`)
3. Bot responds with message + Mini App button
4. Users tap button → Mini App opens

## Important Notes

### Keep These Running:

- ✅ **Terminal 1**: ngrok (`ngrok http 3000`)
- ✅ **Terminal 2**: Dev server (`npm run dev`)

If either stops, the webhook won't work!

### If Webhook Stops Working:

1. **Check ngrok**: Is it still running? URL might have changed
2. **Check dev server**: Is `npm run dev` running?
3. **Update webhook**: If ngrok URL changed, update webhook:
   ```bash
   ./scripts/setup-webhook.sh
   ```

### When ngrok URL Changes:

Free ngrok URLs change when you restart ngrok. When this happens:

1. Get new ngrok URL
2. Update `.env`: `NEXT_PUBLIC_APP_URL="new-url"`
3. Restart dev server
4. Update webhook: `./scripts/setup-webhook.sh`

## Commands Available

- `/start` - Welcome message + Mini App button
- `/create_market [question]` - Create a new market
- `/markets` - List active markets
- `/balance` - Check token balance
- `/help` - Show help message

All commands work in:
- ✅ Private chats
- ✅ Group chats
- ✅ Supergroups

## Next Steps

1. **Test in your group**: Send `/start` and see if bot responds
2. **Create a market**: Send `/create_market Will it rain tomorrow?`
3. **Open Mini App**: Tap the button the bot sends
4. **Verify group scoping**: Markets should be scoped to the group

## Troubleshooting

### Bot Not Responding?

1. **Check webhook status**:
   ```bash
   curl "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getWebhookInfo"
   ```

2. **Check server logs**: Look at Terminal 2 (where `npm run dev` is running)
   - You should see webhook requests coming in

3. **Check ngrok**: Look at Terminal 1 (ngrok dashboard)
   - Visit http://localhost:4040 to see requests

### Webhook Errors?

Check the server logs for errors. Common issues:
- Database connection errors
- Missing environment variables
- API route errors

### Still Not Working?

1. Verify webhook is set:
   ```bash
   ./scripts/check-bot-setup.sh
   ```

2. Test webhook endpoint directly:
   ```bash
   curl http://localhost:3000/api/webhook
   ```
   Should return: `{"message":"Telegram webhook endpoint","status":"ready"}`

3. Check ngrok is forwarding correctly:
   - Visit http://localhost:4040
   - Should see requests to `/api/webhook`

## Summary

✅ Webhook is set up and active
✅ Bot can respond to commands in groups
✅ Commands include Mini App buttons
✅ Ready to test!

Try sending `/start` in your group now! 🚀

