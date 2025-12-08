export function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop() || '' : ''
}

export function getBasename(filename: string): string {
  const parts = filename.split('.')
  if (parts.length > 1) {
    parts.pop()
    return parts.join('.')
  }
  return filename // No extension
}

export function getNextAvailableName(filename: string, existingNames: Set<string>): string {
  if (!existingNames.has(filename)) {
    return filename
  }

  const ext = getExtension(filename)
  const basename = getBasename(filename)

  let counter = 1
  let candidate = filename

  while (existingNames.has(candidate)) {
    if (ext) {
      candidate = `${basename} (${counter}).${ext}`
    } else {
      candidate = `${basename} (${counter})`
    }
    counter++
  }

  return candidate
}
