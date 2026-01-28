# Restaurant Ordering System

A full-stack restaurant ordering application built with **SvelteKit 5**, **Drizzle ORM**, and **SQLite**. Features role-based access control for order takers, kitchen staff, and delivery personnel.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.49-FF3E00)
![Svelte](https://img.shields.io/badge/Svelte-5.45-FF3E00)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Drizzle](https://img.shields.io/badge/Drizzle-0.45-2563EB)

## ✨ Features

- **Role-Based Access Control** - Three user roles with specific permissions
- **Order Management** - Create, track, and update orders through the fulfillment pipeline
- **Menu Management** - Categorized menu items with availability toggling
- **Customer Management** - Phone-based client lookup and creation
- **Responsive Design** - Mobile-first UI using Tailwind CSS v4
- **Real-Time Updates** - Live order status tracking
- **Admin Dashboard** - Client and menu management interface

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Svelte 5 with Runes, SvelteKit 2, Tailwind CSS v4
- **Backend**: SvelteKit server actions and load functions
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Custom session management using Oslo.js crypto
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Type Safety**: TypeScript in strict mode

### User Roles

| Role | Permissions |
|------|-------------|
| **Order Taker** | Create orders, view order history, manage customers |
| **Kitchen** | View orders, update status to "preparing"/"ready", view history |
| **Delivery** | View ready orders, update to "delivered", view history |

### Order Status Pipeline

```
pending → preparing → ready → delivered
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/restaurant-ordering-system.git
   cd restaurant-ordering-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Initialize the database**
   ```bash
   npm run db:push    # Create database schema
   npm run db:seed    # Seed sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 👤 Login Credentials (Test Users)

The application comes pre-seeded with test accounts:

| Role | Email | Password | Default Redirect |
|------|-------|----------|------------------|
| Order Taker | john@bakery.com | password123 | `/orders/new` |
| Kitchen | jane@bakery.com | password123 | `/kitchen` |
| Delivery | mike@bakery.com | password123 | `/delivery` |

## 📁 Project Structure

```
restaurant-ordering-system/
├── src/
│   ├── routes/              # SvelteKit file-based routing
│   │   ├── (auth)/         # Public authentication pages
│   │   │   ├── login/      # Login page
│   │   │   └── +layout.svelte
│   │   └── (app)/          # Protected routes
│   │       ├── /           # Dashboard (role-based)
│   │       ├── orders/     # Order management
│   │       ├── kitchen/    # Kitchen view
│   │       ├── delivery/   # Delivery view
│   │       └── admin/      # Admin dashboard
│   └── lib/
│       ├── components/     # Reusable UI components
│       ├── server/         # Server-side code
│       │   ├── auth.ts     # Authentication logic
│       │   └── db/         # Database schema & connection
│       ├── stores/         # Svelte stores
│       ├── types/          # TypeScript type definitions
│       └── utils/          # Utility functions
├── e2e/                    # Playwright E2E tests
├── drizzle/                # Drizzle migrations
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Available Scripts

### Development

```bash
npm run dev            # Start development server with hot reload
npm run dev -- --open  # Start and open in browser
```

### Building & Deployment

```bash
npm run build          # Build for production
npm run preview        # Preview production build locally
```

### Code Quality

```bash
npm run lint           # Run ESLint
npm run check          # Run SvelteKit type checking
npm run check:watch    # Watch mode for type checking
```

### Testing

```bash
npm run test           # Run all tests (unit + e2e)
npm run test:unit      # Run unit tests with Vitest
npm run test:e2e       # Run E2E tests with Playwright
```

### Database

```bash
npm run db:push        # Push schema changes to database
npm run db:generate    # Generate migration files
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Drizzle Studio (database GUI)
npm run db:seed        # Seed sample data
```

## 🗄️ Database Schema

### Tables

- **users** - User accounts with roles
- **sessions** - Authentication sessions
- **categories** - Menu categories
- **menu_items** - Individual menu items
- **clients** - Customer database
- **orders** - Order headers
- **order_items** - Order line items

### Key Relationships

- Categories → Menu Items (1:N)
- Orders → Order Items (1:N)
- Menu Items → Order Items (1:N)
- Users → Orders (1:N)
- Clients → Orders (1:N)

## 🎨 UI Components

### Core Components

- `Button.svelte` - Interactive button with loading states
- `Card.svelte` - Content container with consistent styling
- `Input.svelte` - Form input with validation
- `Spinner.svelte` - Loading indicator
- `Toast.svelte` - Notification system
- `Modal.svelte` - Modal dialogs
- `Sidebar.svelte` - Navigation sidebar (desktop)
- `MobileBottomNav.svelte` - Navigation (mobile)

### Feature Components

- `MenuItemCard.svelte` - Menu item display
- `CategoryCard.svelte` - Category navigation
- `OrderCard.svelte` - Order summary
- `StatusBadge.svelte` - Order status indicators
- `ClientSearch.svelte` - Client lookup by phone
- `CustomerInfo.svelte` - Customer information form

## 🔐 Authentication

The application uses custom session-based authentication:

- Session tokens stored as secure HTTP-only cookies
- 30-day session expiration with auto-renewal
- Role-based access control on protected routes
- Server-side validation on all actions

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind CSS v4
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile bottom navigation for screens < 768px
- Desktop sidebar navigation for screens ≥ 768px

## 🧪 Testing

### Unit Tests
- Location: `src/**/*.spec.ts`, `src/**/*.test.ts`
- Framework: Vitest with browser-mode support
- Coverage: Component logic, utilities, stores

### E2E Tests
- Location: `e2e/*.spec.ts`
- Framework: Playwright
- Scenarios: User authentication, order creation, status updates

## 🚢 Deployment

### Production Stack

- **Platform**: Vercel (Edge Network)
- **Database**: Turso (Edge SQLite)
- **Development**: Local SQLite file

### Quick Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Complete Deployment Guide

For detailed deployment instructions, including:

- Turso database setup
- Environment configuration
- Custom domain setup
- CI/CD pipeline
- Monitoring and maintenance
- Troubleshooting guide

See: [**docs/setup/DEPLOYMENT_GUIDE.md**](docs/setup/DEPLOYMENT_GUIDE.md)

### Zero Cost Guarantee

Wondering if deployment will cost anything? See: [**docs/setup/ZERO_COST_GUARANTEE.md**](docs/setup/ZERO_COST_GUARANTEE.md)

**Quick Answer:** Your restaurant will likely process 20-200 orders/day, while free tiers support up to 270,000 orders/month. **You will probably never pay anything.**

### Environment Variables

**Development** (`.env`):
```bash
DATABASE_URL=file:local.db
```

**Production** (Vercel environment variables):
```bash
DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

### Platform Benefits

| Feature | Vercel | Turso |
|---------|----------|-------|
| **Edge Deployment** | ✅ Global CDN | ✅ Global replicas |
| **Automatic HTTPS** | ✅ Included | N/A |
| **Auto-Scaling** | ✅ Automatic | ✅ Automatic |
| **Backups** | Automatic rollbacks | Point-in-time recovery |
| **Pricing** | Free tier available | Generous free tier |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing code conventions
- Run `npm run lint` and `npm run check` before committing
- Write tests for new features

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with:
- [SvelteKit](https://kit.svelte.dev/) - The fastest way to build Svelte apps
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Playwright](https://playwright.dev/) - End-to-end testing framework

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check the [documentation](AGENTS.md)
- Review existing [plans](IMPLEMENTATION_PLAN.md)

---

Made with ❤️ using SvelteKit
