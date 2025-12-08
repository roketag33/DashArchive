import { FileEntry } from '../shared/types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { classifyFile } from '../shared/classification'

export async function scanDirectory(dirPath: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  try {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true })

    for (const dirent of dirents) {
      // Ignore hidden files/dirs (starting with dot)
      if (dirent.name.startsWith('.')) {
        continue
      }

      const fullPath = path.join(dirPath, dirent.name)

      if (dirent.isDirectory()) {
        const subEntries = await scanDirectory(fullPath)
        entries.push(...subEntries)
      } else if (dirent.isFile()) {
        try {
          const stats = await fs.stat(fullPath)
          const category = classifyFile(dirent.name)

          entries.push({
            path: fullPath,
            name: dirent.name,
            extension: path.extname(dirent.name).slice(1).toLowerCase(), // remove dot
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            category: category
          })
        } catch (err) {
          console.error(`Failed to stat file: ${fullPath}`, err)
          // Skip files we can't read
        }
      }
    }
  } catch (err) {
    console.error(`Failed to scan directory: ${dirPath}`, err)
    // Throw or return empty?
    // For UI feedback, probably throw is better, but recursive calls shouldn't kill entire scan.
    // Let's rethrow for the root, but maybe handle subdirs gracefully?
    // Simple recursion: let it bubble up for now.
    throw err
  }

  return entries
}
