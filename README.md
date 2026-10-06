# Menitap

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators, shoppers, and brand managers. It connects creators with direct brand review campaigns and sponsorship opportunities while offering shoppers verified deals, discount promo codes, and authentic creator video reviews.

## 🎯 Navigation & Core Features

- **Deals (`/deals`)**: Curated catalog of verified product deals, promo codes, and authentic creator video reviews.
- **Brand Collabs (`/collabs`)**: Direct brand review campaigns and sponsorship links for UGC creators to test products and earn.
- **Creators (`/creators`)**: Searchable public creator portfolios and directory showcasing creator social links and content niches.
- **Plans (`/plans`)**: Transparent membership tiers for shoppers and creators.
- **About (`/about`)**: Platform mission and 3-step ecosystem explainer.
- **My Account (`/dashboard`)**: Unified account center with profile settings, shared deal management, active campaigns, and plan controls.

## 👥 Account Types & Roles

- **Shopper / Explorer (`USER`)**: Explore deals, copy verified discount codes, and save favorites.
- **UGC Creator (`CREATOR`)**: Post and manage affiliate deals, apply directly to brand campaigns, and showcase a public portfolio.
- **Brand Manager (`BRAND`)**: Publish product review campaigns, connect directly with creators by category.
- **Admin (`ADMIN`)**: Dedicated Admin Command Center on `/dashboard` with segmented tabs for the collab moderation queue, category taxonomies management (`Deals`, `Brand Collabs`, `Creators`), live content moderation, and real-time platform health KPI metrics.

## 💳 Membership Plans

- **Explorer ($0 / Free)**: Browse creator deals, view beginner UGC resources, and bookmark items.
- **Creator Basic ($10/month)**: Access direct brand collaboration links, receive products to test and keep, and publish affiliate deals.
- **Creator Standard ($15/month)**: Everything in Basic + Public Creator Profile & Portfolio showcase, category-filtered brand visibility.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui (`@base-ui/react`) |
| Database | Supabase (PostgreSQL with RLS & Triggers) |
| Auth | Supabase Auth (Google OAuth + Email/Password) |
| Deployment | Vercel (Automatic CI/CD from `main`) |
| Monorepo | Turborepo + pnpm 12 |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (managed via fnm)
- pnpm 12+

### Installation
```bash
git clone https://github.com/nur0709/menitap.git
cd menitap
pnpm install
```

### Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Verification
```bash
pnpm build
pnpm lint
pnpm typecheck
```

## 📄 License
MIT
