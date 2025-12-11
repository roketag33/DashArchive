import { Rule, FileEntry, RuleType } from '../../../shared/types'

// Strategy Interface
interface RuleMatcher {
  match(
    file: FileEntry,
    rule: Rule,
    contentFetcher?: (path: string) => Promise<string>,
    classifier?: (text: string, labels: string[]) => Promise<string | null>
  ): Promise<boolean>
}

// Strategy Implementations
const strategies: Record<RuleType, RuleMatcher> = {
  extension: {
    async match(file, rule) {
      return rule.extensions?.includes(file.extension) ?? false
    }
  },
  name: {
    async match(file, rule) {
      if (!rule.namePattern) return false
      try {
        return new RegExp(rule.namePattern).test(file.name)
      } catch (e) {
        console.error(`Invalid regex for rule ${rule.id}: ${rule.namePattern}`, e)
        return false
      }
    }
  },
  size: {
    async match(file, rule) {
      if (rule.sizeMin && file.size < rule.sizeMin) return false
      if (rule.sizeMax && file.size > rule.sizeMax) return false
      return true
    }
  },
  category: {
    async match(file, rule) {
      return rule.categories ? rule.categories.includes(file.category) : false
    }
  },
  date: {
    async match(file, rule) {
      if (rule.ageDays && file.modifiedAt) {
        const cutoff = Date.now() - rule.ageDays * 24 * 60 * 60 * 1000
        return file.modifiedAt.getTime() < cutoff
      }
      return false
    }
  },
  ai: {
    async match(file, rule, contentFetcher, classifier) {
      if (!contentFetcher || !classifier) return false
      if (!rule.aiPrompts || rule.aiPrompts.length === 0) return false

      try {
        const text = await contentFetcher(file.path)
        if (!text || text.length < 10) return false // Too short

        const labels = [...rule.aiPrompts, 'Other']
        const bestLabel = await classifier(text, labels)

        if (bestLabel && bestLabel !== 'Other' && rule.aiPrompts.includes(bestLabel)) {
          file.aiLabel = bestLabel // Clean assignment now that type is updated
          return true
        }
        return false
      } catch (e) {
        console.error('AI match failed', e)
        return false
      }
    }
  },
  fallback: {
    async match() {
      return true
    }
  }
}

export async function matchRule(
  file: FileEntry,
  rule: Rule,
  contentFetcher?: (path: string) => Promise<string>,
  classifier?: (text: string, labels: string[]) => Promise<string | null>
): Promise<boolean> {
  if (!rule.isActive) return false

  const strategy = strategies[rule.type]
  if (!strategy) {
    console.warn(`No strategy found for rule type: ${rule.type}`)
    return false
  }

  return strategy.match(file, rule, contentFetcher, classifier)
}

export function resolveDestination(file: FileEntry, rule: Rule): string {
  let dest = rule.destination

  // {ext}
  dest = dest.replace(/{ext}/g, file.extension.toLowerCase())

  // {name}
  const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'))
  dest = dest.replace(/{name}/g, nameWithoutExt || file.name)

  // {category}
  dest = dest.replace(/{category}/g, file.category)

  // {year}, {month}, {day}
  const date = file.modifiedAt || new Date()
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  dest = dest.replace(/{year}/g, year)
  dest = dest.replace(/{month}/g, month)
  dest = dest.replace(/{day}/g, day)

  // If the pattern didn't use {name}, we assume the user meant a directory
  // and we should append the original filename.
  if (!rule.destination.includes('{name}')) {
    dest = dest.endsWith('/') ? dest + file.name : dest + '/' + file.name
  }

  return dest
}
