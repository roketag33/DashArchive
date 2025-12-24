import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type FinderLabel =
  | 'none'
  | 'Red'
  | 'Orange'
  | 'Yellow'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Gray'

const LABEL_MAP: Record<FinderLabel, number> = {
  none: 0,
  Orange: 1,
  Red: 2,
  Yellow: 3,
  Blue: 4,
  Purple: 5,
  Green: 6,
  Gray: 7
}

export class TaggerService {
  async setLabel(filePath: string, color: FinderLabel | string): Promise<void> {
    if (process.platform !== 'darwin') return

    // Normalize color
    const labelIndex = LABEL_MAP[color as FinderLabel] || 0

    if (color === 'none' || labelIndex === 0) {
      return
    }

    try {
      // Escape path for AppleScript (simple quote wrapping might fail on some chars, but usually ok)
      // Better: use JSON.stringify to escape quotes
      // But AppleScript needs POSIX file "..."

      // Sanitization: minimal simple escaping
      const safePath = filePath.replace(/"/g, '\\"')

      const script = `tell application "Finder" to set label index of (POSIX file "${safePath}") to ${labelIndex}`

      await execAsync(`osascript -e '${script}'`)
    } catch (e) {
      console.error(`Failed to set label for ${filePath}:`, e)
      // Don't throw, labeling is non-critical
    }
  }
}

export const taggerService = new TaggerService()
