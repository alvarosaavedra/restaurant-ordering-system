import { defineConfig } from '@playwright/test';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, 'test.db');

export default defineConfig({
	globalSetup: './e2e/global-setup.ts',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 180000,
		reuseExistingServer: !process.env.CI,
		env: {
			DATABASE_URL: `file:${testDbPath}`
		}
	},
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	workers: 1,
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
		},
		{
			name: 'mobile-chrome-small',
			use: {
				viewport: { width: 320, height: 568 },
				launchOptions: {
					channel: 'chromium'
				}
			}
		},
		{
			name: 'mobile-chrome-medium',
			use: {
				viewport: { width: 375, height: 667 },
				launchOptions: {
					channel: 'chromium'
				}
			}
		},
		{
			name: 'mobile-chrome-large',
			use: {
				viewport: { width: 428, height: 926 },
				launchOptions: {
					channel: 'chromium'
				}
			}
		}
	]
});
