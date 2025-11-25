# Group Scoping & ChatId Detection Guide

This guide explains how ChatPredict automatically detects and scopes markets to Telegram groups.

## How It Works

### 1. ChatId Detection

The Mini App automatically detects the `chatId` (group ID) from multiple sources:

**Priority Order:**
1. **URL Parameter** - `?chatId=123456789` (for testing or manual override)
2. **Telegram start_param** - When opened from a group button
3. **Fallback** - User-specific chatId (`user-{userId}`)

### 2. Automatic Group Scoping

When a `chatId` is detected:
- ✅ Markets are automatically scoped to that group
- ✅ Market creation includes the group `chatId`
- ✅ Market listings filter by group `chatId`
- ✅ Users see only markets from their current group

### 3. User Experience

**In a Group:**
- User opens Mini App from group → `chatId` detected
- Creates market → Market scoped to group
- Views markets → Only sees group markets
- Other group members see the same markets

**In Private Chat:**
- User opens Mini App → No `chatId` detected
- Creates market → Market scoped to user (`user-{userId}`)
- Views markets → Sees all markets (or can filter)

## Implementation Details

### Context Provider

The `TelegramContextProvider` extracts and provides `chatId` throughout the app:

```typescript
const { chatId, userId, isReady } = useTelegramContext();
```

### Market Creation

When creating a market, `chatId` is automatically included:

```typescript
// In CreateMarketModal
const { chatId, userId } = useTelegramContext();
const finalChatId = chatId || (userId ? `user-${userId}` : null);

// Sent to API
{
  question: "...",
  chatId: finalChatId, // Automatically scoped to group
  ...
}
```

### Market Filtering

Markets are automatically filtered by `chatId`:

```typescript
// In MarketsPage
const { chatId } = useTelegramContext();
const { data: markets } = useMarkets(chatId || undefined);
```

## Testing

### Test with URL Parameter

Add `?chatId=123456789` to your Mini App URL:

```
https://your-app.com/markets?chatId=123456789
```

This will:
- Show only markets for that group
- Create new markets scoped to that group

### Test in Telegram Group

1. Add bot to a Telegram group
2. Open Mini App from group context
3. `chatId` should be detected automatically
4. Markets will be scoped to that group

### Test in Private Chat

1. Open Mini App from bot profile (not from group)
2. No `chatId` detected
3. Markets scoped to user (`user-{userId}`)

## API Behavior

### Creating Markets

**With chatId:**
```json
POST /api/markets
{
  "question": "Will it rain?",
  "chatId": "123456789"  // Group ID
}
```

**Without chatId:**
```json
POST /api/markets
{
  "question": "Will it rain?",
  "chatId": "user-55901658"  // User-specific
}
```

### Fetching Markets

**Group markets:**
```
GET /api/markets?chatId=123456789
```

**All markets:**
```
GET /api/markets
```

## UI Indicators

When in group mode, users see:

- **Home page**: "📍 Group Mode: Markets scoped to this group"
- **Markets page**: "Showing markets for this group"

## How to Open Mini App from Group

### Option 1: Bot Button (Recommended)

In your bot webhook, send a message with a Mini App button:

```typescript
{
  text: "Open ChatPredict",
  reply_markup: {
    inline_keyboard: [[
      {
        text: "🚀 Open App",
        web_app: { url: "https://your-app.com?chatId=123456789" }
      }
    ]]
  }
}
```

### Option 2: Direct Link

Share a link with `chatId` parameter:

```
https://t.me/YourBot/app?startapp=chatId_123456789
```

### Option 3: URL Parameter

Add `chatId` to Mini App URL when opening:

```
https://your-app.com?chatId=123456789
```

## Troubleshooting

### ChatId Not Detected

1. **Check URL**: Look for `?chatId=` parameter
2. **Check Telegram**: Verify app opened from group context
3. **Check Console**: Look for `chatId` in context values

### Markets Showing for Wrong Group

1. **Clear cache**: Refresh the Mini App
2. **Check URL**: Verify `chatId` parameter is correct
3. **Check API**: Verify markets have correct `chatId` in database

### All Markets Showing (Not Filtered)

- This happens when `chatId` is `null`
- Markets are scoped to user (`user-{userId}`) or global
- This is expected behavior for private chats

## Code Locations

- **Context**: `lib/telegram/context.tsx`
- **Utils**: `lib/telegram/utils.ts`
- **Provider**: `components/providers/telegram-provider.tsx`
- **Market Creation**: `components/markets/create-market-modal.tsx`
- **Market Listing**: `app/markets/page.tsx`
- **API Route**: `app/api/markets/route.ts`

