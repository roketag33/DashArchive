import { Plan, FileEntry, Rule, PlanItem } from './types'
import { matchRule, resolveDestination } from './engine'
import { getNextAvailableName } from './conflict'

export function buildPlan(files: FileEntry[], rules: Rule[]): Plan {
  // Sort rules by priority desc
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  const items: PlanItem[] = []
  const existingDestinations = new Set<string>()

  for (const file of files) {
    // Find first matching rule
    const matchedRule = sortedRules.find((rule) => matchRule(file, rule))

    if (matchedRule) {
      const initialDest = resolveDestination(file, matchedRule)
      // Handle conflicts
      const finalDest = getNextAvailableName(initialDest, existingDestinations)

      existingDestinations.add(finalDest)

      items.push({
        id: Math.random().toString(36).substring(2, 15), // Simple ID for now to avoid crypto issues in test env without setup
        file,
        ruleId: matchedRule.id,
        destinationPath: finalDest,
        status: 'ok' // Conflict resolved via renaming is 'ok' for execution
      })
    }
  }

  return {
    items,
    totalFiles: files.length,
    timestamp: new Date()
  }
}
