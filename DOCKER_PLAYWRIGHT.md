# Playwright Docker Setup

This project supports two Docker-based Playwright configurations:

1. **Test Container** (`docker-compose.playwright.yml`) - Run tests inside Docker
2. **Remote Server** (`docker-compose.playwright-server.yml`) - Run Playwright Server in Docker and connect remotely

See [PLAYWRIGHT_REMOTE_SERVER.md](./PLAYWRIGHT_REMOTE_SERVER.md) for remote server setup.

## Quick Start - Test Container

```bash
# Build and run tests in Docker
docker-compose -f docker-compose.playwright.yml build
docker-compose -f docker-compose.playwright.yml up --abort-on-container-exit
```

## Docker Compose Services

### playwright-tests
- **Image**: Built from `Dockerfile.playwright`
- **Base**: `mcr.microsoft.com/playwright:v1.47.0-jammy`
- **Ports**: None (uses host network)
- **Volumes**:
  - `.:/app` - Mounts project directory
  - `/app/node_modules` - Preserves node_modules
- **Environment**:
  - `CI=true` - Enables CI mode in Playwright
- **Network**: `host` - Allows tests to reach external services

## Custom Dockerfile

The `Dockerfile.playwright` uses:
- Playwright v1.47.0 Jammy image (includes Chromium)
- Node.js 18.x
- Project dependencies from `package.json`
- Runs `npm run test:e2e` by default

## Running Specific Tests

```bash
# Run specific test file
docker-compose -f docker-compose.playwright.yml run --rm playwright-tests npx playwright test e2e/auth.spec.ts

# Run in headed mode (visible browser)
docker-compose -f docker-compose.playwright.yml run --rm -e CI=false playwright-tests npx playwright test --headed
```

## Troubleshooting

### Port Already in Use
If port 4173 is already in use:
```bash
# Kill existing process
pkill -f "npm run preview"
```

### Container Permission Issues
On Linux, you may need to fix permissions:
```bash
# Fix mounted volume permissions
sudo chown -R $(id -u):$(id -g) .
```

### Network Issues
If tests can't reach localhost services:
- Ensure services are running on host machine
- Docker is using `network_mode: host` for direct access
