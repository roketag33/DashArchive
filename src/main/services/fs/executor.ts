import { Plan, ExecutionResult } from '../../../shared/types'
import * as fs from 'fs/promises'
import * as path from 'path'

export async function executePlan(plan: Plan): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  }

  for (const item of plan.items) {
    if (item.status !== 'ok') continue

    try {
      const destDir = path.dirname(item.destinationPath)
      await fs.mkdir(destDir, { recursive: true })

      // Check for conflict
      let finalDest = item.destinationPath
      try {
        await fs.access(item.destinationPath)
        // File exists, handle conflict
        const { getSettings } = await import('../core/settings')
        const strategy = getSettings().conflictResolution || 'rename' // Fallback

        if (strategy === 'skip') {
          // result.processed is NOT incremented
          continue
        } else if (strategy === 'overwrite') {
          // Fall through to rename (overwrite)
        } else if (strategy === 'rename') {
          finalDest = await getUniquePath(item.destinationPath)
        }
      } catch {
        // File does not exist, proceed
      }

      await moveFile(item.file.path, finalDest)

      // Apply Label if present
      if (item.labelColor) {
        const { taggerService } = await import('./tagger')
        await taggerService.setLabel(finalDest, item.labelColor)
      }

      result.processed++
    } catch (error: unknown) {
      result.failed++
      result.errors.push({
        file: item.file.path,
        error: (error as Error).message || String(error)
      })
      result.success = false
    }
  }

  return result
}

export async function undoPlan(plan: Plan): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  }

  // Reverse iterate to undo last moves first
  const reversedItems = [...plan.items].reverse()

  for (const item of reversedItems) {
    if (item.status !== 'ok') continue

    try {
      // Source is now the destination, and Destination is the source
      const originalPath = item.file.path
      let currentPath = item.destinationPath

      // RECOVERY LOGIC: Check if path is relative and file is missing at absolute logic
      // If path is relative (e.g "Documents/Admin/file.pdf"), fs functions usually take it relative to CWD.
      // But if it failed, maybe we need to be explicit or check CWD.
      // Actually, let's verify if the file exists at currentPath.
      let exists = false
      try {
        await fs.access(currentPath)
        exists = true
      } catch {
        // If not found, try resolving relative to CWD explicitly if path is relative
        if (!path.isAbsolute(currentPath)) {
          const cwdPath = path.resolve(process.cwd(), currentPath)
          try {
            await fs.access(cwdPath)
            currentPath = cwdPath
            exists = true
          } catch {
            // Still not found
          }
        }
      }

      if (!exists) {
        // Fail early for this item but continue others? Or count as failed.
        throw new Error(`File not found at ${item.destinationPath} (or CWD resolved)`)
      }

      // Ensure original directory exists (it should, but just in case)
      await fs.mkdir(path.dirname(originalPath), { recursive: true })

      // Move back
      await moveFile(currentPath, originalPath)

      result.processed++

      // Optional: Clean up empty directories if they were created?
      // Logic for that is complex, skipping for MVP.
    } catch (error: unknown) {
      result.failed++
      result.errors.push({
        file: item.destinationPath,
        error: (error as Error).message || String(error)
      })
      console.error(`Undo failed for ${item.destinationPath}:`, error)
      result.success = false
    }
  }

  return result
}

// Helper to generate unique path: file.txt -> file (1).txt
async function getUniquePath(filePath: string): Promise<string> {
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const base = path.basename(filePath, ext)

  let counter = 1
  let newPath = filePath

  while (true) {
    try {
      await fs.access(newPath)
      newPath = path.join(dir, `${base} (${counter})${ext}`)
      counter++
    } catch {
      return newPath
    }
  }
}

async function moveFile(src: string, dest: string): Promise<void> {
  try {
    await fs.rename(src, dest)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'EXDEV') {
      // Cross-device move: Copy and Unlink
      await fs.copyFile(src, dest)
      await fs.unlink(src)
    } else {
      throw error
    }
  }
}
