import { readdir } from 'fs/promises'
import { join, extname } from 'path'
import Log from 'electron-log'

export interface FolderProfile {
  path: string
  fileCount: number
  extensions: Record<string, number>
  samples: string[] // Paths to sample files
  subfolders: string[]
}

export class LearningService {
  private static instance: LearningService

  // Singleton\n  private constructor() {\n    // Empty\n  }

  static getInstance(): LearningService {
    if (!LearningService.instance) {
      LearningService.instance = new LearningService()
    }
    return LearningService.instance
  }

  /**
   * Scans a reference folder to understand its structure.
   * Collects file statistics and samples for AI analysis.
   */
  async analyzeFolderStructure(folderPath: string, maxSamples = 5): Promise<FolderProfile> {
    const profile: FolderProfile = {
      path: folderPath,
      fileCount: 0,
      extensions: {},
      samples: [],
      subfolders: []
    }

    try {
      const entries = await readdir(folderPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(folderPath, entry.name)

        if (entry.isDirectory()) {
          // Identify potential sub-strategies (years, categories)
          profile.subfolders.push(entry.name)
        } else if (entry.isFile()) {
          // Ignore hidden files
          if (entry.name.startsWith('.')) continue

          profile.fileCount++
          const ext = extname(entry.name).toLowerCase().replace('.', '') || 'none'
          profile.extensions[ext] = (profile.extensions[ext] || 0) + 1

          // Keep random samples for content analysis
          if (profile.samples.length < maxSamples) {
            profile.samples.push(fullPath)
          }
        }
      }

      Log.info(
        `[Learning] Analyzed ${folderPath}: ${profile.fileCount} files, ${profile.subfolders.length} subfolders`
      )
      return profile
    } catch (error) {
      Log.error(`[Learning] Failed to analyze folder ${folderPath}:`, error)
      throw error
    }
  }

  /**
   * Recursive scan (limited depth) to build a map of the user's hierarchy.
   */
  async scanHierarchy(rootPath: string, depth = 2): Promise<FolderProfile[]> {
    if (depth < 0) return []

    const results: FolderProfile[] = []
    const rootProfile = await this.analyzeFolderStructure(rootPath)
    results.push(rootProfile)

    for (const sub of rootProfile.subfolders) {
      const subPath = join(rootPath, sub)
      // Recurse
      const subResults = await this.scanHierarchy(subPath, depth - 1)
      results.push(...subResults)
    }

    return results
  }
}

export const learningService = LearningService.getInstance()
