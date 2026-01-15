import { useState, useCallback, useEffect } from 'react'
import { useAI } from '../context/AIContext'
import { SearchResult, ActiveFile } from '../services/RAGService'

export interface Message {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: SearchResult[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolCall?: { tool: string; args: any }
}

interface UseChatReturn {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  isGenerating: boolean
  modelProgress: string
  modelProgressValue: number
  modelLoading: boolean
  modelError: string | null
  activeFiles: ActiveFile[]
  addActiveFiles: (files: ActiveFile[]) => void
  clearActiveFiles: () => void
}

export const useChat = (): UseChatReturn => {
  const {
    isLoading: modelLoading,
    progress: modelProgress,
    progressValue: modelProgressValue,
    error: modelError,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  } = useAI()

  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Listen for AI responses
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsubscribe = window.api.ai.onResponse((payload: any) => {
      const { id, content, error, toolCall } = payload

      if (error) {
        console.error('[Chat] AI Error:', error)
        setMessages((prev) => {
          const responseId = `${id}-ai`
          if (prev.some((m) => m.id === responseId)) return prev // Dedup
          return [...prev, { id: responseId, role: 'assistant', content: `Error: ${error}` }]
        })
        setIsGenerating(false)
        return
      }

      setMessages((prev) => {
        const responseId = `${id}-ai`
        if (prev.some((m) => m.id === responseId)) return prev // Dedup based on response ID

        return [
          ...prev,
          {
            id: responseId,
            role: 'assistant',
            content: content || (toolCall ? 'Action proposée :' : ''),
            toolCall: toolCall
          }
        ]
      })
      setIsGenerating(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const id = Date.now().toString() // Generate ID upfront
      const userMessageUI: Message = { id, role: 'user', content }
      setMessages((prev) => [...prev, userMessageUI])
      setIsGenerating(true)

      try {
        const augmentedMessage = content
        // const id = Date.now().toString() // Removed redundant generation
        window.api.ai.ask(id, augmentedMessage)
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
    modelProgressValue,
    modelLoading,
    modelError,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  }
}
