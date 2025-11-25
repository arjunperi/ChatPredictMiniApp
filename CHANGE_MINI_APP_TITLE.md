# How to Change Mini App Title

## Current Situation

- **From bot profile ("Open App" button):** Shows "ChatPredict" with "mini app" below
- **From group chat button:** Shows "miniapp3" with "mini app" below

These titles come from different Mini App configurations in @BotFather.

## Solution: Edit Mini App Settings

### Step 1: Open @BotFather
1. Open Telegram
2. Search for `@BotFather`
3. Start a chat

### Step 2: Edit the Mini App
1. Send `/mybots` to @BotFather
2. Select `@APChatPredictBot`
3. Go to **Bot Settings** → **Configure Mini App**
4. Select **Edit Mini App** (or similar option)
5. Choose the Mini App you want to edit (the one with short_name `mini3`)

### Step 3: Change the Title
When editing, you'll be asked for:
- **Title:** Change this to `ChatPredict` (or whatever you want)
- **Description:** Can keep current or update
- **Short name:** Currently `mini3` - you can change this too if desired

### Step 4: Save Changes
Complete the editing process and save.

## Alternative: Create New Mini App

If editing doesn't work, you can create a new Mini App:

1. Send `/newapp` to @BotFather
2. Select `@APChatPredictBot`
3. Set:
   - **Title:** `ChatPredict`
   - **Description:** `Prediction markets for Telegram groups`
   - **URL:** `https://outermost-lower-stephanie.ngrok-free.dev`
   - **Short name:** `chatpredict` (or keep `mini3`)
4. Complete setup
5. Update code to use new short_name if changed

## Update Code (if short_name changes)

If you change the short_name, update `app/api/webhook/route.ts`:

```typescript
const telegramDeepLink = `https://t.me/${BOT_USERNAME}/NEW_SHORT_NAME`;
```

Replace `NEW_SHORT_NAME` with your new short_name.

## About "mini app" Text

The "mini app" text below the title is **Telegram's default label** and cannot be changed. It's automatically added by Telegram to indicate this is a Mini App.

## Expected Result

After changing:
- **From bot profile:** "ChatPredict" with "mini app" below ✅
- **From group chat button:** "ChatPredict" with "mini app" below ✅
- Both will match!

