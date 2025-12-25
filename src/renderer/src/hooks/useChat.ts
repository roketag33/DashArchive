import { useState, useEffect, useCallback } from 'react'
import { CreateMLCEngine, MLCEngine, InitProgressCallback } from '@mlc-ai/web-llm'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
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
      setProgress('Initializing AI Engine...')
      try {
        const initProgressCallback: InitProgressCallback = (report) => {
          setProgress(report.text)
        }

        const engineInstance = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback })

        setEngine(engineInstance)
        setProgress('')
      } catch (error) {
        console.error('Failed to init engine:', error)
        setProgress('Failed to load AI.')
      }
    }

    if (!engine) {
      initEngine()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!engine) return

      const newMessage: Message = { role: 'user', content }
      setMessages((prev) => [...prev, newMessage])
      setIsLoading(true)

      try {
        // 1. Retrieve Context (Semantic Search)
        // Escaping Type Check for now as window.api is global
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const searchResults = await window.api.searchSemantic(content)

        let context = ''
        if (searchResults && searchResults.length > 0) {
          // Take top 3 relevant chunks

          context = searchResults
            .slice(0, 3)
            .map(
              (r: { path: string; preview?: string }) =>
                `[File: ${r.path}]\n${r.preview || 'Content not available'}`
            )
            .join('\n\n')
        }

        const systemPrompt = `You are a helpful assistant for the user's file system. 
      Use the provided context to answer the user's question. 
      If the answer is not in the context, say so politely.
      
      Context:
      ${context}`

        const response = await engine.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages, // History
            newMessage
          ],
          temperature: 0.7,
          max_tokens: 500
        })

        const reply = response.choices[0].message.content || "I couldn't generate a response."

        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } catch (error) {
        console.error('Chat error:', error)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Error generating response.' }
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
