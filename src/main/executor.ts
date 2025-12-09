import { Plan, ExecutionResult } from '../shared/types'
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

    result.processed++
    try {
      const destDir = path.dirname(item.destinationPath)
      await fs.mkdir(destDir, { recursive: true })
      await fs.rename(item.file.path, item.destinationPath)
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

    result.processed++
    try {
      // Source is now the destination, and Destination is the source
      const originalPath = item.file.path
      const currentPath = item.destinationPath

      // Ensure original directory exists (it should, but just in case)
      await fs.mkdir(path.dirname(originalPath), { recursive: true })

      // Move back
      await fs.rename(currentPath, originalPath)

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
