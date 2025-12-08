import { pipeline } from '@xenova/transformers'

class AIService {
  private static instance: AIService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private classifier: any = null
  private modelName = 'Xenova/mobilebert-uncased-mnli' // Fast and small
  private isLoading = false

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  public async classify(text: string, labels: string[]): Promise<string | null> {
    if (!text || text.trim().length === 0) return null
    if (!labels || labels.length === 0) return null

    await this.ensureModelLoaded()

    try {
      // Truncate text to avoid token limits (model specific, usually 512 tokens)
      // Taking first 1000 chars is a safe heuristic for context
      const truncatedText = text.slice(0, 1000)

      const output = await this.classifier(truncatedText, labels)
      // Output format: { labels: ['label1', 'label2'], scores: [0.9, 0.1] }
      // We return the top label
      return output.labels[0]
    } catch (error) {
      console.error('AI Classification failed:', error)
      return null
    }
  }

  private async ensureModelLoaded(): Promise<void> {
    if (this.classifier) return
    if (this.isLoading) {
      // Wait for loading
      while (this.isLoading) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (this.classifier) return
      }
    }

    this.isLoading = true
    try {
      // Logic to download model potentially.
      // pipeline will handle caching.
      this.classifier = await pipeline('zero-shot-classification', this.modelName)
    } finally {
      this.isLoading = false
    }
  }
}

export const aiService = AIService.getInstance()
