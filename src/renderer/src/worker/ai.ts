// import { ipcRenderer } from 'electron'
// Use window.api.aiWorker handled by preload

import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm'

// ... (log)

let engine: MLCEngine | null = null

// Configuration
// Using a lightweight model compatible with WebGPU
const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC'

const statusEl = document.getElementById('ai-status')
if (statusEl) statusEl.innerText = 'AI Script: Loaded. Initializing Engine...'

async function initEngine(): Promise<void> {
  try {
    if (statusEl) statusEl.innerText = 'AI Script: Creating Engine...'
    // Callback to send progress to Main -> UI
    const initProgressCallback = (
      initProgress: import('@mlc-ai/web-llm').InitProgressReport
    ): void => {
      window.api.aiWorker.sendProgress(initProgress)
    }

    engine = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback: initProgressCallback })

    window.api.aiWorker.sendReady()
    if (statusEl) {
      statusEl.innerText = 'AI Script: Ready!'
      statusEl.style.color = 'green'
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    if (statusEl) {
      statusEl.innerText = 'AI Script Error: ' + errMsg
      statusEl.style.color = 'red'
    }
    window.api.aiWorker.sendError(errMsg)
  }
}

// IPC Handlers
window.api.aiWorker.onAsk(async ({ id, prompt }: { id: string; prompt: string }) => {
  if (!engine) {
    window.api.aiWorker.sendResponse({ id, error: 'Engine not ready' })
    return
  }

  try {
    const toolsSystemPrompt = `
Tu es l'Oracle, l'assistant intelligent de DashArchive.
Ta mission est d'aider l'utilisateur à organiser ses fichiers.

Ton comportement doit respecter STRICTEMENT ces règles :
1. RÉPOND TOUJOURS EN FRANÇAIS. C'est impératif.
2. Sois concis et direct. Pas de bla-bla inutile.
3. Tu as accès à ces outils :

- organize_folder(path: string, strategy: "date" | "type" | "name")
  -> Pour trier un dossier.

- merge_folders(sources: string[], destination: string)
  -> Pour fusionner des dossiers.

IMPORTANT :
Si l'utilisateur demande une action couverte par ces outils :
1. N'écris AUCUN texte de conversation.
2. Réponds UNIQUEMENT avec le bloc JSON ci-dessous.
3. Ne dis pas "Voici la proposition", affiche juste le JSON.

Structure OBLIGATOIRE :
\`\`\`json
{
  "tool": "tool_name",
  "args": { ... }
}
\`\`\`

Sinon, réponds simplement en Français conversationnel.
`

    const messages = [
      {
        role: 'system' as const,
        content: toolsSystemPrompt
      },
      { role: 'user' as const, content: prompt }
    ]

    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.1, // Lower temperature for precision
      max_tokens: 500
    })

    const content = reply.choices[0]?.message?.content || ''

    // Detect Tool Call
    // Try to find JSON block, with or without markdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toolData: any = null

    // 1. Try Markdown Code Block
    const markdownMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (markdownMatch) {
      try {
        toolData = JSON.parse(markdownMatch[1])
      } catch {
        /* ignore */
      }
    }

    // 2. Fallback: Try Raw JSON if it looks like a tool call
    if (!toolData) {
      const rawJsonMatch = content.match(/(\{[\s\S]*"tool"[\s\S]*"args"[\s\S]*\})/)
      if (rawJsonMatch) {
        try {
          toolData = JSON.parse(rawJsonMatch[1])
        } catch {
          /* ignore */
        }
      }
    }

    if (toolData && toolData.tool && toolData.args) {
      const toolName =
        toolData.tool === 'organize_folder'
          ? 'Ranger le dossier'
          : toolData.tool === 'merge_folders'
            ? 'Fusionner les dossiers'
            : toolData.tool

      window.api.aiWorker.sendResponse({
        id,
        content: `Je peux ${toolName} pour toi. Veux-tu procéder ?`,
        toolCall: toolData
      })
      return
    }

    window.api.aiWorker.sendResponse({ id, content })
  } catch (error) {
    // console.error('[AI Worker] Chat error:', error)
    window.api.aiWorker.sendResponse({
      id,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// Start initialization
initEngine()
