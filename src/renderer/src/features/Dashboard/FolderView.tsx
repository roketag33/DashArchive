import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  Check,
  TriangleAlert,
  Loader2,
  Sparkles,
  Folder as FolderIcon
} from 'lucide-react'
import { Folder, FileEntry, Plan, ExecutionResult } from '../../../../shared/types'
import { Button } from '../../components/ui/button'
import { FileList } from './FileList'
import { PlanPreview } from './PlanPreview'
import { DuplicateModal } from './DuplicateModal'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

interface FolderViewProps {
  folder: Folder
  files: FileEntry[]
  isIdle: boolean
  scanning: boolean
  isExecuting: boolean
  plan: Plan | null
  executionResult: ExecutionResult | null
  showDuplicates: boolean
  onBack: () => void
  onGeneratePlan: () => void
  onShowDuplicates: (show: boolean) => void
  onExecutePlan: () => void
  onCancelPlan: () => void
  onDeleteDuplicates: (files: FileEntry[]) => Promise<void>
  onClearResult: () => void
}

export function FolderView({
  folder,
  files,
  isIdle,
  scanning,
  isExecuting,
  plan,
  executionResult,
  showDuplicates,
  onBack,
  onGeneratePlan,
  onShowDuplicates,
  onExecutePlan,
  onCancelPlan,
  onDeleteDuplicates,
  onClearResult
}: FolderViewProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
      {/* Premium Glassmorphic Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-xl transition-all hover:bg-card/40 hover:shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FolderIcon className="w-32 h-32 text-primary rotate-12" />
        </div>

        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={onBack}
              disabled={isExecuting}
              className="rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {folder.name}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {files.length} fichiers
                </span>
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-1 opacity-80">
                {folder.path}
              </p>
            </div>
          </div>

          {/* Smart Actions Bar */}
          <div className="flex gap-2">
            {isIdle && files.length > 0 && (
              <>
                <Button
                  onClick={onGeneratePlan}
                  className="shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('app.organizeFiles', { count: files.length })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onShowDuplicates(true)}
                  className="bg-background/50 backdrop-blur-sm border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <Copy className="h-4 w-4 mr-2" /> {t('app.cleanDuplicates')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="h-12 w-12 animate-spin mb-4 relative z-10 text-primary" />
            </div>
            <p className="text-lg font-medium">{t('app.scanFolder')}</p>
            <p className="text-sm opacity-60">Analyse de vos fichiers en cours...</p>
          </motion.div>
        )}

        {!scanning && isIdle && files.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/50 rounded-xl bg-muted/5 text-center"
          >
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FolderIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-medium text-foreground">{t('app.noFiles')}</p>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Ce dossier semble vide ou déjà parfaitement organisé. Bon travail !
            </p>
          </motion.div>
        )}

        {!scanning && isIdle && files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <FileList files={files} />
          </motion.div>
        )}
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showDuplicates && (
          <DuplicateModal
            files={files}
            onClose={() => onShowDuplicates(false)}
            onDelete={onDeleteDuplicates}
          />
        )}
      </AnimatePresence>

      {plan && (
        <PlanPreview
          plan={plan}
          onConfirm={onExecutePlan}
          onCancel={onCancelPlan}
          isExecuting={isExecuting}
        />
      )}

      {executionResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card text-card-foreground p-8 rounded-xl border border-border/50 shadow-2xl text-center max-w-lg mx-auto"
        >
          <div
            className={cn(
              'flex justify-center mb-6',
              executionResult.success ? 'text-green-500' : 'text-orange-500'
            )}
          >
            <div className={cn('p-4 rounded-full bg-current/10')}>
              {executionResult.success ? (
                <Check className="h-12 w-12" />
              ) : (
                <TriangleAlert className="h-12 w-12" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('app.operationComplete')}</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {t('app.successMessage', {
              count: executionResult.processed - executionResult.failed
            })}
            {executionResult.failed > 0 &&
              ` ${t('app.failureMessage', { count: executionResult.failed })}`}
          </p>

          {executionResult.errors.length > 0 && (
            <div className="text-left bg-destructive/10 p-4 rounded-lg mb-6 max-h-[200px] overflow-auto border border-destructive/20">
              <h3 className="font-bold text-destructive mb-2 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" />
                {t('app.errors')}:
              </h3>
              <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                {executionResult.errors.map((err, idx) => (
                  <li key={idx}>
                    <span className="font-mono text-xs opacity-80">{err.file}</span>: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onClearResult} size="lg" className="w-full">
            {t('app.backToDashboard')}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
