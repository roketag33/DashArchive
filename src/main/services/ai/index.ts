/* eslint-disable @typescript-eslint/no-explicit-any */
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

  private extractor: unknown = null
  private embeddingModelName = 'Xenova/clip-vit-base-patch32'

  constructor() {
    // Singleton pattern if needed, but for now just public
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async initialize(onProgress?: (data: any) => void): Promise<void> {
    if (this.classifier) return
    console.log(`[AIService] Loading model ${this.modelName}...`)
    try {
      this.classifier = (await pipeline('image-classification', this.modelName, {
        progress_callback: (data: any) => {
          if (onProgress) onProgress(data)
        }
      })) as any
      console.log('[AIService] Model loaded successfully')
    } catch (error) {
      console.error('[AIService] Failed to load model:', error)
      throw error
    }
  }

  async suggestTags(filePath: string, onProgress?: (data: any) => void): Promise<string[]> {
    try {
      if (!this.classifier) {
        await this.initialize(onProgress)
      }

      // Important: Transformers.js in Electron typically takes a file path string
      // or a URL. For local files, strict file:// protocol is usually safest
      // or just absolute path if supported by the specific version's sharp/image loader.
      // We will try passing the raw path first.

      const output = await this.classifier!(filePath)
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
      this.extractor = await pipeline('feature-extraction', this.embeddingModelName, {
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

  async generateEmbedding(input: string, onProgress?: (data: any) => void): Promise<number[]> {
    try {
      if (!this.extractor) {
        await this.initializeExtractor(onProgress)
      }

      // CLIP accepts text or image path
      const output = await (this.extractor as any)(input, { pooling: 'mean', normalize: true })
      // Output is a Tensor, we need to convert to array
      // output.data is Float32Array
      return Array.from(output.data)
    } catch (error) {
      console.error('[AIService] Error generating embedding:', error)
      return []
    }
  }
}

export const aiService = AIService.getInstance()
