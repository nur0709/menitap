# Menitap

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators and shoppers. It provides aspirational creators with resources to start producing UGC videos, while offering users discounted product purchases via curated affiliate networks.

## 🎯 Features

### Account Types
- **Shopper / Explorer (`USER`)**: Explore discounted product deals, save affiliate promotions, and watch beginner UGC educational tutorials.
- **UGC Creator (`CREATOR`)**: Post and manage affiliate deals with promo codes, access brand collaboration campaigns, and showcase UGC portfolios.
- **Brand Manager (`BRAND`)**: Publish review campaigns, connect directly with creators by category, and discover creator talent.
- **Admin (`ADMIN`)**: Full platform controls, taxonomy/category management across tabs, and preview switching capabilities.

### Membership Plans
- **Explorer ($0 / Free)**: Browse creator affiliate deals, watch free beginner UGC tutorials, and bookmark items.
- **Creator Basic ($10/month)**: Access direct brand collaboration links, receive products to test and keep, and publish affiliate links to shoppers.
- **Creator Standard ($15/month)**: Featured placement, Public Creator Profile & Portfolio showcase, and category-filtered brand visibility.
- **Brand Manager (Free MVP)**: Direct creator collaboration, post product-for-review campaigns, and search creators by niche category.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Hosting | Cloudflare Pages |
| Storage | Cloudflare R2 |
| ORM | Drizzle |
| Monorepo | Turborepo + pnpm |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
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

### Build
```bash
pnpm build
```

## 📁 Project Structure
```
menitap/
├── apps/
│   └── web/              # Main Next.js application
│       └── src/
│           ├── app/       # Next.js App Router pages
│           ├── components/# Shared UI components
│           ├── features/  # Feature-sliced modules
│           ├── lib/       # Utilities, config
│           └── server/    # Server-only code (DB, actions)
├── packages/             # Shared packages (future)
├── AGENTS.md             # AI agent instructions
└── turbo.json            # Turborepo config
```

## 📄 License
MIT
