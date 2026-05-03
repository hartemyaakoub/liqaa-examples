import { NextRequest, NextResponse } from 'next/server';
import { liqaa } from '@/lib/liqaa.server';

export async function POST(req: NextRequest) {
  const { room = 'support', user } = await req.json();

  if (!user) {
    return NextResponse.json({ error: 'user is required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? '';
  const allowed = await rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const { jwt } = await liqaa.tokens.issue({
    user,
    rooms: [room],
    ttl: 600,
    permissions: { canPublish: true, canSubscribe: true, canPublishData: true },
  });

  return NextResponse.json({ sdkToken: jwt });
}

const buckets = new Map<string, { count: number; reset: number }>();
async function rateLimit(ip: string) {
  if (!ip) return true;
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (b.count >= 10) return false;
  b.count++;
  return true;
}
