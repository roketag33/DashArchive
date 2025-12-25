import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VoiceService } from './VoiceService'

// Mock transformers
const mockPipeline = vi.fn()
vi.mock('@xenova/transformers', () => ({
  pipeline: (task, model, opts) => mockPipeline(task, model, opts),
  env: { allowLocalModels: false }
}))

describe('VoiceService', () => {
  let service: VoiceService

  beforeEach(() => {
    vi.resetAllMocks()

    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      },
      configurable: true
    })

    // Mock AudioContext
    const mockCreateMediaStreamSource = vi.fn().mockReturnValue({ connect: vi.fn() })
    const mockCreateScriptProcessor = vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      onaudioprocess: null
    })
    const mockClose = vi.fn()

    class MockAudioContext {
      createMediaStreamSource = mockCreateMediaStreamSource
      createScriptProcessor = mockCreateScriptProcessor
      destination = {}
      close = mockClose
    }

    vi.stubGlobal('AudioContext', MockAudioContext)

    service = new VoiceService()
  })

  it('should initialize the pipeline correctly', async () => {
    mockPipeline.mockResolvedValue({}) // Return a mock pipeline object

    await service.initialize()

    expect(mockPipeline).toHaveBeenCalledWith(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      expect.any(Object)
    )
    expect(service.isReady).toBe(true)
  })

  it('should handle initialization errors', async () => {
    mockPipeline.mockRejectedValue(new Error('Load failed'))

    await expect(service.initialize()).rejects.toThrow('Load failed')
    expect(service.isReady).toBe(false)
  })

  it('should manage listening state', async () => {
    expect(service.isListening).toBe(false)
    await service.startListening(vi.fn())
    expect(service.isListening).toBe(true)
    service.stopListening()
    expect(service.isListening).toBe(false)
  })
})
