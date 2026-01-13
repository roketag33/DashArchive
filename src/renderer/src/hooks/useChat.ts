import { useState, useCallback } from 'react'
import { useAI } from '../context/AIContext'
import { ragService, SearchResult, ActiveFile } from '../services/RAGService'

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
    engine,
    progress: modelProgress,
    isLoading: modelLoading,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  } = useAI()

  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!engine) return

      // Add user message to UI immediately
      const userMessageUI: Message = { role: 'user', content }
      setMessages((prev) => [...prev, userMessageUI])
      setIsGenerating(true)

      try {
        // 1. Prepare Prompt (RAG or Explicit)
        // If we have active files, we use Explicit Context
        let augmentedMessage = content
        let sources: SearchResult[] = []

        if (activeFiles.length > 0) {
          const result = await ragService.prepareExplicitContext(content, activeFiles)
          augmentedMessage = result.augmentedMessage
          sources = result.sources
        } else {
          // Fallback to implicit search
          const result = await ragService.preparePromptWithContext(content)
          augmentedMessage = result.augmentedMessage
          sources = result.sources
        }

        // 2. Prepare Messages for LLM
        const messagesForLLM = [
          {
            role: 'system',
            content:
              "Tu es un assistant utile pour le système de fichiers de l'utilisateur. Réponds en français."
          },
          ...messages.map((m) => ({ role: m.role, content: String(m.content || '') })), // History
          { role: 'user', content: String(augmentedMessage || content || '') } // Current Augmented
        ]

        // --- PERFORMANCE LOGGING ---
        const startTime = performance.now()
        const inputTokensEstimate = JSON.stringify(messagesForLLM).length / 4 // Crude estimate
        console.group('[AI Metrics] New Generation Request')
        console.log(`Timestamp: ${new Date().toISOString()}`)
        console.log(`Context Length (Chars): ${JSON.stringify(messagesForLLM).length}`)
        console.log(`Est. Input Tokens: ~${Math.round(inputTokensEstimate)}`)

        // 3. Generate Response (STREAMING)
        const chunks = await engine.chat.completions.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: messagesForLLM as any,
          temperature: 0.7,
          max_tokens: 500,
          stream: true // Enable streaming
        })

        // 4. Add Placeholder Assistant Message
        let accumulatedReply = ''
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '', // Start empty
            sources: sources.length > 0 ? sources : undefined
          }
        ])

        // const endTime = performance.now() // Track start of streaming as "Response Time"

        for await (const chunk of chunks) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            accumulatedReply += content
            // Update the last message with new content
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastMsg = newMessages[newMessages.length - 1]
              if (lastMsg.role === 'assistant') {
                lastMsg.content = accumulatedReply
              }
              return newMessages
            })
          }
        }

        // Log final metrics
        const duration = (performance.now() - startTime) / 1000
        const outputTokensEstimate = accumulatedReply.length / 4

        console.log(`Total Duration: ${duration.toFixed(2)}s`)
        console.log(`Example Speed: ${(outputTokensEstimate / duration).toFixed(2)} tok/s`)
        console.groupEnd()

        // Clear active files after sending to prevent stale context
        clearActiveFiles()
      } catch (error) {
        console.error('Chat error:', error)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erreur lors de la génération de la réponse.' }
        ])
      } finally {
        setIsGenerating(false)
      }
    },
    [engine, messages, activeFiles, clearActiveFiles]
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
