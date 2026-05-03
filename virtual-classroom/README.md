# Virtual classroom — 1-to-many lecture mode

Built for the **education track** — one teacher, up to 200 students, raise-hand UX, breakout rooms, and recording → S3 for replay.

## What it does

- Teacher launches the room from `/teacher/lecture/[id]` — joins as the only publisher by default.
- Students join from `/join/[code]` — start as subscribers (audio + video off).
- Raise-hand: a student requests to speak; teacher approves → that student temporarily becomes a publisher.
- Breakout rooms: teacher splits the class into 4–8 rooms with one click; students auto-routed.
- Recording: configurable per lecture, stored in your S3 / R2 bucket, replay link emailed when ready.

## Stack

Next.js 16 (App Router) + TailwindCSS + LIQAA SDK. ~800 lines of TS total.

## The interesting parts

### 1. The "raise-hand" pattern

Avoid the Zoom mistake of needing a parallel chat channel. Use LIQAA's `data` track — a separate WebRTC data channel that all participants share.

```ts
client.publishData(JSON.stringify({ kind: 'raise-hand', user: me.id }));

client.onData((msg) => {
  const evt = JSON.parse(msg);
  if (evt.kind === 'raise-hand' && me.role === 'teacher') showQueue.push(evt.user);
});
```

Latency: ~30 ms median (same as voice). No round-trip to your server.

### 2. Breakout rooms = N rooms with same prefix

```ts
const breakoutRooms = ['lec_42_breakout_01', 'lec_42_breakout_02', /* ... */];
// Teacher pre-creates them server-side, then issues new tokens to students
// scoped to one breakout room each.
```

When done, teacher closes breakouts → server signals all students to fetch a new token scoped back to the main room.

### 3. Recording without exposing student PII

LIQAA's egress writes the composite recording to your R2 bucket with a path like:

```
recordings/lec_42/main_2026-05-03T10-00.mp4
```

No student names. The replay link is gated by the LMS auth, not by URL secrecy.

## Why this matters for ed-tech

The "Zoom for class" pattern is broken — Zoom was built for meetings, not lectures. Lectures need:

- **Asymmetric audio/video roles** (teacher publishes always, students rarely)
- **Cheap subscriber bandwidth** (kids on 3G)
- **Replay > live** for half the audience (kids missing class, parents reviewing)

LIQAA's simulcast + selective forwarding is built for exactly this asymmetry.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```
