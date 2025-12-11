import { useTranslation } from 'react-i18next'
import { FolderSelector } from './FolderSelector'
import { FileList } from './FileList'
import { PlanPreview } from './PlanPreview'
import { DuplicateModal } from './DuplicateModal'
import { Button } from '../../components/ui/button'
import { Copy, Check, TriangleAlert, Eye, Loader2 } from 'lucide-react'
import { useDashboard } from './useDashboard'

export function Dashboard(): React.JSX.Element {
  const { t } = useTranslation()
  const {
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
  } = useDashboard()

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
            onClick={toggleWatcher}
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
