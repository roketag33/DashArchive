import { ipcRenderer } from 'electron'
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm'

console.log('[AI Worker] Initializing...')

let engine: MLCEngine | null = null

// Configuration
// Using a lightweight model compatible with WebGPU
const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC'

async function initEngine(): Promise<void> {
  try {
    console.log('[AI Worker] Loading Engine...')

    // Callback to send progress to Main -> UI
    const initProgressCallback = (
      initProgress: import('@mlc-ai/web-llm').InitProgressReport
    ): void => {
      console.log('[AI Worker] Progress:', initProgress)
      ipcRenderer.send('ai:progress', initProgress)
    }

    engine = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback: initProgressCallback })

    console.log('[AI Worker] Engine Loaded!')
    ipcRenderer.send('ai:ready')
  } catch (error) {
    console.error('[AI Worker] Failed to load engine:', error)
    ipcRenderer.send('ai:error', error instanceof Error ? error.message : String(error))
  }
}

// IPC Handlers
ipcRenderer.on('ai:ask', async (_, { id, prompt }: { id: string; prompt: string }) => {
  if (!engine) {
    ipcRenderer.send('ai:response', { id, error: 'Engine not ready' })
    return
  }

  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are the Ghost Librarian, an intelligent file organizer. Be concise.'
      },
      { role: 'user' as const, content: prompt }
    ]

    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 500 // Limit response length
    })

    const content = reply.choices[0]?.message?.content || ''

    ipcRenderer.send('ai:response', { id, content })
  } catch (error) {
    console.error('[AI Worker] Chat error:', error)
    ipcRenderer.send('ai:response', {
      id,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// Start initialization
initEngine()
