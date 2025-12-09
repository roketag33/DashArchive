import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiService } from './aiService'

// Mock dependencies
vi.mock('./textExtractor', () => ({
  extractText: vi.fn()
}))

// Mock transformers pipeline
const mockClassifier = vi.fn()
vi.mock('@xenova/transformers', () => ({
  env: { allowLocalModels: false },
  pipeline: vi.fn(() => Promise.resolve(mockClassifier))
}))

import { extractText } from './textExtractor'
import { pipeline } from '@xenova/transformers'

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset singleton instance if possible or just rely on internal state reset mocked
    // Since singleton is private, we depend on side-effects of mocks
  })

  it('should initialize classifier on first use', async () => {
    mockClassifier.mockResolvedValue({ labels: ['Invoice'], scores: [0.9] })
    
    await aiService.classify('some text', ['Invoice'])
    
    expect(pipeline).toHaveBeenCalledWith('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli')
  })

  it('should truncate input text to avoid model errors', async () => {
    mockClassifier.mockResolvedValue({ labels: ['Invoice'], scores: [0.9] })
    const longText = 'a'.repeat(2000)
    
    await aiService.classify(longText, ['Invoice'])
    
    // Check that classifier was called with truncated text (limit is 1000)
    const calledArgs = mockClassifier.mock.calls[0]
    expect(calledArgs[0].length).toBeLessThanOrEqual(1000)
  })

  it('should return null if scores are too low', async () => {
    mockClassifier.mockResolvedValue({ labels: ['Invoice'], scores: [0.1] }) // Low score
    
    const result = await aiService.classify('text', ['Invoice'])
    
    expect(result).toBe('Other')
  })

  it('should suggest categories based on file samples', async () => {
    // Setup mocks
    const mockExtract = extractText as unknown as ReturnType<typeof vi.fn>
    mockExtract.mockResolvedValue('Sample Invoice Text')
    
    mockClassifier.mockResolvedValue({ labels: ['Invoice', 'Receipt'], scores: [0.9, 0.8] })

    const suggestions = await aiService.suggestCategories(['/path/to/invoice.pdf'])
    
    expect(extractText).toHaveBeenCalledWith('/path/to/invoice.pdf')
    expect(suggestions).toContain('Invoice')
    expect(suggestions).toContain('Receipt')
  })

  it('should handle extraction errors gracefully during suggestion', async () => {
    const mockExtract = extractText as unknown as ReturnType<typeof vi.fn>
    mockExtract.mockRejectedValue(new Error('Extraction failed'))
    
    const suggestions = await aiService.suggestCategories(['/path/to/bad.pdf'])
    
    expect(suggestions).toEqual([]) // Should allow empty result without crashing
  })
})
