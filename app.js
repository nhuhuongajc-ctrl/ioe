/**
 * cPanel Application Startup File: app.js
 * Root execution point for Phusion Passenger / cPanel Setup Node.js App
 * Runs on Node.js 22.x
 */

const fs = require('fs');
const path = require('path');

// Auto load .env if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional in production if env vars are set in cPanel interface
}

const bundledServerPath = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(bundledServerPath)) {
  console.log('[cPanel App Runner] Loading bundled server from dist/server.cjs...');
  require(bundledServerPath);
} else {
  console.error('[cPanel App Runner] ERROR: dist/server.cjs not found!');
  console.error('[cPanel App Runner] Please run "npm run build" before starting the application.');
  process.exit(1);
}
