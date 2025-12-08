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
