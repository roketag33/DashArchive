import fs from 'fs'
import path from 'path'
import { getSettings } from '../core/settings'
import { Rule } from '../../../shared/types'

export class StressTestService {
  async runLegacyScan(inputDir: string, outputCsv: string): Promise<void> {
    const headers = 'File,Extension,DetectedRule,TargetFolder,Status\n'
    fs.writeFileSync(outputCsv, headers)

    // Fetch active rules dynamicallly
    const allRules = getSettings().rules || []
    const activeRules = allRules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority)

    const findMatchingRule = (extension: string): Rule | undefined => {
      const ext = extension.toLowerCase().replace(/^\./, '')
      const sorted = activeRules // already sorted

      // 1. Specific Match
      const match = sorted.find((rule) => {
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

    const files = fs.readdirSync(inputDir)
    let processed = 0

    for (const file of files) {
      if (file.startsWith('.')) continue // Skip hidden

      const fullPath = path.join(inputDir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) continue

      const ext = path.extname(file).toLowerCase()
      // Use User Settings Logic
      const rule = findMatchingRule(ext)

      let line = `"${file}","${ext}",`
      if (rule) {
        // Resolve dynamic destination placeholders
        let target = rule.destination
        const now = new Date()
        if (target.includes('{year}')) {
          target = target.replace('{year}', now.getFullYear().toString())
        }
        if (target.includes('{ext}')) {
          target = target.replace('{ext}', ext.replace('.', ''))
        }
        line += `"${rule.id}","${target}","MATCHED"`
      } else {
        line += `,"","IGNORED"`
      }
      line += '\n'

      fs.appendFileSync(outputCsv, line)
      processed++
    }

    console.log(`Stress Test Complete. Scanned ${processed} files. Report at ${outputCsv}`)
  }
}

export const stressTestService = new StressTestService()
