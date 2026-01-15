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
  progressValue: number // 0-100
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
  const [progressValue, setProgressValue] = useState(0)
  const [error, setError] = useState<string | null>(null)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.api.ai.onProgress((p: any) => {
      // InitProgressReport: { progress: number, text: string, timeElapsed: number }
      const text = typeof p === 'string' ? p : p.text || String(p)
      const val = typeof p === 'object' && p.progress ? Math.round(p.progress * 100) : 0

      setProgress(text)
      setProgressValue(val)
      setIsLoading(true)
    })

    window.api.ai.onReady(() => {
      setIsReady(true)
      setIsLoading(false)
      setProgress('')
      setProgressValue(100)
    })

    if (window.api.ai.onError) {
      window.api.ai.onError((errMsg) => {
        setError(errMsg)
        setIsLoading(false)
        setProgress('Erreur Critique')
      })
    }

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
        progressValue,
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
