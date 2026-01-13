import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback
} from 'react'
import { CreateMLCEngine, MLCEngine, InitProgressCallback } from '@mlc-ai/web-llm'
import { ActiveFile } from '../services/RAGService' // Import interface

interface AIContextType {
  engine: MLCEngine | null
  isLoading: boolean
  progress: string
  error: string | null
  activeFiles: ActiveFile[]
  addActiveFiles: (files: ActiveFile[]) => void
  clearActiveFiles: () => void
  removeActiveFile: (path: string) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

// Use Phi-3.5-mini-instruct (q4f16_1) ~2.2GB
const SELECTED_MODEL = 'Phi-3.5-mini-instruct-q4f16_1-MLC'

export function AIProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [engine, setEngine] = useState<MLCEngine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([])
  const initializationStarted = useRef(false)

  const addActiveFiles = useCallback((files: ActiveFile[]) => {
    // Prevent duplicates by path
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
    if (initializationStarted.current) return
    initializationStarted.current = true

    const initEngine = async (): Promise<void> => {
      setProgress('Initialisation du moteur IA...')
      try {
        const initProgressCallback: InitProgressCallback = (report) => {
          setProgress(report.text)
        }

        console.log('Starting AI Engine initialization...')
        const engineInstance = await CreateMLCEngine(SELECTED_MODEL, {
          initProgressCallback,
          logLevel: 'INFO'
        })

        console.log('AI Engine initialized successfully')
        setEngine(engineInstance)
        setProgress('')
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to init AI engine:', err)
        setError("Erreur de chargement de l'IA. Vérifiez votre connexion.")
        setIsLoading(false)
      }
    }

    initEngine()
  }, [])

  return (
    <AIContext.Provider
      value={{
        engine,
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
