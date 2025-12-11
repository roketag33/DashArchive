import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileEntry, Plan, ExecutionResult } from '../../../../shared/types'
import { toast } from 'sonner'

interface UseDashboardReturn {
  files: FileEntry[]
  selectedPath: string | null
  scanning: boolean
  plan: Plan | null
  executionResult: ExecutionResult | null
  isExecuting: boolean
  isWatching: boolean
  showDuplicates: boolean
  setShowDuplicates: (show: boolean) => void
  setPlan: (plan: Plan | null) => void
  setExecutionResult: (res: ExecutionResult | null) => void
  handlers: {
    handleFolderSelect: (path: string) => Promise<void>
    handleGeneratePlan: () => Promise<void>
    handleExecutePlan: () => Promise<void>
    handleDeleteDuplicates: (toDelete: FileEntry[]) => Promise<void>
    toggleWatcher: () => void
  }
}

export function useDashboard(): UseDashboardReturn {
  const { t } = useTranslation()
  const [files, setFiles] = useState<FileEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [isWatching, setIsWatching] = useState(false)

  // Watcher Effect
  useEffect(() => {
    const handleFileAdded = (path: string): void => {
      toast.info(t('app.fileDetected'), { description: path })
      if (selectedPath) {
        window.api.scanFolder(selectedPath).then(setFiles)
      }
    }

    window.api.onFileAdded(handleFileAdded)
    return () => {
      window.api.removeFileAddedListener()
    }
  }, [selectedPath, t])

  const handleFolderSelect = async (path: string): Promise<void> => {
    setSelectedPath(path)
    setScanning(true)
    setFiles([])
    setPlan(null)
    setExecutionResult(null)
    try {
      const result = await window.api.scanFolder(path)
      setFiles(result)
    } catch (e) {
      console.error(e)
      toast.error(t('app.scanError'))
    } finally {
      setScanning(false)
    }
  }

  const handleGeneratePlan = async (): Promise<void> => {
    try {
      const generatedPlan = await window.api.generatePlan(files)
      setPlan(generatedPlan)
    } catch (e) {
      console.error(e)
      toast.error(t('app.planError'))
    }
  }

  const handleExecutePlan = async (): Promise<void> => {
    if (!plan) return
    setIsExecuting(true)
    try {
      const result = await window.api.executePlan(plan)
      setExecutionResult(result)
      setPlan(null)
      toast.success(t('app.executionSuccess'))
      // Refresh files after execution
      if (selectedPath) {
        const newFiles = await window.api.scanFolder(selectedPath)
        setFiles(newFiles)
      }
    } catch (e) {
      console.error(e)
      toast.error(t('app.executionError'))
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDeleteDuplicates = async (toDelete: FileEntry[]): Promise<void> => {
    try {
      await window.api.deleteFiles(toDelete.map((f) => f.path))
      toast.success(t('app.duplicatesDeleted'))
      if (selectedPath) {
        const newFiles = await window.api.scanFolder(selectedPath)
        setFiles(newFiles)
      }
    } catch (e) {
      console.error(e)
      toast.error(t('app.deleteError'))
    }
  }

  const toggleWatcher = (): void => {
    if (isWatching) {
      window.api.stopWatcher()
      setIsWatching(false)
      toast.info(t('app.watcherStopped'))
    } else {
      if (selectedPath) {
        window.api.startWatcher(selectedPath)
        setIsWatching(true)
        toast.success(t('app.watcherStarted'))
      }
    }
  }

  return {
    files,
    selectedPath,
    scanning,
    plan,
    executionResult,
    isExecuting,
    isWatching,
    showDuplicates,
    setShowDuplicates,
    setPlan,
    setExecutionResult,
    handlers: {
      handleFolderSelect,
      handleGeneratePlan,
      handleExecutePlan,
      handleDeleteDuplicates,
      toggleWatcher
    }
  }
}
