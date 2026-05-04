# LIQAA · Production-grade examples

Five **real applications** built on the LIQAA video API. Not toy demos — these are the patterns we recommend for actual SaaS products. Clone, run, ship.

| Example | Stack | What it demonstrates | TTV* |
| ------- | ----- | -------------------- | ---- |
| [`support-widget`](./support-widget) | Next.js 16, server actions | Drop-in support button on any page · agent queue · CSAT survey | 5 min |
| [`telehealth`](./telehealth) | Laravel 12, Livewire 3 | Doctor / patient waiting room · prescription PDF · HIPAA-aligned defaults | 12 min |
| [`virtual-classroom`](./virtual-classroom) | Next.js + Tailwind | 1-to-many lecture · raise-hand · breakout rooms · recording → S3 | 10 min |
| [`sales-demo`](./sales-demo) | React + Vite | Embed in your marketing site · screen-share · auto-recap email | 8 min |
| [`interview-platform`](./interview-platform) | Express.js + vanilla JS | Coding pad · timed questions · candidate-scored panel | 15 min |

\* TTV = time-to-video on a fresh laptop, assuming you already have a `pk_live_` and `sk_live_`.

## Why these five?

We picked the five highest-volume use cases for video APIs in 2026 (per [State of WebRTC 2025](https://webrtc-stats.com)):

1. **Customer support** — 41% of new video API integrations.
2. **Telemedicine** — 18%.
3. **Education / training** — 14%.
4. **Sales / pre-sales** — 11%.
5. **Hiring / interviews** — 7%.

Together: ~91% of real-world traffic.

## Quickstart (any example)

```bash
git clone --depth 1 https://github.com/hartemyaakoub/liqaa-examples
cd liqaa-examples/support-widget
cp .env.example .env.local
# add your pk_live_ + sk_live_ from https://liqaa.io/console
npm install && npm run dev
```

## Architecture rules followed by every example

- **No `sk_live_` in the browser.** Token exchange happens server-side ([ADR-002](https://github.com/hartemyaakoub/liqaa-architecture/blob/main/adrs/002-stripe-pattern-pk-sk-key-separation.md)).
- **JWT TTL ≤ 60 minutes.** Long-lived tokens are a liability ([ADR-003](https://github.com/hartemyaakoub/liqaa-architecture/blob/main/adrs/003-jwt-token-exchange-vs-long-lived-keys.md)).
- **Webhook signatures verified in constant time.** Every example has a `/webhooks/liqaa` route with `LIQAA-Signature` verification.
- **No PII in URLs.** Room IDs are opaque (`room_01HK7N…`), not customer emails.
- **Idempotency keys** on every `POST` that creates state.
- **Graceful degradation.** If LIQAA is unreachable, the UI tells the user — it doesn't silently fail.

## What's not in these examples (deliberate)

- Stripe billing — orthogonal, varies wildly per SaaS.
- Multi-tenant sharding — covered in [`liqaa-architecture`](https://github.com/hartemyaakoub/liqaa-architecture) ADRs.
- Mobile native (iOS / Android) — coming Q3 2026 with `liqaa-swift` + `liqaa-kotlin`.

## License

[MIT](./LICENSE) — fork, modify, ship as your own product. We don't ask for attribution (but a helps us keep this maintained).

---

> Each example has its own `README.md` with deeper docs. Start there.
