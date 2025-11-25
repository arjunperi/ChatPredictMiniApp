import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const chatId = searchParams.get('chatId') || undefined;

    let leaderboard;

    if (chatId) {
      // Leaderboard for specific chat (based on users who bet in that chat)
      const users = await prisma.user.findMany({
        where: {
          bets: {
            some: {
              market: {
                chatId,
              },
            },
          },
        },
        orderBy: {
          tokenBalance: 'desc',
        },
        take: limit,
        select: {
          id: true,
          username: true,
          firstName: true,
          tokenBalance: true,
          _count: {
            select: { bets: true },
          },
        },
      });

      leaderboard = users.map((user, index) => ({
        rank: index + 1,
        username: user.username || user.firstName || 'Anonymous',
        tokenBalance: user.tokenBalance,
        totalBets: user._count.bets,
      }));
    } else {
      // Global leaderboard
      const users = await prisma.user.findMany({
        orderBy: {
          tokenBalance: 'desc',
        },
        take: limit,
        select: {
          id: true,
          username: true,
          firstName: true,
          tokenBalance: true,
          _count: {
            select: { bets: true },
          },
        },
      });

      leaderboard = users.map((user, index) => ({
        rank: index + 1,
        username: user.username || user.firstName || 'Anonymous',
        tokenBalance: user.tokenBalance,
        totalBets: user._count.bets,
      }));
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

