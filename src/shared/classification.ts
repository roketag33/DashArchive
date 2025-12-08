import { FileCategory } from './types'
import { EXTENSION_CATEGORY_MAP } from './constants'

export function classifyFile(filename: string): FileCategory {
  const parts = filename.split('.')
  if (parts.length < 2) {
    return 'other'
  }
  const extension = parts.pop()?.toLowerCase()

  if (!extension) {
    return 'other'
  }

  return EXTENSION_CATEGORY_MAP[extension] || 'other'
}
