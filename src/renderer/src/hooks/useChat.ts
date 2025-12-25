import { useState, useEffect, useCallback } from 'react'
import { CreateMLCEngine, MLCEngine, InitProgressCallback } from '@mlc-ai/web-llm'
import { ragService, SearchResult } from '../services/RAGService'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: SearchResult[]
}

interface UseChatReturn {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  isLoading: boolean
  progress: string
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [engine, setEngine] = useState<MLCEngine | null>(null)

  // Use Phi-3.5-mini-instruct (q4f16_1) ~2.2GB
  const SELECTED_MODEL = 'Phi-3.5-mini-instruct-q4f16_1-MLC'

  useEffect(() => {
    const initEngine = async (): Promise<void> => {
      setProgress('Initialisation du moteur IA...')
      try {
        const initProgressCallback: InitProgressCallback = (report) => {
          setProgress(report.text)
        }

        const engineInstance = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback })

        setEngine(engineInstance)
        setProgress('')
      } catch (error) {
        console.error('Failed to init engine:', error)
        setProgress("Erreur de chargement de l'IA.")
      }
    }

    if (!engine) {
      initEngine()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!engine) return

      // Add user message to UI immediately (original content)
      const userMessageUI: Message = { role: 'user', content }
      setMessages((prev) => [...prev, userMessageUI])
      setIsLoading(true)

      try {
        // 1. Prepare RAG Prompt (Context Injection)
        const { augmentedMessage, sources } = await ragService.preparePromptWithContext(content)

        // 2. Prepare Messages for LLM
        // We replace the last user message with the augmented one
        const messagesForLLM = [
          {
            role: 'system',
            content:
              "Tu es un assistant utile pour le système de fichiers de l'utilisateur. Réponds en français."
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })), // History
          { role: 'user', content: augmentedMessage } // Current Augmented
        ]

        // 3. Generate Response
        const response = await engine.chat.completions.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: messagesForLLM as any,
          temperature: 0.7,
          max_tokens: 500
        })

        const reply = response.choices[0].message.content || "Je n'ai pas pu générer de réponse."

        // 4. Add Assistant Reply with Sources
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            sources: sources.length > 0 ? sources : undefined
          }
        ])
      } catch (error) {
        console.error('Chat error:', error)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erreur lors de la génération de la réponse.' }
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [engine, messages]
  )

  return {
    messages,
    sendMessage,
    isLoading,
    progress
  }
}
