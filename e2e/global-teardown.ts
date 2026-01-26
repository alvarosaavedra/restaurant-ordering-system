import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalTeardown() {
	const numWorkers = 8;
	const baseDbPath = path.join(__dirname, '..', 'test-worker');

	for (let i = 0; i < numWorkers; i++) {
		const testDbPath = `${baseDbPath}-${i}.db`;

		if (fs.existsSync(testDbPath)) {
			try {
				fs.unlinkSync(testDbPath);
				console.log(`✅ Worker ${i} database cleaned up successfully`);
			} catch (error) {
				console.error(`❌ Error cleaning up worker ${i} database:`, error);
			}
		}
	}
}
