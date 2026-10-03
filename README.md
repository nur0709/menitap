# Menitap

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators and shoppers. It provides aspirational creators with resources to start producing UGC videos, while offering users discounted product purchases via curated affiliate networks.

## 🎯 Features

### Membership Tiers
- **Buyer-User (Free)**: Access free educational videos and use affiliate links to purchase products with discounts.
- **Basic Plan ($5/month)**: Publish and manage your own affiliate links. Contribute brand links to earn points redeemable for subscription discounts.
- **Standard Plan ($10/month)**: Access brand application links to produce UGC videos and receive products. Contribute brand links and earn points.

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
