import { pipeline, env } from '@xenova/transformers'
import { join } from 'path'
import { app } from 'electron'

// Configure cache for Electron (avoid redownloading)
// We set it to userData/ai-models
if (app) {
  env.localModelPath = join(app.getPath('userData'), 'ai-models')
  // We allow remote models so it can download them once
  env.allowRemoteModels = true
  env.allowLocalModels = true
}

interface ClassificationOutput {
  label: string
  score: number
}

export class AIService {
  private static instance: AIService
  // Define a looser type or specific one for the pipeline function
  private classifier: ((text: string | unknown) => Promise<ClassificationOutput[]>) | null = null
  private modelName = 'Xenova/resnet-50'

  constructor() {
    // Singleton pattern if needed, but for now just public
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async initialize(): Promise<void> {
    if (this.classifier) return
    console.log(`[AIService] Loading model ${this.modelName}...`)
    try {
      this.classifier = await pipeline('image-classification', this.modelName)
      console.log('[AIService] Model loaded successfully')
    } catch (error) {
      console.error('[AIService] Failed to load model:', error)
      throw error
    }
  }

  async suggestTags(filePath: string): Promise<string[]> {
    try {
      if (!this.classifier) {
        await this.initialize()
      }

      // Important: Transformers.js in Electron typically takes a file path string
      // or a URL. For local files, strict file:// protocol is usually safest
      // or just absolute path if supported by the specific version's sharp/image loader.
      // We will try passing the raw path first.

      const output = await this.classifier(filePath)
      // output is [{ label: 'tabby, tabby cat', score: 0.99 }, ...]

      if (!output || !Array.isArray(output)) return []

      // Filter and map
      const tags = output
        .filter((item: ClassificationOutput) => item.score > 0.5) // 50% confidence threshold
        .map((item: ClassificationOutput) => item.label.split(',')[0].trim()) // Take first synonym

      console.log(`[AIService] Suggested tags for ${filePath}:`, tags)
      return tags
    } catch (error) {
      console.error('[AIService] Error suggesting tags:', error)
      return []
    }
  }
}

export const aiService = AIService.getInstance()
