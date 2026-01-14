import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import { ActiveFile } from '../services/RAGService'

interface AIContextType {
  // Engine is now hidden in worker, so we don't expose it directly
  // We expose a flag saying if it's ready
  isReady: boolean
  isLoading: boolean
  progress: string
  error: string | null
  activeFiles: ActiveFile[]
  addActiveFiles: (files: ActiveFile[]) => void
  clearActiveFiles: () => void
  removeActiveFile: (path: string) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<string>('En attente du Worker...')
  const [error] = useState<string | null>(null)
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([])

  const addActiveFiles = useCallback((files: ActiveFile[]) => {
    setActiveFiles((prev) => {
      const newFiles = files.filter((f) => !prev.some((p) => p.path === f.path))
      return [...prev, ...newFiles]
    })
  }, [])

  const clearActiveFiles = useCallback(() => {
    setActiveFiles([])
  }, [])

  const removeActiveFile = useCallback((path: string) => {
    setActiveFiles((prev) => prev.filter((f) => f.path !== path))
  }, [])

  useEffect(() => {
    // Listen to Worker events via Preload
    window.api.ai.onProgress((p) => {
      const text = typeof p === 'string' ? p : (p as { text: string }).text || String(p)
      setProgress(text)
      setIsLoading(true)
    })

    window.api.ai.onReady(() => {
      setIsReady(true)
      setIsLoading(false)
      setProgress('')
    })

    // If we missed the ready event (reloads), we might want to check status (optional)
    // For now we assume init sends progress/ready events.

    // Cleanup listeners not easily possible with current simple preload exposure
    // without returning remove function, but Context is usually mounted once.
  }, [])

  return (
    <AIContext.Provider
      value={{
        isReady,
        isLoading,
        progress,
        error,
        activeFiles,
        addActiveFiles,
        clearActiveFiles,
        removeActiveFile
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAI(): AIContextType {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
