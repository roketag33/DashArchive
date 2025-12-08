import { useState, useEffect } from 'react'
import { FolderSelector } from './components/FolderSelector'
import { FileList } from './components/FileList'
import { PlanPreview } from './components/PlanPreview'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../../shared/types'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
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

  useEffect(() => {
    loadSettings()
    loadHistory()
  }, [])

  const loadSettings = async (): Promise<void> => {
    try {
      // @ts-ignore - Window.api is defined in preload
      const s = await window.api.getSettings()
      setSettings(s)
    } catch (e) {
      console.error('Failed to load settings', e)
    }
  }

  const loadHistory = async (): Promise<void> => {
    try {
      // @ts-ignore - Window.api is defined in preload
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
      // @ts-ignore - Window.api is defined in preload
      const result = await window.api.undoPlan(entry.plan)
      if (result.success) {
        // Refresh history to show 'reverted' status?
        // @ts-ignore - Window.api is defined in preload
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
      // @ts-ignore - Window.api is defined in preload
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
      // @ts-ignore - Window.api is defined in preload
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
      // @ts-ignore - Window.api is defined in preload
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
      // @ts-ignore - Window.api is defined in preload
      const result = await window.api.executePlan(plan)
      setExecutionResult(result)
      setPlan(null) // Clear plan to show result
      // Refresh files after execution?
      if (selectedPath) {
        // @ts-ignore - Window.api is defined in preload
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
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleReset}>
          <img src={electronLogo} className="h-10 w-10 animate-spin-slow" alt="logo" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            File Organizer
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShowHistory}
            className="text-gray-600 hover:text-blue-600 p-2"
            title="History"
          >
            🕒
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-600 hover:text-blue-600 p-2"
            title="Settings"
          >
            ⚙️
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
              <div className="bg-blue-50 px-4 py-2 rounded text-blue-700 text-sm flex justify-between items-center">
                <span>
                  Selected: <span className="font-mono">{selectedPath}</span>
                </span>
                {files.length > 0 && (
                  <button
                    onClick={handleGeneratePlan}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm font-bold"
                  >
                    Organize {files.length} Files
                  </button>
                )}
              </div>
            )}

            {files.length > 0 && <FileList files={files} />}
          </>
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
          <div className="bg-white p-6 rounded shadow text-center">
            <div
              className={`text-6xl mb-4 ${executionResult.success ? 'text-green-500' : 'text-orange-500'}`}
            >
              {executionResult.success ? '✓' : '⚠'}
            </div>
            <h2 className="text-2xl font-bold mb-2">Operation Complete</h2>
            <p className="text-gray-600 mb-6">
              Successfully processed {executionResult.processed - executionResult.failed} files.
              {executionResult.failed > 0 && ` Failed to move ${executionResult.failed} files.`}
            </p>

            {executionResult.errors.length > 0 && (
              <div className="text-left bg-red-50 p-4 rounded mb-6 max-h-[200px] overflow-auto">
                <h3 className="font-bold text-red-700 mb-2">Errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-600">
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
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
