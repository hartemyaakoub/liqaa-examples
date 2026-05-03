# Interview platform — coding pad + timed questions

Tech-interview pattern: candidate joins, panel of 1–4 interviewers, **shared coding pad**, timed questions, post-call scorecard.

## Stack

Express.js (server) + vanilla JS + LIQAA SDK + a tiny CRDT-backed coding pad (~120 lines, uses Y.js over LIQAA's data channel).

## Why no frontend framework?

Interview platforms tend to live for years inside hiring teams. Vanilla JS + a few well-chosen libs ages better than a Next.js 14 app that's stuck in 2024 forever. This template is intentionally framework-light.

## What's inside

```
interview-platform/
├─ server/
│  ├─ index.js              · Express, ~150 lines
│  ├─ routes/
│  │  ├─ schedule.js        · /api/schedule
│  │  ├─ token.js           · LIQAA token exchange
│  │  └─ webhooks.js        · call.* + recording.*
│  └─ db.sqlite             · interviews, panels, scorecards
└─ public/
   ├─ index.html            · candidate join page
   ├─ panel.html            · interviewer view (3-panel layout)
   ├─ js/
   │  ├─ liqaa.js           · video logic
   │  ├─ codepad.js         · Y.js + Monaco editor
   │  └─ timer.js           · timed-question state machine
   └─ css/
```

## The interesting parts

### Coding pad over LIQAA's data channel

```js
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const ytext = ydoc.getText('code');

client.onData((msg) => {
  if (msg.kind === 'yjs') Y.applyUpdate(ydoc, new Uint8Array(msg.bytes));
});

ydoc.on('update', (update) => {
  client.publishData({ kind: 'yjs', bytes: Array.from(update) });
});
```

That's the whole CRDT sync. ~30ms latency (same data channel as audio). No backend Yjs server needed.

### Timed questions

Each question has a timer. When the timer hits 0, the panel sees a "✓ ready to score" prompt. The candidate sees nothing — no pressure clock on screen.

### Auto-scorecard from recording

After `recording.ready`, a transcript is generated → an LLM scoring rubric runs against it → the panel reviews + adjusts. Saves ~20 min of post-call paperwork per interview.

## Why interviewers prefer this over HackerRank / CoderPad

- **One tool**, not two (no "switch tabs to the call"). Eyes stay on the candidate.
- **Recording** for diversity hiring auditing — proven reduction in unconscious bias when reviewers re-watch decisions.
- **Self-hosted** — your hiring data stays in your DB, not in a vendor's.

## Run it

```bash
npm install
cp .env.example .env
node server/index.js
```
