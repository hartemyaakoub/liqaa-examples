# Sales demo — embed in your marketing site

A "Book a demo" pattern that **doesn't make the prospect schedule for next Tuesday**. They click → land in a call with a sales rep in 8 seconds. If no rep is available, they get a calendar fallback.

## What's inside

Vite + React. Drop the `<DemoButton />` anywhere in your marketing site.

```jsx
import { DemoButton } from '@liqaa-examples/sales-demo';

<DemoButton
  pk={import.meta.env.VITE_LIQAA_PK}
  endpoint="/api/sales-demo-token"
  fallbackToCalendly="https://calendly.com/your-team/demo"
  onConverted={(participants) => analytics.track('demo_started', participants)}
/>
```

## Conversion notes

A sales-demo button on your pricing page typically converts:

- **0.4 – 1.2%** of visitors with "Schedule a demo" (Calendly etc.)
- **1.8 – 3.5%** with "Talk now" (live video)
- **4 – 6%** if the rep auto-shares their screen + pre-loaded the prospect's account

The third number is why we ship `auto-share-screen.ts` — at call start, the rep's browser auto-publishes their pre-prepared deck.

## Round-robin agent assignment

```ts
// server-side
async function assignAgent() {
  const available = await db.agents.where({ status: 'available' });
  if (available.length === 0) return null;
  const next = available.sort((a, b) => a.lastAssignedAt - b.lastAssignedAt)[0];
  await db.agents.update(next.id, { lastAssignedAt: Date.now() });
  return next;
}
```

If `null`, the button shows the Calendly fallback. If one is available, both join the same room.

## Auto-recap email

After `call.ended`, we use the recording transcript (when LIQAA Pro is enabled) to generate a follow-up email:

- Summary of what was discussed
- Action items
- Pricing sheet attached

This is a 60-line `recap.ts` server action. The conversion bump from auto-recaps is ~12% in our internal A/B test.

## Run it

```bash
npm install
npm run dev
```
