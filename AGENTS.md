# Restaurant Ordering System - Development Guidelines

This document provides comprehensive guidelines for agentic coding agents working on this Restaurant Ordering System built with SvelteKit 5, Drizzle ORM, and SQLite.

## Project Status

### ✅ Completed Phases
- **Phase 1**: Database Schema & Models - Complete
- **Phase 2**: Authentication UI & User Management - Complete
- **Phase 3**: Order Taking Interface - Complete
- **Phase 4**: Kitchen View - Complete
- **Phase 5**: Delivery View - Complete
- **Phase 6**: Admin Dashboard - Complete

### 🟡 Current Phase
- **Phase 7**: Menu Item Variations & Modifiers - In Progress
  - See `docs/plans/PHASE_7_MENU_VARIATIONS_PLAN.md` for detailed plan
  - Task 7.1: Database Migration - Next to implement
  - Implementing full variations and modifiers system

### 🎉 System Status
All core features are implemented and functional. The system supports full order workflow from creation to delivery with role-based access control.

**New Feature Development:** Currently implementing menu item customizations (variations like Meat/Chicken choices and modifiers like Extra Wasabi).

## Svelte MCP Server Tools

### 1. list-sections
Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation
Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer
Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link
Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Build/Lint/Test Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint on all files
- `npm run check` - Run SvelteKit type checking with svelte-check
- `npm run check:watch` - Run svelte-check in watch mode

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:unit <file>` - Run specific unit test file
- `npm run test:e2e <file>` - Run specific e2e test file

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Architecture

### Route Structure
- **Auth Routes**: `(auth)/` - Public authentication pages
  - `/login` - Login page for all users
  - `+layout.svelte` - Auth-specific layout
- **Protected Routes**: `(app)/` - Require authentication
  - `/` - Dashboard (role-based content)
  - `/orders/new` - Order taking (order_taker role)
  - `/orders` - Order history (all roles)
  - `/kitchen` - Kitchen view (kitchen role)
  - `/delivery` - Delivery view (delivery role)

### User Roles & Permissions
- **order_taker**: Can create orders, view history, access dashboard
- **kitchen**: Can view orders, update to preparing/ready, view history, access dashboard  
- **delivery**: Can view ready orders, update to delivered, view history, access dashboard

### Database Schema
- **Users**: id, name, email, role, password_hash, timestamps
- **Categories**: id, name, display_order, created_at
- **Menu Items**: id, category_id, name, description, price, is_available, created_at
- **Clients**: id, name, phone (unique), address, timestamps
- **Orders**: id, customer_name, customer_phone, total_amount, status, employee_id, delivery_date_time, address, comment, timestamps
- **Order Items**: id, order_id, menu_item_id, quantity, unit_price, created_at
- **Sessions**: id, user_id, expires_at (for authentication)

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Use `import type` for type-only imports
- Svelte 5 runes syntax (`$state`, `$props`, `$derived`) preferred
- File extensions: `.ts` for TypeScript, `.svelte` for components

### Import Organization
- SvelteKit imports first: `$app/*`, `$lib/*`
- External libraries second
- Local imports third
- Type imports use `import type`
- Relative imports use `./` prefix

### Component Structure
- Use Svelte 5 `<script lang="ts">` with runes
- Props destructuring: `let { prop1, prop2 } = $props();`
- State management with `$state()`, `$derived()`
- Children slots: `let { children } = $props();`

### Database Patterns
- Drizzle ORM with SQLite
- Schema defined in `src/lib/server/db/schema.ts`
- Types inferred with `$inferSelect`, `$inferInsert`
- Server-only code in `src/lib/server/*`

### Testing Patterns
- Unit tests: `src/**/*.spec.ts` or `src/**/*.test.ts`
- Component tests: `src/**/*.svelte.spec.ts` with `vitest-browser-svelte`
- E2E tests: `e2e/*.spec.ts` with Playwright
- Use `describe`, `it`, `expect` from Vitest

### Error Handling
- Server code: Use SvelteKit error handling (`error`, `redirect`)
- Client code: Try-catch blocks with proper error logging
- Database operations: Handle connection and query errors
- Form validation: Client and server-side validation

### Naming Conventions
- Files: kebab-case for routes, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Functions: descriptive verbs, async functions prefixed with `async`
- Database tables: snake_case

### Styling
- Tailwind CSS v4 with Vite plugin
- Component-scoped styles preferred
- Utility classes for layout and spacing
- Responsive design with mobile-first approach

### Internationalization
- Paraglide.js for i18n
- Locales managed in `src/lib/paraglide/`
- Use `$lib/paraglide/runtime` for locale utilities

### Security
- Session management with Oslo.js crypto
- CSRF protection via SvelteKit
- Environment variables for secrets
- Input validation and sanitization

## Working with Authentication

### Session Management
- Sessions stored in `session` table with 30-day expiry
- Session tokens stored as cookies with `auth-session` name
- Automatic session renewal 15 days before expiry
- Logout properly invalidates session and clears cookie

### Route Protection
- All routes in `(app)/` require valid session
- Root layout server handles authentication checks
- Role-based redirects from login to appropriate pages
- Auth routes (`/login`, `/logout`) are publicly accessible

## Current Implementation Status

### ✅ What's Working
- Database schema with all required tables
- User authentication with role-based access
- Protected routes with proper redirection
- Navigation with active state highlighting
- Sample data seeded (4 categories, 12 menu items, 3 users)
- Basic UI components (Button, Card, Input)
- Responsive design with Tailwind CSS
- TypeScript with strict mode

### 🚧 Next Phase Development
- **Phase 3**: Order Taking Interface (Complete)
- **Phase 4**: Kitchen View (Complete)
- **Phase 5**: Delivery View (Complete)
- **Phase 6**: Admin Dashboard (Complete)

## Documentation Structure

All project documentation is organized under `docs/`:

### Architecture & Diagrams
- `DIAGRAMS.md` - Comprehensive Mermaid diagrams (system architecture, database schema, workflows, authentication flow)

### Development Plans (`docs/plans/`)
- `MVP_PLAN.md` - Initial MVP scope and requirements
- `IMPLEMENTATION_PLAN.md` - Full implementation roadmap
- `ADMIN_MENU_MGMT_PLAN.md` - Admin menu management features
- `ORDER_ENHANCEMENT_PLAN.md` - Order system enhancements

### Setup Guides (`docs/setup/`)
- `CHROME_DEVTOOLS_SETUP.md` - Chrome DevTools configuration
- `DOCKER_PLAYWRIGHT.md` - Playwright Docker setup
- `PLAYWRIGHT_REMOTE_SERVER.md` - Remote Playwright server configuration

### Core Documentation
- `AGENTS.md` - This file: Development guidelines for agents
- `README.md` - Project overview and getting started guide

## Admin - Client Management

Admin users can manage clients at `/admin/clients`:

### Features
- **List clients**: View all clients with search functionality
- **Add client**: Create new clients with name, phone, and optional address
- **Edit client**: Update existing client information
- **Delete client**: Remove clients (blocked if they have orders)
- **Order count**: Shows how many orders each client has

### Server Actions
- `addClient`: Creates a new client with phone number validation
- `updateClient`: Updates existing client, checks for duplicate phone numbers
- `deleteClient`: Deletes client if no orders exist

### Validation Rules
- Name: Required
- Phone: Required, unique across clients, format validation
- Address: Optional
- Delete: Blocked if client has existing orders

## Development Workflow

### Git Workflow
Since the project is in production, **ALWAYS use the `git-worktree` skill** before making any changes. This skill will guide you through creating and managing git worktrees for parallel development.

**Critical**: Never make changes directly in the main worktree. Always create a worktree for feature or bugfix work.

To load the skill instructions, use the `skill` tool with the `git-worktree` name.

### Before Starting Work
1. Ensure you're on a feature/fix branch (not main)
2. Run `npm run check` to ensure no type errors
3. Run `npm run lint` to check code quality
4. Create components using svelte-autofixer
5. Test functionality regularly
6. Commit changes with descriptive messages

### Testing Commands
- Always run `npm run test:unit` for new components
- Use `npm run test:e2e` for user workflow testing
- Check browser console for runtime errors

### Common Patterns
- Use route groups for layout separation: `(auth)/`, `(app)/`
- Server actions in `+page.server.ts` files
- Load functions in `+layout.server.ts` files
- Client-side state management with Svelte 5 runes
- Database operations through Drizzle ORM queries
