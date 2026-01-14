import { scanDirectory } from '../fs/scanner'
import { UniversalScanResult } from '../../../shared/types'
import { UNIVERSAL_RULES, isUniversalRuleMatch } from './universal-rules'

export async function runUniversalScan(directories: string[]): Promise<UniversalScanResult> {
  const result: UniversalScanResult = {
    stats: {},
    moves: [],
    totalDetected: 0
  }

  // Initialize stats with 0
  UNIVERSAL_RULES.forEach((rule) => {
    result.stats[rule.id] = 0
  })

  // Scan all directories (sequentially for now to avoid disk thrashing)
  for (const dir of directories) {
    try {
      // Note: scanDirectory is recursive.
      // In a real production V2, we might want to limit depth or exclude node_modules here.
      // For the prototype, we assume scanDirectory handles basic excludes (it ignores dotfiles).
      const files = await scanDirectory(dir)

      for (const file of files) {
        if (file.isDirectory) continue

        // Check for Universal Rule Match
        const rule = isUniversalRuleMatch(file.extension ? '.' + file.extension : '')

        if (rule) {
          result.stats[rule.id]++
          result.totalDetected++

          result.moves.push({
            file: file,
            ruleId: rule.id,
            targetFolder: rule.targetFolder,
            label: rule.label
          })
        }
      }
    } catch (error) {
      console.error(`Universal Scan failed for directory: ${dir}`, error)
    }
  }

  return result
}
