import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@liqaa/js/webhook';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('liqaa-signature');
  const raw = await req.text();
  const secret = process.env.LIQAA_WEBHOOK_SECRET!;

  try {
    verifyWebhook(raw, sig, secret, { tolerance: 300 });
  } catch {
    return new NextResponse('invalid signature', { status: 401 });
  }

  const event = JSON.parse(raw) as { id: string; type: string; data: any };

  const seen = await db.events.findById(event.id);
  if (seen) return NextResponse.json({ ok: true, dedup: true });
  await db.events.create({ id: event.id, type: event.type });

  switch (event.type) {
    case 'call.started':
      await db.queue.push(event.data.room);
      break;
    case 'call.ended':
      await db.queue.markComplete(event.data.room, event.data.duration);
      break;
    case 'recording.ready':
      await db.recordings.attach(event.data.room, event.data.recording_url);
      break;
  }

  return NextResponse.json({ ok: true });
}
