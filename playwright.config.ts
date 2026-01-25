import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 120000,
		reuseExistingServer: !process.env.CI
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
		video: 'retain-on-failure'
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
