import { join } from 'path'
import { app } from 'electron'
import Log from 'electron-log'

interface ClassificationOutput {
  label: string
  score: number
}

// Global variable to cache the module reference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Transformers: any = null

export class AIService {
  private static instance: AIService
  private classifier: ((text: string | unknown) => Promise<ClassificationOutput[]>) | null = null
  private modelName = 'Xenova/resnet-50'

  private extractor: unknown = null
  private embeddingModelName = 'Xenova/all-MiniLM-L6-v2'

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Dynamically loads the transformers module and configures the environment.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadTransformers(): Promise<any> {
    if (Transformers) return Transformers

    try {
      // Dynamic import
      Transformers = await import('@xenova/transformers')
      const { env } = Transformers

      if (app) {
        env.localModelPath = join(app.getPath('userData'), 'ai-models')
        // Allow remote models for first download, then rely on cache
        env.allowRemoteModels = true
        env.allowLocalModels = true
      }
      return Transformers
    } catch (error) {
      Log.error('[AIService] Failed to load transformers module:', error)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async initialize(onProgress?: (data: any) => void): Promise<void> {
    if (this.classifier) return
    console.log(`[AIService] Loading model ${this.modelName}...`)
    try {
      const { pipeline } = await this.loadTransformers()

      this.classifier = (await pipeline('image-classification', this.modelName, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (data: any) => {
          if (onProgress) onProgress(data)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any
      console.log('[AIService] Model loaded successfully')
    } catch (error) {
      console.error('[AIService] Failed to load model:', error)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async suggestTags(filePath: string, onProgress?: (data: any) => void): Promise<string[]> {
    try {
      if (!this.classifier) {
        await this.initialize(onProgress)
      }

      const output = await this.classifier!(filePath)

      if (!output || !Array.isArray(output)) return []

      const tags = output
        .filter((item: ClassificationOutput) => item.score > 0.5)
        .map((item: ClassificationOutput) => item.label.split(',')[0].trim())

      console.log(`[AIService] Suggested tags for ${filePath}:`, tags)
      return tags
    } catch (error) {
      console.error('[AIService] Error suggesting tags:', error)
      return []
    }
  }

  async initializeExtractor(
    onProgress?: (data: {
      status: string
      name: string
      file: string
      progress: number
      loaded: number
      total: number
    }) => void
  ): Promise<void> {
    if (this.extractor) return
    console.log(`[AIService] Loading embedding model ${this.embeddingModelName}...`)
    try {
      const { pipeline } = await this.loadTransformers()

      this.extractor = await pipeline('feature-extraction', this.embeddingModelName, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (data: any) => {
          if (onProgress) onProgress(data)
        }
      })
      console.log('[AIService] Embedding model loaded successfully')
    } catch (error) {
      console.error('[AIService] Failed to load embedding model:', error)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateEmbedding(input: string, onProgress?: (data: any) => void): Promise<number[]> {
    try {
      if (!this.extractor) {
        await this.initializeExtractor(onProgress)
      }

      // feature-extraction pipeline result is a Tensor or Object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = await (this.extractor as any)(input, { pooling: 'mean', normalize: true })
      return Array.from(output.data)
    } catch (error) {
      Log.error('Embedding error:', error)
      return []
    }
  }
}

export const aiService = AIService.getInstance()
