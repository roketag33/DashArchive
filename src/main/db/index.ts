import { app } from 'electron'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import * as schema from './schema'
import fs from 'fs'

// Ensure the database directory exists
const userDataPath = app.getPath('userData')
const dbPath = path.join(userDataPath, 'app.db')

// Ensure directory exists (better-sqlite3 might throw if dir doesn't exist)
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

console.log('Database path:', dbPath)

export const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })

// Helper to manually push schema for simple apps (optional)
// For production, you might want to run migrations properly
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export function initDB(): void {
  // This is a naive way to run migrations in a local app
  // For a real production app, consider bundling migrations
  try {
    // NOTE: In a packaged app, creating the migration folder and running it might be tricky
    // due to ASAR. For now, we rely on 'drizzle-kit push' for dev,
    // or we need to bundle migrations with `drizzle-kit generate` and run them here.
    // For this MVP, we will assume development mode or basic setup.

    // A simple way for MVP without external migration files:
    sqlite.exec(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                content TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS rules (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                extensions TEXT,
                name_pattern TEXT,
                size_min INTEGER,
                size_max INTEGER,
                categories TEXT,
                age_days INTEGER,
                ai_prompts TEXT,
                description TEXT,
                name TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                priority INTEGER NOT NULL DEFAULT 0,
                destination TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS journal (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                plan TEXT NOT NULL,
                status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                name TEXT NOT NULL,
                size INTEGER NOT NULL,
                category TEXT NOT NULL, -- 'image', 'video', 'document', 'other'
                hash TEXT, -- SHA-256 for duplicate detection
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_scan DATETIME,
                embedding TEXT -- JSON string of vector
            );

            CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                auto_watch INTEGER NOT NULL DEFAULT 1,
                scan_frequency TEXT,
                last_scan INTEGER,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS folder_rules (
                folder_id TEXT NOT NULL,
                rule_id TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
                FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
                PRIMARY KEY (folder_id, rule_id)
            );

            CREATE TABLE IF NOT EXISTS global_stats (
                key TEXT PRIMARY KEY,
                value INTEGER NOT NULL DEFAULT 0,
                updated_at INTEGER NOT NULL
            );
        `)

    // Manual Migrations (Naive check)
    try {
      // Check if 'scan_frequency' column exists in 'folders'
      const hasColumn = sqlite
        .prepare('PRAGMA table_info(folders)')
        .all()
        .some((col: unknown) => (col as { name: string }).name === 'scan_frequency')
      if (!hasColumn) {
        console.log('Migrating: Adding scan_frequency and last_scan to folders')
        sqlite.exec('ALTER TABLE folders ADD COLUMN scan_frequency TEXT')
        sqlite.exec('ALTER TABLE folders ADD COLUMN last_scan INTEGER')
      }
    } catch (e) {
      console.error('Migration failed:', e)
    }

    console.log('Database initialized')
  } catch (err) {
    console.error('Failed to initialize database:', err)
  }
}
