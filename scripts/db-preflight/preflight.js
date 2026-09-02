#!/usr/bin/env node

/**
 * DATABASE PREFLIGHT DIAGNOSTICS SCRIPT
 * Verifies system readiness, permissions, paths, and environment settings.
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' [IOE Preflight] Running Server & Storage Diagnostics');
console.log('====================================================');

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'app.sqlite');
const mediaPath = process.env.MEDIA_STORAGE_PATH || (process.env.SQLITE_DB_PATH ? path.dirname(process.env.SQLITE_DB_PATH) : path.join(process.cwd(), 'data'));

console.log(`[1] SQLite Database Path: ${dbPath}`);
console.log(`[2] Media Storage Path:   ${mediaPath}`);
console.log(`[3] Node Version:         ${process.version}`);

let hasErrors = false;

// Check / Create Database Directory
try {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`  ✓ Created SQLite directory: ${dbDir}`);
  } else {
    fs.accessSync(dbDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log(`  ✓ SQLite directory is readable and writable: ${dbDir}`);
  }
} catch (err) {
  console.error(`  ✗ SQLite directory permission error:`, err.message);
  hasErrors = true;
}

// Check / Create Media Directories
try {
  const imgDir = path.join(mediaPath, 'images');
  const audDir = path.join(mediaPath, 'audio');
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });

  fs.accessSync(imgDir, fs.constants.R_OK | fs.constants.W_OK);
  fs.accessSync(audDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log(`  ✓ Media directories (images & audio) verified`);
} catch (err) {
  console.error(`  ✗ Media directory permission error:`, err.message);
  hasErrors = true;
}

// Check Firebase Admin credentials if provided
const fbProject = process.env.FIREBASE_PROJECT_ID;
const fbEmail = process.env.FIREBASE_CLIENT_EMAIL;
const fbKey = process.env.FIREBASE_PRIVATE_KEY;

if (fbProject && fbEmail && fbKey) {
  console.log(`  ✓ Firebase Admin environment variables configured (${fbProject})`);
} else {
  console.log(`  ℹ Firebase Admin variables not fully specified; app will run in fallback authentication mode.`);
}

console.log('====================================================');
if (hasErrors) {
  console.error('[IOE Preflight] Preflight FAILED. Fix permission issues above.');
  process.exit(1);
} else {
  console.log('[IOE Preflight] All preflight checks PASSED successfully.');
  process.exit(0);
}
