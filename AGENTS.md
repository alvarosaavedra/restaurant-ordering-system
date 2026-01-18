You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

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
