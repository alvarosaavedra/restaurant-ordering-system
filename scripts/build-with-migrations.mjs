#!/usr/bin/env node
/**
 * Build script that runs database migrations before building the application
 * This ensures the database schema is always up-to-date before deployment
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Starting build with migrations...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Migration step will be skipped (this is normal for preview builds without DB)');
  console.log('\n⚠️  Skipping migrations and proceeding with build...\n');
} else {
  try {
    // Run database migrations
    console.log('🔄 Running database migrations...');
    execSync('npm run db:migrate', {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Database migrations completed successfully\n');
  } catch (error) {
    console.error('❌ Database migrations failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the actual build
try {
  console.log('🏗️  Building application...');
  execSync('vite build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:');
  console.error(error.message);
  process.exit(1);
}

console.log('🎉 Build with migrations completed successfully!');
