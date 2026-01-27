# Remote Playwright Server Setup

This configuration allows you to run Playwright Server in Docker and connect to it from your host machine or other machines. This is useful for:

- Running tests on unsupported Linux distributions
- Remote execution scenarios
- Centralized browser testing infrastructure
- CI/CD pipelines with remote execution

## Quick Start

### 1. Start the Playwright Server

```bash
# Start the server in the background
docker-compose -f docker-compose.playwright-server.yml up -d

# View logs
docker-compose -f docker-compose.playwright-server.yml logs -f

# Stop the server
docker-compose -f docker-compose.playwright-server.yml down
```

### 2. Run Tests Against Remote Server

There are three ways to connect:

#### Method 1: Using .env File (Recommended)

Add to your `.env` file:

```bash
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/
```

Then run tests normally:

```bash
npm run test:e2e
```

The `playwright.config.ts` is already configured to use this environment variable if set.

#### Method 2: Using Environment Variable (Per-session)

```bash
# Run all tests against the remote server
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/ npm run test:e2e

# Run specific test file
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/ npx playwright test e2e/auth.spec.ts

# Run in headed mode (visible browser)
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/ npx playwright test --headed
```

#### Method 3: Using browserType.connect() API

```typescript
import { chromium } from '@playwright/test';

const browser = await chromium.connect('ws://127.0.0.1:3000/');
const page = await browser.newPage();
await page.goto('https://example.com');
```

## Docker Configuration Details

### Server Service (playwright-server)

- **Image**: `mcr.microsoft.com/playwright:v1.57.0-noble`
- **Base**: Ubuntu 24.04 LTS (Noble Numbat)
- **User**: `pwuser` (non-root for security)
- **Port**: `3000` (default Playwright server port)
- **Network**: Standard Docker bridge networking
- **Host Access**: `hostmachine` alias available for accessing localhost services on the host

### Recommended Docker Flags

The configuration uses these recommended flags from official Playwright documentation:

1. **`init: true`** - Prevents zombie processes by properly handling PID 1
2. **`ipc: host`** - Required for Chromium to prevent memory crashes
3. **`user: pwuser`** - Non-root user for better security with sandbox support
4. **`restart: unless-stopped`** - Automatic restart on failure

### Network Configuration

The server exposes port `3000` for WebSocket connections. When connecting from tests:

- Use `ws://127.0.0.1:3000/` for connections from the same machine
- Use `ws://<server-ip>:3000/` for connections from other machines
- Use `hostmachine` hostname instead of `localhost` when accessing local servers from within Docker

## Accessing Local Servers

If your tests need to access servers running on your host machine:

1. The docker-compose includes `extra_hosts` mapping `hostmachine:host-gateway`
2. Update your tests to use `hostmachine` instead of `localhost`:

```typescript
// Instead of:
await page.goto('http://localhost:5173');

// Use:
await page.goto('http://hostmachine:5173');
```

## Using with Sandbox (Optional)

For enhanced security, you can enable Chromium sandbox by uncommenting the seccomp profile in `docker-compose.playwright-server.yml`:

```yaml
security_opt:
  - seccomp:seccomp_profile.json
```

The `seccomp_profile.json` file provides the necessary permissions for user namespace cloning required by Chromium's sandbox.

## Version Compatibility

**Important**: Ensure the Playwright version in your tests matches the version running in the Docker container.

- Current setup uses: `v1.57.0`
- Check your `package.json`: Look for `"@playwright/test"` and `"playwright"` versions
- Update docker-compose to match your project version

## Running in Production

For production use, consider:

1. **Authentication**: Add WebSocket authentication middleware
2. **HTTPS**: Use reverse proxy (nginx/traefik) with TLS
3. **Rate Limiting**: Implement connection limits
4. **Monitoring**: Add health checks and metrics
5. **Load Balancing**: Run multiple server instances behind a load balancer

### Example Production Configuration

```yaml
# docker-compose.prod.yml
services:
  playwright-server:
    image: mcr.microsoft.com/playwright:v1.57.0-noble
    # ... other config ...
    environment:
      - PLAYWRIGHT_SERVER_AUTH_TOKEN=${AUTH_TOKEN}
    deploy:
      replicas: 3
```

## Troubleshooting

### Server Not Starting

```bash
# Check container logs
docker logs orders-playwright-server

# Check if port is in use
lsof -i :3000
```

### Connection Refused

```bash
# Verify server is running
docker ps | grep playwright-server

# Test WebSocket connection
wscat -c ws://127.0.0.1:3000/
```

### Chromium Sandbox Issues

If you see errors about sandbox:

1. Disable the seccomp profile (comment out in docker-compose)
2. Or use the root user (less secure):

```yaml
# Not recommended for production
user: root
```

### Memory Issues

If Chromium runs out of memory:

1. Ensure `ipc: host` is set (already in config)
2. Add memory limits to container:

```yaml
deploy:
  resources:
    limits:
      memory: 2G
```

## Difference from Test Container

This setup is different from `docker-compose.playwright.yml`:

| Feature | Test Container | Remote Server |
|---------|---------------|---------------|
| Purpose | Run tests IN container | Run browsers IN container |
| Network | Host mode | Bridge mode |
| Access | Direct | Remote via WebSocket |
| Use Case | CI/CD | Remote testing, distributed execution |

## Connecting from Other Machines

To connect from a different machine:

1. Update firewall to allow port 3000:

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

2. In your tests, use the server's IP address:

```bash
PW_TEST_CONNECT_WS_ENDPOINT=ws://192.168.1.100:3000/ npm run test:e2e
```

3. Update docker-compose to listen on all interfaces:

```yaml
ports:
  - "3000:3000"  # Already listens on all interfaces
```

## Resources

- [Official Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [Playwright Remote Connection](https://playwright.dev/docs/docker#remote-connection)
- [Docker Networking](https://docs.docker.com/network/)
