# How to Configure Mini App in @BotFather

The `web_app` buttons require the Mini App to be properly configured via @BotFather. Here's how:

## Step 1: Open @BotFather
1. Open Telegram
2. Search for `@BotFather`
3. Start a chat with @BotFather

## Step 2: Configure Mini App
1. Send `/newapp` to @BotFather
2. Select your bot: `APChatPredictBot`
3. When asked for the **Mini App URL**, enter:
   ```
   https://outermost-lower-stephanie.ngrok-free.dev
   ```
   **Important:** 
   - Use the EXACT URL (no trailing slash)
   - Make sure ngrok is running and this URL is accessible
   - The URL must be HTTPS

4. Follow the prompts to complete setup
5. You may be asked for:
   - Short name: `ChatPredict`
   - Description: `Prediction markets for Telegram groups`

## Step 3: Verify Configuration
After configuration, check if it worked:
```bash
curl "https://api.telegram.org/bot8578438649:AAFiGNIWB2Mf0d2-dMhqT_VwjnKAWd9AflA/getMe" | grep has_main_web_app
```

Should show: `"has_main_web_app": true`

## Step 4: Test
1. Send `/start` in your group
2. The button should now open the Mini App directly in Telegram (not in browser)

## Troubleshooting

**If buttons still open in browser:**
- Make sure you completed ALL steps in `/newapp`
- Verify the URL matches exactly (no trailing slash)
- Try removing and re-adding the Mini App: `/deleteapp` then `/newapp`
- Restart your bot/webhook after configuration

**Note:** The menu button (`setChatMenuButton`) is different from the Mini App configuration. You need BOTH:
- Menu button: Set via API (already done)
- Mini App registration: Set via @BotFather `/newapp` (you need to do this)

