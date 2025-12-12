import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderList } from './FolderList'
import { FileList } from './FileList'
import { PlanPreview } from './PlanPreview'
import { DuplicateModal } from './DuplicateModal'
import { AddFolderModal } from './AddFolderModal'
import { FolderSettingsModal } from './FolderSettingsModal'
import { Button } from '../../components/ui/button'
import { DashboardStats } from './DashboardStats'
import { Copy, Check, TriangleAlert, Loader2, ArrowLeft, Plus } from 'lucide-react'
import { useDashboard } from './useDashboard'
import { Folder } from '../../../../shared/types'

export function Dashboard(): React.JSX.Element {
  const { t } = useTranslation()
  const {
    folders,
    isLoadingFolders,
    handleAddFolder,
    handleDeleteFolder,
    handleToggleWatch,
    handleSaveFolderRules,

    selectedFolder,
    files,
    scanning,
    plan,
    executionResult,
    isExecuting,
    showDuplicates,
    setShowDuplicates,
    setPlan,
    setExecutionResult,

    handleSortFolder,
    handleGeneratePlan,
    handleExecutePlan,
    handleDeleteDuplicates,
    handleBackToDashboard
  } = useDashboard()

  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  const [settingsFolder, setSettingsFolder] = useState<Folder | null>(null)

  const isIdle = !plan && !executionResult

  if (isLoadingFolders) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Folder Organization View
  if (selectedFolder) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-300">
        {/* Header / Back Button */}
        <div className="flex items-center gap-4 border-b pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            disabled={isExecuting}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{selectedFolder.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{selectedFolder.path}</p>
          </div>
        </div>

        {isIdle && (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
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
            </div>

            {scanning && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in-50">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>{t('app.scanFolder')}</p>
              </div>
            )}

            {!scanning && files.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <p className="text-lg font-medium text-muted-foreground">{t('app.noFiles')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Everything looks organized here!
                </p>
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
      </div>
    )
  }

  // Dashboard View (Folder List)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('app.dashboardTitle')}</h2>
          <p className="text-muted-foreground">{t('app.dashboardDesc')}</p>
        </div>
        <Button onClick={() => setIsAddFolderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('app.addFolder')}
        </Button>
      </div>

      <DashboardStats />

      <FolderList
        folders={folders}
        onSort={handleSortFolder}
        onToggleWatch={handleToggleWatch}
        onSettings={setSettingsFolder}
        onDelete={(f) => handleDeleteFolder(f.id)}
        sortingFolderId={null} // TODO: Track global sorting if needed
      />

      <AddFolderModal
        open={isAddFolderOpen}
        onOpenChange={setIsAddFolderOpen}
        onAdd={handleAddFolder}
      />

      <FolderSettingsModal
        folder={settingsFolder}
        open={!!settingsFolder}
        onOpenChange={(open) => !open && setSettingsFolder(null)}
        onSave={handleSaveFolderRules}
      />
    </div>
  )
}
