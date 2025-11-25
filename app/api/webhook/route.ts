import { NextRequest, NextResponse } from 'next/server';
import { createMarket, getMarkets } from '@/lib/market';
import { prisma } from '@/lib/db/prisma';
import { MarketStatus } from '@prisma/client';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'default_secret';
// Use URL exactly as configured in @BotFather Main Mini App
// @BotFather adds a trailing slash, so we need to match it
// Menu button uses trailing slash, so web_app buttons should too
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app').replace(/\/$/, '');
const MINI_APP_URL = BASE_URL;
// For web_app buttons, add trailing slash to match @BotFather configuration
const WEB_APP_URL = `${BASE_URL}/`;
const BOT_USERNAME = 'APChatPredictBot'; // Your bot username

/**
 * Generate Telegram Mini App link
 * For fallback when buttons fail, use the direct HTTPS URL
 * Telegram will open it in Mini App if configured correctly in @BotFather
 */
function getTelegramMiniAppLink(path: string = ''): string {
  // Use the actual web app URL - Telegram opens it in Mini App when clicked
  // This only works if the URL is configured in @BotFather
  if (path) {
    return `${MINI_APP_URL}/${path}`;
  }
  return MINI_APP_URL;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
      title?: string;
    };
    text?: string;
    date: number;
  };
}

/**
 * Send message via Telegram Bot API
 */
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  
  // Only add reply_markup if it's valid and not empty
  if (replyMarkup && replyMarkup.inline_keyboard && Array.isArray(replyMarkup.inline_keyboard) && replyMarkup.inline_keyboard.length > 0) {
    // Validate button format (supports both url and web_app buttons)
    const validatedMarkup = {
      inline_keyboard: replyMarkup.inline_keyboard.map((row: any[]) => 
        row.map((button: any) => {
          // Handle web_app buttons (requires Mini App configured in @BotFather)
          if (button.web_app) {
            const buttonUrl = button.web_app.url || button.web_app;
            if (!buttonUrl || typeof buttonUrl !== 'string' || !buttonUrl.startsWith('https://')) {
              console.warn(`Invalid web_app URL: ${buttonUrl}`);
              // Fallback to regular URL button
              return { text: button.text, url: buttonUrl || MINI_APP_URL };
            }
            return {
              text: button.text,
              web_app: { url: buttonUrl }
            };
          }
          // Handle regular URL buttons (including deep links)
          if (button.url) {
            // Deep links (t.me) should always be allowed
            if (button.url.startsWith('https://t.me/')) {
              console.log('Deep link button detected:', button.url);
              return button;
            }
            if (!button.url.startsWith('https://')) {
              console.warn(`Invalid URL: ${button.url}`);
              return { text: button.text };
            }
            return button;
          }
          return button;
        })
      )
    };
    payload.reply_markup = validatedMarkup;
  }
  
  // Log payload for debugging
  console.log('Sending message with payload:', JSON.stringify(payload, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Telegram API error:', error);
    console.error('Payload that failed:', JSON.stringify(payload, null, 2));
    throw new Error(`Telegram API error: ${error}`);
  }

  const result = await response.json();
  console.log('Message sent successfully:', result.ok);
  return result;
}

/**
 * Handle /start command
 */
async function handleStart(chatId: number, userId: number, username?: string, firstName?: string) {
  // Ensure user exists
  await prisma.user.upsert({
    where: { telegramId: userId.toString() },
    update: {},
    create: {
      telegramId: userId.toString(),
      username,
      firstName,
      tokenBalance: 1000,
    },
  });

  const text = `🎲 <b>Welcome to ChatPredict!</b>

Create and trade prediction markets directly in this group!

<b>Commands:</b>
/create_market [question] - Create a new market
/markets - List active markets
/balance - Check your token balance
/help - Show this help message

<b>Or tap the button below to open the Mini App:</b>`;

  // Use deep link format - this was the working solution before Vercel
  // Format: https://t.me/BOT_USERNAME/short_name
  // The short_name "PredictAP" was configured when creating Mini App in @BotFather
  // Deep links work in inline keyboards when properly configured
  const shortName = 'PredictAP';
  const telegramDeepLink = `https://t.me/${BOT_USERNAME}/${shortName}`;
  
  console.log('Using deep link for inline keyboard button:', telegramDeepLink);
  const replyMarkup = {
    inline_keyboard: [[
      {
        text: '🚀 Open ChatPredict',
        url: telegramDeepLink
      }]]
  };

  return await sendTelegramMessage(chatId, text, replyMarkup);
}

/**
 * Handle /create_market command
 */
async function handleCreateMarket(
  chatId: number,
  userId: number,
  username: string | undefined,
  firstName: string | undefined,
  text: string
) {
  // Extract question from command
  const question = text.replace(/^\/create_market\s*/i, '').trim();

  if (!question || question.length < 10) {
    return sendTelegramMessage(
      chatId,
      '❌ Please provide a market question (at least 10 characters).\n\nExample: /create_market Will it rain tomorrow?'
    );
  }

  try {
    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { telegramId: userId.toString() },
      update: {},
      create: {
        telegramId: userId.toString(),
        username,
        firstName,
        tokenBalance: 1000,
      },
    });

    // Create market
    const market = await createMarket(
      question,
      userId.toString(),
      chatId.toString(),
      100,
      null
    );

    const marketUrl = `${WEB_APP_URL}/markets/${market.id}`;
    
    const responseText = `✅ <b>Market Created!</b>

📊 <b>${question}</b>

Tap the button below to trade:`;

    // Use web_app button - opens Mini App directly in Telegram
    const replyMarkup = {
      inline_keyboard: [[
        {
          text: '📈 Trade This Market',
          web_app: {
            url: marketUrl
          }
        }]]
    };

    return await sendTelegramMessage(chatId, responseText, replyMarkup);
  } catch (error: any) {
    console.error('Error creating market:', error);
    return sendTelegramMessage(
      chatId,
      `❌ Error creating market: ${error.message}`
    );
  }
}

