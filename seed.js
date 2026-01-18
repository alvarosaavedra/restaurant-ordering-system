import { seedDatabase } from './src/lib/server/db/seed.js';

seedDatabase().catch(console.error);