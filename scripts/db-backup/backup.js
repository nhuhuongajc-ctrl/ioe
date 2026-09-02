#!/usr/bin/env node

/**
 * DATABASE BACKUP UTILITY
 * Safely creates a timestamped copy of the SQLite database.
 */

const fs = require('fs');
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'app.sqlite');
const backupDir = path.join(path.dirname(dbPath), 'backups');

console.log('[IOE Backup] Initiating SQLite backup...');

if (!fs.existsSync(dbPath)) {
  console.log(`[IOE Backup] Database file does not exist yet at: ${dbPath}. Nothing to backup.`);
  process.exit(0);
}

try {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `app.backup.${timestamp}.sqlite`;
  const backupFilePath = path.join(backupDir, backupFileName);

  fs.copyFileSync(dbPath, backupFilePath);

  // Also copy WAL and SHM files if they exist
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  if (fs.existsSync(walPath)) fs.copyFileSync(walPath, `${backupFilePath}-wal`);
  if (fs.existsSync(shmPath)) fs.copyFileSync(shmPath, `${backupFilePath}-shm`);

  const stat = fs.statSync(backupFilePath);
  console.log(`[IOE Backup] ✓ Backup created successfully: ${backupFilePath} (${(stat.size / 1024).toFixed(2)} KB)`);
  process.exit(0);
} catch (err) {
  console.error('[IOE Backup] ✗ Backup failed:', err.message);
  process.exit(1);
}
