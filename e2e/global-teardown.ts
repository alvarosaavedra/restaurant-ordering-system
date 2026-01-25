import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalTeardown() {
	const testDbPath = path.join(__dirname, '..', 'test.db');

	if (fs.existsSync(testDbPath)) {
		try {
			fs.unlinkSync(testDbPath);
			console.log('✅ Test database cleaned up successfully');
		} catch (error) {
			console.error('❌ Error cleaning up test database:', error);
		}
	} else {
		console.log('ℹ️ Test database not found, nothing to clean up');
	}
}
