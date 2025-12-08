import { Rule, FileEntry } from './types'

export async function matchRule(
  file: FileEntry,
  rule: Rule,
  contentFetcher?: (path: string) => Promise<string>,
  classifier?: (text: string, labels: string[]) => Promise<string | null>
): Promise<boolean> {
  if (!rule.isActive) return false

  switch (rule.type) {
    case 'extension':
      return rule.extensions?.includes(file.extension) ?? false
    case 'name':
      if (!rule.namePattern) return false
      try {
        return new RegExp(rule.namePattern).test(file.name)
      } catch (e) {
        console.error(`Invalid regex for rule ${rule.id}: ${rule.namePattern}`, e)
        return false
      }
    case 'size':
      if (rule.sizeMin && file.size < rule.sizeMin) return false
      if (rule.sizeMax && file.size > rule.sizeMax) return false
      return true
    case 'category':
      return rule.categories ? rule.categories.includes(file.category) : false
    case 'date':
      if (rule.ageDays && file.modifiedAt) {
        const cutoff = Date.now() - rule.ageDays * 24 * 60 * 60 * 1000
        return file.modifiedAt.getTime() < cutoff
      }
      return false
    case 'ai': {
      if (!contentFetcher || !classifier) return false
      if (!rule.aiPrompts || rule.aiPrompts.length === 0) return false

      try {
        // Optimized: We should probably cache content if multiple rules need it?
        // For MVP, we fetch every time or rely on OS cache.
        const text = await contentFetcher(file.path)
        if (!text || text.length < 10) return false // Too short

        // If the classifier returns one of our prompts, it's a match?
        // Usually ZeroShot returns the best label.
        // We assume if the top label is in our list (which it is by definition of the API),
        // we might want to check confidence?
        // For simplicity: If the classifier returns a label, does it mean it MATCHES this rule?
        // The rule asks: "Is this file X or Y?".
        // If we have multiple AI rules, it's tricky.
        // Rule A: [Invoice]
        // Rule B: [Resume]
        // If we run Rule A, we ask classify(text, ['Invoice', 'Other']). If 'Invoice', match.
        // If we just pass ['Invoice'], it will always say Invoice (100%).
        // SO: We must always compare against a "Negative" or "Other" class?
        // OR: We rely on the user providing a list of categories in the rule?
        // Implementation decision: The rule defines "Categories to catch".
        // We should classify against [ ...rule.aiPrompts, "Other" ].
        // If result is NOT "Other", it's a match.
        // ALSO: we want to capture the matched label to use in destination?
        // For now, simple boolean match.

        const labels = [...rule.aiPrompts, 'Other'] // Heuristic: Add 'Other' to allow rejection
        const bestLabel = await classifier(text, labels)

        if (bestLabel && bestLabel !== 'Other' && rule.aiPrompts.includes(bestLabel)) {
          // Store the label on the file entry for destination resolution?
          // Dirty hack: modify file entry temporarily or use a WeakMap?
          // Since FileEntry is passed by ref, we can add a transient property if we extended the type.
          // Let's attach it to 'file' for now as 'aiEvaluation' if added to type, or just return true.
          // If we want {ai_label} in destination, we need it.
          // Let's return true for now.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(file as any).aiLabel = bestLabel // Temporary hack for resolution
          return true
        }
        return false
      } catch (e) {
        console.error('AI match failed', e)
        return false
      }
    }
    case 'fallback':
      return true
    default:
      return false
  }
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
  // We check rule.destination (the original pattern) for {name}.
  if (!rule.destination.includes('{name}')) {
    // Use forward slash for consistency in logic, can be normalized later for OS
    dest = dest.endsWith('/') ? dest + file.name : dest + '/' + file.name
  }

  return dest
}
