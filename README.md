This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Segment CDP Demo Features

This demo is instrumented with [Segment](https://segment.com) via `@segment/analytics-next`, and ships with a full-featured demo toolkit for Solutions Engineers:

- **Event Inspector** — click the green **Segment** FAB in the bottom-right to open a live inspector of every `track`, `identify`, `page`, `group`, and `alias` call (with copy-as-JSON).
- **Audiences** — 8 pre-built client-side audiences evaluate in real time from the session's event log. Entering or exiting an audience fires `Audience Entered` / `Audience Exited` track events.
- **Identity panel** — shows the live `userId`, `anonymousId`, trait table, and the identify/alias timeline.
- **Customer Journey** — a funnel visualizer (Visitor → Engaged → Cart Abandoner → Customer → Repeat Customer → VIP) with stage history.
- **Computed Traits** — live-computed lifetime spend, order count, favorite category, days since last order, and more.
- **Personalization** — the home-page banner and a menu-page "Next Best Offer" swap their copy based on audience membership.
- **Demo personas** — load pre-seeded personas (VIP, Cart Abandoner, Deal Hunter, Anonymous) from the Segment Demo toolbar (top-right).
- **Cart abandonment nudge** — triggers a personalized Sonner toast after 45s of inactivity.

To hide every overlay and present the "before" state, click **Segment Demo → Demo overlays** and toggle off.

### Setup

Set `NEXT_PUBLIC_SEGMENT_WRITE_KEY` in `.env.local` (see `.env.example`). Leaving it blank keeps the demo fully functional locally — events still populate the inspector, they just don't send to Segment.
