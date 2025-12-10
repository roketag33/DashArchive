import { Plan, FileEntry, Rule, PlanItem } from '../../../shared/types'
import { matchRule, resolveDestination } from './engine'
import { getNextAvailableName } from './conflict'
import * as path from 'path'

export async function buildPlan(
  files: FileEntry[],
  rules: Rule[],
  contentFetcher?: (path: string) => Promise<string>,
  classifier?: (text: string, labels: string[]) => Promise<string | null>
): Promise<Plan> {
  // Sort rules by priority desc
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  const items: PlanItem[] = []
  const existingDestinations = new Set<string>()

  for (const file of files) {
    // Find first matching rule
    let matchedRule: Rule | undefined

    for (const rule of sortedRules) {
      const isMatch = await matchRule(file, rule, contentFetcher, classifier)
      if (isMatch) {
        matchedRule = rule
        break
      }
    }

    if (matchedRule) {
      const initialDest = resolveDestination(file, matchedRule)

      // Ensure absolute path
      let absoluteDest = initialDest
      if (!path.isAbsolute(initialDest)) {
        absoluteDest = path.join(path.dirname(file.path), initialDest)
      }

      // Handle conflicts
      const finalDest = getNextAvailableName(absoluteDest, existingDestinations)

      existingDestinations.add(finalDest)

      items.push({
        id: Math.random().toString(36).substring(2, 15),
        file,
        ruleId: matchedRule.id,
        destinationPath: finalDest,
        status: 'ok'
      })
    }
  }

  return {
    items,
    totalFiles: files.length,
    timestamp: new Date()
  }
}
