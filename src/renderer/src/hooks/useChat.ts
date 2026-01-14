import { useState, useCallback, useEffect } from 'react'
import { useAI } from '../context/AIContext'
import { SearchResult, ActiveFile } from '../services/RAGService'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: SearchResult[]
}

interface UseChatReturn {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  isGenerating: boolean
  modelProgress: string
  modelLoading: boolean
  activeFiles: ActiveFile[]
  addActiveFiles: (files: ActiveFile[]) => void
  clearActiveFiles: () => void
}

export const useChat = (): UseChatReturn => {
  const {
    // isReady: modelReady, // Unused for now
    isLoading: modelLoading,
    progress: modelProgress,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  } = useAI()

  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Listen for AI responses
  useEffect(() => {
    window.api.ai.onResponse((payload) => {
      if (payload.error) {
        console.error('[Chat] AI Error:', payload.error)
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${payload.error}` }])
        setIsGenerating(false)
        return
      }

      // For now, we assume simple full response or handle streaming differently?
      // The worker currently returns full response content in my implementation.
      // If I want streaming, I need to update worker to send chunks.
      // Let's assume non-streaming for first pass V2 implementation as per plan (simplification).
      // Wait, the plan mentioned streaming in useChat original code.
      // My worker implementation uses `await engine.chat.completions.create` without stream:true?
      // Let's checking worker implementation...
      // Worker implementation:
      // const reply = await engine.chat.completions.create({...}) -> non-streaming.
      // So payload.content is the full text.

      if (payload.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: payload.content || '' }])
      }
      setIsGenerating(false)
    })
  }, [])

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      // Add user message to UI immediately
      const userMessageUI: Message = { role: 'user', content }
      setMessages((prev) => [...prev, userMessageUI])
      setIsGenerating(true)

      try {
        // 1. Prepare Prompt (RAG or Explicit)
        const augmentedMessage = content
        // let sources: SearchResult[] = []

        // if (activeFiles.length > 0) {
        //   const result = await ragService.prepareExplicitContext(content, activeFiles)
        //   augmentedMessage = result.augmentedMessage
        //   // sources = result.sources
        // }
        // Fallback to implicit search (Optional, keeping logic)
        // const result = await ragService.preparePromptWithContext(content)
        // augmentedMessage = result.augmentedMessage
        // sources = result.sources

        // Send to Worker
        const id = Date.now().toString()
        window.api.ai.ask(id, augmentedMessage)

        // Clear active files
        clearActiveFiles()
      } catch (error) {
        console.error('Chat error:', error)
        setIsGenerating(false)
      }
    },
    [clearActiveFiles]
  )

  return {
    messages,
    sendMessage,
    isGenerating,
    modelProgress,
    modelLoading,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  }
}
