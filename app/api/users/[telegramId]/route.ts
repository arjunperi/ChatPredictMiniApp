import { NextRequest, NextResponse } from 'next/server';
import { getUserWithStats, getOrCreateUser } from '@/lib/tokens';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  try {
    const { telegramId } = await params;
    const user = await getUserWithStats(telegramId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ telegramId: string }> }
) {
  try {
    const { telegramId } = await params;
    const body = await request.json();
    const { username, firstName, lastName } = body;

    const user = await getOrCreateUser(
      telegramId,
      username,
      firstName,
      lastName
    );

    return NextResponse.json({
      user,
      isNew: user.createdAt.getTime() === user.updatedAt.getTime(),
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}

