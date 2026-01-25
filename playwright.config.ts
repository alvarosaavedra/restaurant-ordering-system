import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	globalSetup: './e2e/global-setup.ts',
	globalTeardown: './e2e/global-teardown.ts',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 120000,
		reuseExistingServer: !process.env.CI,
		env: process.env.DATABASE_URL ? { DATABASE_URL: process.env.DATABASE_URL } : undefined
	},
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		connectOptions: process.env.PW_TEST_CONNECT_WS_ENDPOINT
			? { wsEndpoint: process.env.PW_TEST_CONNECT_WS_ENDPOINT }
			: undefined
	},
	projects: [
		{
			name: 'chromium',
			use: {
				viewport: { width: 1280, height: 720 },
				launchOptions: {
					channel: 'chromium'
				}
			}
		}
	]
});
