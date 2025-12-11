import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderSelector } from './FolderSelector'
import { FileList } from './FileList'
import { PlanPreview } from './PlanPreview'
import { DuplicateModal } from './DuplicateModal'
import { FileEntry, Plan, ExecutionResult } from '../../../../shared/types'
import { Button } from '../../components/ui/button'
import { Copy, Check, TriangleAlert, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function Dashboard(): React.JSX.Element {
  const { t } = useTranslation()
  const [files, setFiles] = useState<FileEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [isWatching, setIsWatching] = useState(false)

  useEffect(() => {
    // Watcher listener
    window.api.onFileAdded((path) => {
      toast.info(t('app.fileDetected'), { description: path })

      if (selectedPath) {
        // Debounce this in real app? Using toast to notify for now.
        // Re-scan
        window.api.scanFolder(selectedPath).then(setFiles)
      }
    })

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

  // Views logic
  const isIdle = !plan && !executionResult

  return (
    <>
      {isIdle && (
        <>
          <FolderSelector onSelect={handleFolderSelect} isLoading={scanning} />

          {selectedPath && (
            <div className="mt-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 overflow-hidden max-w-full">
                <span className="text-sm font-medium whitespace-nowrap">{t('app.selected')}:</span>
                <span
                  className="font-mono text-sm bg-muted px-2 py-1 rounded truncate"
                  title={selectedPath}
                >
                  {selectedPath}
                </span>
              </div>
              {files.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={handleGeneratePlan}>
                    {t('app.organizeFiles', { count: files.length })}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDuplicates(true)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 dark:border-orange-800"
                  >
                    <Copy className="h-4 w-4 mr-2" /> {t('app.cleanDuplicates')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {scanning && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in-50">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>{t('app.scanFolder')}</p>
            </div>
          )}

          {!scanning && selectedPath && files.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
              <p className="text-lg font-medium text-muted-foreground">{t('app.noFiles')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('app.tryDifferent')}</p>
            </div>
          )}

          {files.length > 0 && <FileList files={files} />}
        </>
      )}

      {showDuplicates && (
        <DuplicateModal
          files={files}
          onClose={() => setShowDuplicates(false)}
          onDelete={handleDeleteDuplicates}
        />
      )}

      {plan && (
        <PlanPreview
          plan={plan}
          onConfirm={handleExecutePlan}
          onCancel={() => setPlan(null)}
          isExecuting={isExecuting}
        />
      )}

      {executionResult && (
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm text-center animate-in zoom-in-95">
          <div
            className={`flex justify-center mb-4 ${executionResult.success ? 'text-green-500' : 'text-orange-500'}`}
          >
            {executionResult.success ? (
              <Check className="h-16 w-16" />
            ) : (
              <TriangleAlert className="h-16 w-16" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('app.operationComplete')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('app.successMessage', {
              count: executionResult.processed - executionResult.failed
            })}
            {executionResult.failed > 0 &&
              ` ${t('app.failureMessage', { count: executionResult.failed })}`}
          </p>

          {executionResult.errors.length > 0 && (
            <div className="text-left bg-destructive/10 p-4 rounded mb-6 max-h-[200px] overflow-auto">
              <h3 className="font-bold text-destructive mb-2">{t('app.errors')}:</h3>
              <ul className="list-disc list-inside text-sm text-destructive">
                {executionResult.errors.map((err, idx) => (
                  <li key={idx}>
                    <span className="font-mono text-xs">{err.file}</span>: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={() => setExecutionResult(null)} size="lg">
            {t('app.backToDashboard')}
          </Button>
        </div>
      )}

      {selectedPath && !scanning && !plan && !executionResult && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <Button
            onClick={() => {
              if (isWatching) {
                window.api.stopWatcher()
                setIsWatching(false)
                toast.info(t('app.watcherStopped'))
              } else {
                window.api.startWatcher(selectedPath)
                setIsWatching(true)
                toast.success(t('app.watcherStarted'))
              }
            }}
            variant={isWatching ? 'default' : 'secondary'}
            className={`shadow-lg transition-all ${isWatching ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' : ''}`}
          >
            {isWatching ? (
              <>
                <Eye className="h-4 w-4 mr-2" /> {t('app.watching')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" /> {t('app.watchMode')}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  )
}
