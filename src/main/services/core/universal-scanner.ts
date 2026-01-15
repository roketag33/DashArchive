import { scanDirectory } from '../fs/scanner'
import { UniversalScanResult, Rule } from '../../../shared/types'
import { getSettings } from './settings'
import { aiService } from '../ai/index'

export async function runUniversalScan(directories: string[]): Promise<UniversalScanResult> {
  const result: UniversalScanResult = {
    stats: {},
    moves: [],
    totalDetected: 0
  }

  // Fetch active rules from DB/Settings
  const allRules = getSettings().rules || []
  const activeRules = allRules.filter((r) => r.isActive)

  // Initialize stats for active rules
  activeRules.forEach((rule) => {
    result.stats[rule.id] = 0
  })

  // Helper to find matching rule
  const findMatchingRule = (extension: string): Rule | undefined => {
    const ext = extension.toLowerCase().replace(/^\./, '') // 'pdf'
    // Sort by priority (higher first)
    const sorted = activeRules.sort((a, b) => b.priority - a.priority)

    // 1. Specific Match
    const match = sorted.find((rule) => {
      // Support 'extension' AND 'ai' rules (if they specify extensions or wildcard)
      if ((rule.type === 'extension' || rule.type === 'ai') && rule.extensions) {
        const exts = rule.extensions.map((e) => e.toLowerCase())
        return exts.includes(ext) || exts.includes('*')
      }
      return false
    })
    if (match) return match

    // 2. Fallback
    return sorted.find((rule) => rule.type === 'fallback')
  }

  // Scan all directories
  for (const dir of directories) {
    try {
      const files = await scanDirectory(dir)

      for (const file of files) {
        if (file.isDirectory) continue

        const rule = findMatchingRule(file.extension)

        if (rule) {
          // Initialize stat if not present (safety)
          if (!result.stats[rule.id]) result.stats[rule.id] = 0

          result.stats[rule.id]++
          result.totalDetected++

          let resolvedCategory = rule.type === 'ai' ? 'Unsorted' : rule.name || 'Auto-Organized'

          // AI Classification
          if (rule.type === 'ai' && rule.aiPrompts && rule.aiPrompts.length > 0) {
            const aiLabel = await aiService.classifyFileName(file.name, rule.aiPrompts)
            if (aiLabel) resolvedCategory = aiLabel
          }

          // Resolve dynamic destination placeholders
          // Supported: {year}, {ext}, {month}, {category}
          let target = rule.destination
          const now = new Date()
          if (target.includes('{year}')) {
            target = target.replace('{year}', now.getFullYear().toString())
          }
          if (target.includes('{ext}')) {
            target = target.replace('{ext}', file.extension)
          }
          if (target.includes('{category}') || target.includes('{{category}}')) {
            target = target.replace(/\{?\{category\}?\}?/, resolvedCategory)
          }

          result.moves.push({
            file: file,
            ruleId: rule.id,
            targetFolder: target,
            label: resolvedCategory
          })
        }
      }
    } catch (error) {
      console.error(`Universal Scan failed for directory: ${dir}`, error)
    }
  }

  return result
}
