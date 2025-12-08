import { Rule, FileEntry } from './types'

export function matchRule(file: FileEntry, rule: Rule): boolean {
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
