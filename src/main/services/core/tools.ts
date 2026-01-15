import { app } from 'electron'
import { join } from 'path'
import * as path from 'path'
import { rename, readdir, mkdir, stat } from 'fs/promises'
import Log from 'electron-log'

export interface ToolDefinition {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>
}

export class ToolsService {
  private static instance: ToolsService

  // Singleton
  private constructor() {
    // Empty
  }

  static getInstance(): ToolsService {
    if (!ToolsService.instance) {
      ToolsService.instance = new ToolsService()
    }
    return ToolsService.instance
  }

  getDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'organize_folder',
        description: 'Organize a folder by Date (Year/Month) or Type',
        parameters: {
          path: 'string (absolute path)',
          strategy: 'string (date | type | name)'
        }
      },
      {
        name: 'merge_folders',
        description: 'Merge multiple source folders into a destination folder',
        parameters: {
          sources: 'string[] (array of paths)',
          destination: 'string (target path)'
        }
      }
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeTool(name: string, args: any): Promise<any> {
    Log.info(`[Tools] Executing ${name} with args:`, args)

    switch (name) {
      case 'organize_folder':
        return this.organizeFolder(args.path, args.strategy)
      case 'merge_folders':
        return this.mergeFolders(args.sources, args.destination)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  // --- Implementations ---

  private async resolvePath(inputPath: string): Promise<string> {
    if (path.isAbsolute(inputPath)) return inputPath

    // Normalization: clean trailing slashes
    const cleanInput = inputPath.replace(/\/$/, '')
    const segments = cleanInput.split(path.sep)
    const firstSegment = segments[0].toLowerCase()

    // 1. Semantic Aliases (French/English)
    let basePath = ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aliases: Record<string, any> = {
      images: 'pictures',
      photos: 'pictures',
      pictures: 'pictures',
      documents: 'documents',
      docs: 'documents',
      bureau: 'desktop',
      desktop: 'desktop',
      telechargements: 'downloads',
      téléchargements: 'downloads',
      downloads: 'downloads',
      musique: 'music',
      music: 'music',
      videos: 'videos',
      vidéos: 'videos'
    }

    if (aliases[firstSegment]) {
      try {
        basePath = app.getPath(aliases[firstSegment])
        // Reconstruct path: basePath + remaining segments
        if (segments.length > 1) {
          return join(basePath, ...segments.slice(1))
        }
        return basePath
      } catch {
        /* ignore if system path not found */
      }
    }

    // 2. Fallback Candidates
    const candidates = [
      join(app.getPath('home'), inputPath),
      join(app.getPath('documents'), inputPath),
      join(app.getPath('downloads'), inputPath),
      join(app.getPath('desktop'), inputPath),
      join(app.getPath('pictures'), inputPath) // Added Pictures
    ]

    for (const candidate of candidates) {
      try {
        await stat(candidate)
        return candidate // Found it!
      } catch {
        // Continue searching
      }
    }

    // Default to Home if not found
    return join(app.getPath('home'), inputPath)
  }

  private async organizeFolder(
    rawPath: string,
    strategy: 'date' | 'type' | 'name'
  ): Promise<string> {
    const folderPath = await this.resolvePath(rawPath)
    try {
      // Verify existence first to give clear error
      try {
        await stat(folderPath)
      } catch {
        throw new Error(`Le dossier n'existe pas : ${folderPath}`)
      }

      const entries = await readdir(folderPath, { withFileTypes: true })
      let movedCount = 0

      for (const entry of entries) {
        if (entry.isDirectory() || entry.name.startsWith('.')) continue

        const filePath = join(folderPath, entry.name)
        let subfolderName = 'Misc'

        if (strategy === 'date') {
          const stats = await stat(filePath)
          subfolderName = stats.mtime.getFullYear().toString()
        } else if (strategy === 'type') {
          const ext = entry.name.split('.').pop()?.toLowerCase() || 'unknown'
          subfolderName = ext
        }

        const targetDir = join(folderPath, subfolderName)
        await mkdir(targetDir, { recursive: true })

        const targetPath = join(targetDir, entry.name)
        // Rename = Move
        await rename(filePath, targetPath)
        movedCount++
      }

      return `Successfully organized ${movedCount} files in ${folderPath} by ${strategy}.`
    } catch (error) {
      Log.error('Tool execution failed:', error)
      throw new Error(`Failed to organize folder: ${error}`)
    }
  }

  private async mergeFolders(sources: string[], destination: string): Promise<string> {
    try {
      await mkdir(destination, { recursive: true })
      let splitCount = 0

      for (const source of sources) {
        const entries = await readdir(source, { withFileTypes: true })
        for (const entry of entries) {
          const sourcePath = join(source, entry.name)
          const destPath = join(destination, entry.name)

          // Prevent self-merge conflict risk (simple check)
          if (sourcePath === destPath) continue

          // Check collision
          // For now, simple rename (move)
          // In production, we should handle name collision (e.g. append _copy)
          await rename(sourcePath, destPath)
          splitCount++
        }
        // Optional: Remove Empty Source Folder?
        // await rmdir(source) // Let's keep it safe for now and not delete source dirs
      }
      return `Merged ${splitCount} files from ${sources.length} folders into ${destination}.`
    } catch (error) {
      Log.error('Merge execution failed:', error)
      throw new Error(`Failed to merge folders: ${error}`)
    }
  }
}

export const toolsService = ToolsService.getInstance()
