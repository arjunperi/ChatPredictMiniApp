import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true,
    message: 'API is reachable',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: request.url,
  });
}

