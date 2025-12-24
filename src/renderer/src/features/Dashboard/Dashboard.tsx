import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FolderList } from './FolderList'
import { AddFolderModal } from './AddFolderModal'
import { FolderSettingsModal } from './FolderSettingsModal'
import { Button } from '../../components/ui/button'
import { DashboardStats } from './DashboardStats'
import { Loader2, Plus } from 'lucide-react'
import { useDashboard } from './useDashboard'
import { Folder } from '../../../../shared/types'
import { FolderView } from './FolderView'

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

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
      <FolderView
        folder={selectedFolder}
        files={files}
        isIdle={isIdle}
        scanning={scanning}
        isExecuting={isExecuting}
        plan={plan}
        executionResult={executionResult}
        showDuplicates={showDuplicates}
        onBack={handleBackToDashboard}
        onGeneratePlan={handleGeneratePlan}
        onShowDuplicates={setShowDuplicates}
        onExecutePlan={handleExecutePlan}
        onCancelPlan={() => setPlan(null)}
        onDeleteDuplicates={handleDeleteDuplicates}
        onClearResult={() => setExecutionResult(null)}
      />
    )
  }

  // Dashboard View (Folder List)
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex justify-between items-end border-b border-border/40 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('app.dashboardTitle')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('app.dashboardDesc')}</p>
        </div>
        <Button
          onClick={() => setIsAddFolderOpen(true)}
          size="lg"
          className="shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('app.addFolder')}
        </Button>
      </div>

      <motion.div variants={item}>
        <DashboardStats />
      </motion.div>

      <motion.div variants={item} className="pt-4">
        <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Vos Dossiers
        </h3>
        <FolderList
          folders={folders}
          onSort={handleSortFolder}
          onToggleWatch={handleToggleWatch}
          onSettings={setSettingsFolder}
          onDelete={(f) => handleDeleteFolder(f.id)}
          sortingFolderId={null}
        />
      </motion.div>

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
    </motion.div>
  )
}
