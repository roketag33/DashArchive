import { extractText } from './textExtractor'

import { COMMON_CATEGORIES } from '../shared/constants'

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

  private async ensureModelLoaded(): Promise<void> {
    if (this.classifier) return
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (this.classifier) return
      }
    }

    this.isLoading = true
    try {
      const { pipeline } = await import('@xenova/transformers')
      this.classifier = await pipeline('zero-shot-classification', this.modelName)
    } catch (e) {
      console.error('Failed to load AI model', e)
      throw e
    } finally {
      this.isLoading = false
    }
  }

  public async classify(text: string, labels: string[]): Promise<string> {
    if (!text || text.trim().length === 0) return 'Other'
    await this.ensureModelLoaded()

    try {
      const candidateLabels = [...labels, 'Other']
      const result = await this.classifier(text.slice(0, 1000), candidateLabels) // Truncate to avoid token limit

      const bestLabel = result.labels[0]
      const bestScore = result.scores[0]

      if (bestLabel === 'Other' || bestScore < 0.2) {
        return 'Other'
      }
      return bestLabel
    } catch (e) {
      console.error('Classification error:', e)
      return 'Other'
    }
  }

  public async suggestCategories(filePaths: string[]): Promise<string[]> {
    await this.ensureModelLoaded()
    const suggestions = new Set<string>()

    const samples = filePaths.slice(0, 5)

    for (const filePath of samples) {
      try {
        const text = await extractText(filePath)
        if (!text || text.length < 10) continue

        const result = await this.classifier(text.slice(0, 1000), COMMON_CATEGORIES)

        // Take top 2 if score is decent
        if (result.scores[0] > 0.3) suggestions.add(result.labels[0])
        if (result.scores[1] > 0.3) suggestions.add(result.labels[1])
      } catch (err) {
        console.warn(`Failed to analyze for suggestion: ${filePath}`, err)
      }
    }

    return Array.from(suggestions)
  }
}

export const aiService = AIService.getInstance()
