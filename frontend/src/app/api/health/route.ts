import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    service: 'prisere-api',
    timestamp: new Date().toISOString()
  });
}