/**
 * Handle /markets command
 */
async function handleMarkets(chatId: number) {
  try {
    const markets = await getMarkets({
      chatId: chatId.toString(),
      status: MarketStatus.ACTIVE,
      limit: 5,
    });

    if (markets.length === 0) {
      return sendTelegramMessage(
        chatId,
        '📊 No active markets in this group yet.\n\nUse /create_market [question] to create one!'
      );
    }

    let text = `📊 <b>Active Markets (${markets.length})</b>\n\n`;
    
    markets.forEach((market, index) => {
      const totalShares = market.sharesYes + market.sharesNo || 1;
      const yesProb = (market.sharesYes / totalShares) * 100;
      text += `${index + 1}. <b>${market.question}</b>\n`;
      text += `   YES: ${yesProb.toFixed(1)}% | NO: ${(100 - yesProb).toFixed(1)}%\n\n`;
    });

    text += 'Tap below to view all markets:';

    const replyMarkup = {
      inline_keyboard: [[
        {
          text: '🚀 View All Markets',
          web_app: {
            url: `${WEB_APP_URL}/markets`
          }
        }]]
    };

    return await sendTelegramMessage(chatId, text, replyMarkup);
  } catch (error: any) {
    console.error('Error fetching markets:', error);
    return sendTelegramMessage(
      chatId,
      `❌ Error fetching markets: ${error.message}`
    );
  }
}

/**
 * Handle /balance command
 */
async function handleBalance(chatId: number, userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: userId.toString() },
    });

    if (!user) {
      return sendTelegramMessage(
        chatId,
        '❌ User not found. Use /start to initialize your account.'
      );
    }

    const text = `💰 <b>Your Balance</b>

🪙 Tokens: <b>${user.tokenBalance.toLocaleString()}</b>

Tap below to view your full portfolio:`;

    const replyMarkup = {
      inline_keyboard: [[
        {
          text: '💼 View Portfolio',
          web_app: {
            url: `${WEB_APP_URL}/portfolio`
          }
        }]]
    };

    return await sendTelegramMessage(chatId, text, replyMarkup);
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return sendTelegramMessage(
      chatId,
      `❌ Error fetching balance: ${error.message}`
    );
  }
}

/**
 * Handle /help command
 */
async function handleHelp(chatId: number) {
  const text = `📖 <b>ChatPredict Commands</b>

<b>Market Commands:</b>
/create_market [question] - Create a new prediction market
/markets - List active markets in this group

<b>Account Commands:</b>
/balance - Check your token balance
/start - Initialize your account

<b>Mini App:</b>
Tap the button below to open the full Mini App with all features!`;

  const replyMarkup = {
    inline_keyboard: [[
      {
        text: '🚀 Open ChatPredict Mini App',
        web_app: {
          url: WEB_APP_URL
        }
      }]]
  };

  return await sendTelegramMessage(chatId, text, replyMarkup);
}

/**
 * Webhook handler for Telegram bot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const update: TelegramUpdate = body;

    console.log('Webhook received update:', JSON.stringify(update, null, 2));

    // Webhook secret check disabled - Telegram webhooks work without it
    // All requests are allowed through
    // If you need secret protection later, uncomment and configure TELEGRAM_WEBHOOK_SECRET

    // Handle message updates
    if (update.message) {
      const { message } = update;
      
      // Validate required fields
      if (!message.from || !message.chat) {
        console.warn('Invalid message format:', JSON.stringify(message, null, 2));
        return NextResponse.json({ ok: true }); // Ignore invalid messages
      }
      
      const chatId = message.chat.id;
      const userId = message.from.id;
      const text = message.text || '';
      const username = message.from.username || undefined;
      const firstName = message.from.first_name || 'User';

      console.log(`Processing message: chatId=${chatId}, userId=${userId}, text="${text}", chatType=${message.chat.type}`);

      // Only process commands in groups or private chats
      if (message.chat.type === 'group' || message.chat.type === 'supergroup' || message.chat.type === 'private') {
        // Handle commands
        if (text.startsWith('/start')) {
          console.log('Handling /start command');
          await handleStart(chatId, userId, username, firstName);
        } else if (text.startsWith('/create_market')) {
          await handleCreateMarket(chatId, userId, username, firstName, text);
        } else if (text.startsWith('/markets')) {
          await handleMarkets(chatId);
        } else if (text.startsWith('/balance')) {
          await handleBalance(chatId, userId);
        } else if (text.startsWith('/help')) {
          await handleHelp(chatId);
        } else {
          console.log(`Message ignored (not a command): "${text}"`);
        }
        // Ignore other messages
      } else {
        console.log(`Message ignored (wrong chat type): ${message.chat.type}`);
      }
    } else {
      console.log('Update has no message field');
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint',
    status: 'ready'
  });
}
