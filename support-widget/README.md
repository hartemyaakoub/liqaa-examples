# Support widget

Drop-in **"Need help? Talk to a human."** button. When the customer clicks, an agent in your team gets paged, and a video call starts in 3 seconds.

![Demo](../docs/support-widget.gif)

## What's inside

```
support-widget/
├─ app/
│  ├─ page.tsx              · marketing page with the support button
│  ├─ layout.tsx
│  ├─ liqaa-button.tsx      · the actual button (client component)
│  ├─ api/
│  │  ├─ sdk-token/route.ts · server-side token exchange
│  │  └─ webhooks/liqaa/route.ts · verifies + persists call.* events
│  └─ admin/
│     └─ page.tsx           · agent dashboard (live queue + CSAT)
├─ lib/
│  ├─ liqaa.server.ts       · server-only LIQAA client (uses sk_live_)
│  └─ db.ts                 · sqlite for the queue + survey
└─ .env.example
```

## Run it

```bash
cp .env.example .env.local
# fill: LIQAA_PK, LIQAA_SK, LIQAA_WEBHOOK_SECRET
npm install
npm run dev
# open http://localhost:3000
# in another tab: http://localhost:3000/admin (agent view)
```

## How it works

1. Customer clicks **"Talk to a human"** → browser calls `POST /api/sdk-token` on your server.
2. Server uses `sk_live_` to call LIQAA's `POST /v1/sdk-token` and gets a JWT scoped to one room.
3. Browser passes the JWT to LIQAA's SDK; the call connects.
4. LIQAA delivers `call.started` to your `/webhooks/liqaa` endpoint.
5. The admin dashboard subscribes to a SSE stream and shows a paging notification.
6. When the agent joins, both sides are in the room.
7. On `call.ended`, LIQAA delivers the duration + recording URL.
8. The CSAT survey is shown to the customer.

## Production checklist

- [ ] Replace SQLite with Postgres or your real DB
- [ ] Add an actual agent auth layer (`/admin` is unauthenticated for demo purposes)
- [ ] Subscribe to `recording.ready` to email the recap
- [ ] Add Sentry / Datadog for failed token exchanges
- [ ] Set `LIQAA_JWT_TTL=600` (10 min) — support calls rarely run longer

## Why this pattern wins

Compared to "embed a Calendly link" or "open a chat":

- **No scheduling friction** — instant.
- **Higher conversion** than chat (you see + hear the customer).
- **Lower agent load** than chat (resolution in 4 min average vs 19 min).
- **Recording is gold** for product feedback and onboarding training.

Source: [Intercom's 2025 conversational support report](https://intercom.com/research).
