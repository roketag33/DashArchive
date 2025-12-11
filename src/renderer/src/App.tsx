import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderSelector } from './features/Dashboard/FolderSelector'
import { FileList } from './features/Dashboard/FileList'
import { PlanPreview } from './features/Dashboard/PlanPreview'
import { SettingsPanel } from './features/Settings/SettingsPanel'
import { HistoryPanel } from './features/History/HistoryPanel'
import { DuplicateModal } from './features/Dashboard/DuplicateModal'
import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../../shared/types'
import electronLogo from './assets/electron.svg'
import { Button } from './components/ui/button'
import { History, Settings, Copy, Check, TriangleAlert, Eye } from 'lucide-react'

function App(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [files, setFiles] = useState<FileEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Settings State
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // History State
  const [history, setHistory] = useState<JournalEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [isWatching, setIsWatching] = useState(false)

  useEffect(() => {
    loadSettings()
    loadHistory()

    // Watcher listener
    window.api.onFileAdded((path) => {
      // Create a native notification (or toast)
      new Notification('New File Detected', { body: path })
      // Ideally refresh the list
      if (selectedPath) {
        // Debounce this in real app
        window.api.scanFolder(selectedPath).then(setFiles)
      }
    })

    return () => {
      window.api.removeFileAddedListener()
    }
  }, [selectedPath])

  const loadSettings = async (): Promise<void> => {
    try {
      const s = await window.api.getSettings()
      setSettings(s)
    } catch (e) {
      console.error('Failed to load settings', e)
    }
  }

  const loadHistory = async (): Promise<void> => {
    try {
      const h = await window.api.getHistory()
      setHistory(h)
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }

  const handleShowHistory = (): void => {
    loadHistory()
    setShowHistory(true)
  }

  const handleUndo = async (entry: JournalEntry): Promise<void> => {
    try {
      const result = await window.api.undoPlan(entry.plan)
      if (result.success) {
        // Refresh history to show 'reverted' status?

        await window.api.markReverted(entry.id)
        loadHistory()
        alert('Undo successful!')
        setExecutionResult(result) // Show result of undo
        setShowHistory(false)
      } else {
        alert('Undo failed: ' + result.errors.map((e) => e.error).join(', '))
      }
    } catch (e) {
      console.error('Failed to undo', e)
      alert('Failed to undo')
    }
  }

  const handleSaveSettings = async (newSettings: AppSettings): Promise<void> => {
    try {
      const saved = await window.api.saveSettings(newSettings)
      setSettings(saved)
      setShowSettings(false)
    } catch (e) {
      console.error('Failed to save settings', e)
      alert('Failed to save settings')
    }
  }

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
      alert('Failed to scan folder')
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
      alert('Failed to generate plan')
    }
  }

  const handleExecutePlan = async (): Promise<void> => {
    if (!plan) return
    setIsExecuting(true)
    try {
      const result = await window.api.executePlan(plan)
      setExecutionResult(result)
      setPlan(null) // Clear plan to show result
      // Refresh files after execution?
      if (selectedPath) {
        const newFiles = await window.api.scanFolder(selectedPath)
        setFiles(newFiles)
      }
    } catch (e) {
      console.error(e)
      alert('Failed to execute plan')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleReset = (): void => {
    setFiles([])
    setSelectedPath(null)
    setPlan(null)
    setExecutionResult(null)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${settings?.theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="flex items-center justify-between mb-8 border-b pb-4 dark:border-gray-700">
          <div className="flex items-center gap-4 cursor-pointer" onClick={handleReset}>
            <img src={electronLogo} className="h-10 w-10 animate-spin-slow" alt="logo" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <button
              onClick={handleShowHistory}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2"
              title={t('app.history')}
            >
              <History className="h-6 w-6" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2"
              title={t('app.settings')}
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="space-y-6">
          {showSettings && settings && (
            <SettingsPanel
              settings={settings}
              onSave={handleSaveSettings}
              onClose={() => setShowSettings(false)}
            />
          )}

          {showHistory && (
            <HistoryPanel
              history={history}
              onUndo={handleUndo}
              onClose={() => setShowHistory(false)}
            />
          )}

          {!plan && !executionResult && !showSettings && !showHistory && (
            <>
              <FolderSelector onSelect={handleFolderSelect} isLoading={scanning} />

              {selectedPath && (
                <div className="mt-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 overflow-hidden max-w-full">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {t('app.selected')}:
                    </span>
                    <span
                      className="font-mono text-sm bg-muted px-2 py-1 rounded truncate"
                      title={selectedPath}
                    >
                      {selectedPath}
                    </span>
                  </div>
                  {files.length > 0 && (
                    <>
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
                    </>
                  )}
                </div>
              )}

              {scanning && (
                <div className="text-center py-8 text-muted-foreground animate-pulse">
                  {t('app.scanFolder')}
                </div>
              )}

              {!scanning && selectedPath && files.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
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
              onDelete={async (toDelete) => {
                try {
                  await window.api.deleteFiles(toDelete.map((f) => f.path))
                  // Refresh
                  if (selectedPath) {
                    const newFiles = await window.api.scanFolder(selectedPath)
                    setFiles(newFiles)
                  }
                } catch (e) {
                  console.error(e)
                  alert('Failed to delete duplicates')
                }
              }}
            />
          )}

          {plan && !showSettings && !showHistory && (
            <PlanPreview
              plan={plan}
              onConfirm={handleExecutePlan}
              onCancel={() => setPlan(null)}
              isExecuting={isExecuting}
            />
          )}

          {executionResult && !showSettings && !showHistory && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
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
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('app.successMessage', {
                  count: executionResult.processed - executionResult.failed
                })}
                {executionResult.failed > 0 &&
                  ` ${t('app.failureMessage', { count: executionResult.failed })}`}
              </p>

              {executionResult.errors.length > 0 && (
                <div className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded mb-6 max-h-[200px] overflow-auto">
                  <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">
                    {t('app.errors')}:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
                    {executionResult.errors.map((err, idx) => (
                      <li key={idx}>
                        <span className="font-mono text-xs">{err.file}</span>: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setExecutionResult(null)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {t('app.backToDashboard')}
              </button>
            </div>
          )}

          {selectedPath && !scanning && !plan && !executionResult && (
            <div className="fixed bottom-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  if (isWatching) {
                    window.api.stopWatcher()
                    setIsWatching(false)
                  } else {
                    window.api.startWatcher(selectedPath)
                    setIsWatching(true)
                  }
                }}
                className={`px-4 py-2 rounded shadow-lg font-medium transition-colors flex items-center gap-2 ${
                  isWatching
                    ? 'bg-green-600 text-white animate-pulse'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {isWatching ? (
                  <>
                    <Eye className="h-4 w-4" /> {t('app.watching')}
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> {t('app.watchMode')}
                  </>
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
