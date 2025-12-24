import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIService } from './index'

// Mock transformers
const mockPipeline = vi.fn()
vi.mock('@xenova/transformers', () => ({
  pipeline: (...args) => mockPipeline(...args),
  env: {
    allowLocalModels: true,
    allowRemoteModels: true
  }
}))

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset singleton if needed, or just instantiate new classes if not using strict singleton pattern in tests
    // For now assuming we can instantiate it for testing
    aiService = new AIService()
  })

  it('should instantiate correctly', () => {
    expect(aiService).toBeDefined()
  })

  it('should initialize pipeline on first use', async () => {
    mockPipeline.mockResolvedValueOnce(async () => [])

    // Call suggestTags (which triggers initialization)
    // We mock the classification result
    const mockClassifier = vi.fn().mockResolvedValue([
      { label: 'cat', score: 0.99 },
      { label: 'animal', score: 0.95 }
    ])
    mockPipeline.mockResolvedValue(mockClassifier)

    await aiService.suggestTags('/path/to/image.jpg')

    expect(mockPipeline).toHaveBeenCalledWith('image-classification', expect.any(String))
  })

  it('should return tags for an image', async () => {
    // Mock the classifier function returned by pipeline
    const mockClassifier = vi.fn().mockResolvedValue([
      { label: 'sunset', score: 0.9 },
      { label: 'landscape', score: 0.8 },
      { label: 'ignored', score: 0.1 } // Low confidence
    ])
    mockPipeline.mockResolvedValue(mockClassifier)

    const tags = await aiService.suggestTags('/path/to/image.jpg')

    expect(tags).toContain('sunset')
    expect(tags).toContain('landscape')
    expect(tags).not.toContain('ignored') // Should filter low confidence
  })

  it('should handle errors gracefully', async () => {
    mockPipeline.mockRejectedValue(new Error('Model load failed'))

    const tags = await aiService.suggestTags('/path/to/bad.jpg')
    expect(tags).toEqual([])
  })
})
