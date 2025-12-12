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

const sqlite = new Database(dbPath)
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
        `)
    console.log('Database initialized')
  } catch (err) {
    console.error('Failed to initialize database:', err)
  }
}
