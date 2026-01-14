import { watcherService } from '../fs/watcher'
import { notificationService } from './notifications'
import { getSettings, saveSettings } from './settings'
import { Rule } from '../../../shared/types'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Event } from '@parcel/watcher'
import log from 'electron-log'

interface DeletedFile {
  path: string
  name: string
  timestamp: number
}

// TTL for correlating a Delete + Create as a Move (in ms)
const MOVE_CORRELATION_TTL = 2000

class LearningService {
  private deletedFiles: Map<string, DeletedFile> = new Map() // Key: fileName

  constructor() {
    this.startListening()
    this.listenToUserFeedback()
  }

  private startListening(): void {
    log.info('[Learning] Service started')
    watcherService.on('batch', (events: Event[]) => {
      this.processEvents(events)
    })
  }

  private listenToUserFeedback(): void {
    notificationService.on('action', async ({ index, payload }) => {
      if (payload?.type === 'LEARNING_SUGGESTION' && index === 0) {
        // User clicked "Yes, always"
        await this.learnRule(payload.data.extension, payload.data.targetFolder)
      }
    })
  }

  private async learnRule(extension: string, targetFolder: string): Promise<void> {
    if (!extension || !targetFolder) return

    // Create new Rule
    const newRule: Rule = {
      id: uuidv4(),
      name: `Auto-Learn: ${extension.toUpperCase()}`,
      isActive: true,
      priority: 5, // Lower detected priority than manual presets
      type: 'extension',
      extensions: [extension],
      destination: targetFolder,
      description: `Learned from your move to ${path.basename(targetFolder)}`
    }

    const settings = getSettings()
    // Avoid duplicates for same extension?
    // For MVP, just append.
    const updatedRules = [...settings.rules, newRule]

    await saveSettings({ ...settings, rules: updatedRules })

    notificationService.send({
      title: 'Ghost Learner',
      body: "Règle apprise ! Je m'occupe des prochains fichiers.",
      silent: false
    })

    log.info(`[Learning] Learned new rule for .${extension} -> ${targetFolder}`)
  }

  private processEvents(events: Event[]): void {
    const now = Date.now()

    // Prune old deleted files
    for (const [key, entry] of this.deletedFiles.entries()) {
      if (now - entry.timestamp > MOVE_CORRELATION_TTL) {
        this.deletedFiles.delete(key)
      }
    }

    for (const event of events) {
      const fileName = path.basename(event.path)

      if (event.type === 'delete') {
        // Store candidate for move detection
        this.deletedFiles.set(fileName, {
          path: event.path,
          name: fileName,
          timestamp: now
        })
      } else if (event.type === 'create') {
        const deletedCandidate = this.deletedFiles.get(fileName)

        if (deletedCandidate) {
          // HIT! We found a matching deletion for this creation -> It's a MOVE.
          this.handleDetectedMove(deletedCandidate.path, event.path)

          // Clear it so we don't match it again
          this.deletedFiles.delete(fileName)
        }
      }
    }
  }

  private handleDetectedMove(oldPath: string, newPath: string): void {
    const fileName = path.basename(newPath)
    const newFolder = path.dirname(newPath)
    const extension = path.extname(newPath).toLowerCase().replace('.', '')

    log.info(`[Learning] Detected Move: ${fileName} -> ${newFolder}`)
    // Avoid re-learning existing rules?
    // Check if a rule already covers this?
    // For now, simple logic.

    // Ignore if moved to Trash or temp or if extension is empty
    if (newPath.includes('.Trash') || newPath.includes('.tmp') || !extension) return

    // Notify
    notificationService.send({
      title: '👻 Ghost Learner',
      body: `J'ai vu que tu as déplacé "${fileName}". Je range les ".${extension}" ici la prochaine fois ?`,
      silent: false,
      actions: [{ type: 'button', text: 'Oui, toujours' }],
      payload: {
        type: 'LEARNING_SUGGESTION',
        data: {
          extension,
          targetFolder: newFolder
        }
      }
    })
  }
}

export const learningService = new LearningService()
