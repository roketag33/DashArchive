import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RAGService } from './RAGService'

// Mock global window.api
const mockSearchSemantic = vi.fn()

global.window = {
  api: {
    searchSemantic: mockSearchSemantic
  }
} as unknown as Window & typeof globalThis

describe('RAGService', () => {
  let service: RAGService

  beforeEach(() => {
    service = new RAGService()
    mockSearchSemantic.mockReset()
  })

  it('should return original message if no context found', async () => {
    mockSearchSemantic.mockResolvedValue([])

    const result = await service.preparePromptWithContext('Hello world')

    expect(result.augmentedMessage).toBe('Hello world')
    expect(result.sources).toEqual([])
  })

  it('should inject context into prompt when relevant results found', async () => {
    // Mock Data

    // Adjust logic: The Service should be robust. If no content, maybe use name?
    // Let's assumes we update IPC later. For now, test that it uses provided properties.
    mockSearchSemantic.mockResolvedValue([
      { name: 'doc.txt', path: '/doc.txt', score: 0.85, snippet: 'Secret info here' }
    ])

    const result = await service.preparePromptWithContext('What is the secret?')

    expect(result.augmentedMessage).toContain('Secret info here')
    expect(result.augmentedMessage).toContain('CONTEXTE:')
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].name).toBe('doc.txt')
  })
})
