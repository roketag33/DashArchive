import { pipeline, env } from '@xenova/transformers'

// Configuration pour éviter de télécharger depuis un CDN distant si possible (local first)
// Mais par défaut transformers.js télécharge depuis HF hub.
// On configure pour utiliser le cache local après premier download.
env.allowLocalModels = false // Force download from HF first time (since we don't have local weights bundled yet)
env.useBrowserCache = true

export class VoiceService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipeline: any = null
  private _isListening: boolean = false
  private modelName: string = 'Xenova/whisper-tiny'

  async initialize(): Promise<void> {
    if (this.pipeline) return

    try {
      this.pipeline = await pipeline('automatic-speech-recognition', this.modelName, {
        quantized: true // Use quantized model for smaller size/faster inference
      })
      console.log('VoiceService: Pipeline initialized')
    } catch (error) {
      console.error('VoiceService: Initialization failed', error)
      throw error
    }
  }

  get isReady(): boolean {
    return this.pipeline !== null
  }

  get isListening(): boolean {
    return this._isListening
  }

  async startListening(onResult: (text: string) => void): Promise<void> {
    if (this._isListening) return
    this._isListening = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)

      source.connect(processor)
      processor.connect(audioContext.destination)

      let audioBuffer: Float32Array[] = []
      let silenceStart = Date.now()
      const SILENCE_THRESHOLD = 1500 // 1.5s silence triggers transcription

      processor.onaudioprocess = async (e) => {
        if (!this._isListening) {
          stream.getTracks().forEach((t) => t.stop())
          processor.disconnect()
          source.disconnect()
          audioContext.close()
          return
        }

        const inputData = e.inputBuffer.getChannelData(0)
        // Store copy
        audioBuffer.push(new Float32Array(inputData))

        // Simple VAD (Voice Activity Detection) - Check volume
        const volume = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length

        if (volume > 0.01) {
          silenceStart = Date.now()
        } else if (Date.now() - silenceStart > SILENCE_THRESHOLD && audioBuffer.length > 10) {
          // Silence detected -> Transcribe accumulated buffer
          const fullBuffer = this.mergeBuffers(audioBuffer)
          audioBuffer = [] // Reset
          silenceStart = Date.now()

          console.log('VoiceService: Transcribing...')
          try {
            const text = await this.transcribe(fullBuffer)
            if (text && text.trim().length > 1) {
              onResult(text.trim())
            }
          } catch (err) {
            console.error(err)
          }
        }
      }
    } catch (error) {
      console.error('Microphone access denied', error)
      this._isListening = false
      throw error
    }
  }

  stopListening(): void {
    this._isListening = false
  }

  private mergeBuffers(buffers: Float32Array[]): Float32Array {
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0)
    const result = new Float32Array(totalLength)
    let offset = 0
    for (const b of buffers) {
      result.set(b, offset)
      offset += b.length
    }
    return result
  }

  async transcribe(audioData: Float32Array): Promise<string> {
    if (!this.pipeline) throw new Error('Pipeline not initialized')

    // Whisper expects input features or raw audio
    // The pipeline handles raw audio (Float32Array) directly
    const result = await this.pipeline(audioData)
    return result.text || ''
  }
}

export const voiceService = new VoiceService()
