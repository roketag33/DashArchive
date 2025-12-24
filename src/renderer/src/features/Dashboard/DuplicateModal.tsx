import React, { useEffect, useState } from 'react'
import { FileEntry, DuplicateGroup } from '../../../../shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Trash2, AlertTriangle, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

interface DuplicateModalProps {
  files: FileEntry[]
  onClose: () => void
  onDelete: (files: FileEntry[]) => Promise<void>
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({ files, onClose, onDelete }) => {
  const { t } = useTranslation()
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())

  // Load duplicates on mount
  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const result = (await window.api.findDuplicates(files)) as unknown as DuplicateGroup[]
        setDuplicates(result)
        // Auto-select duplicates (keep oldest by default)
        const autoSelected = new Set<string>()
        result.forEach((group) => {
          // Sort by createdAt ascending (oldest first)
          const sorted = [...group.files].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          // Select all except the first (oldest)
          sorted.slice(1).forEach((f) => autoSelected.add(f.path))
        })
        setSelectedPaths(autoSelected)
      } catch (error) {
        console.error('Failed to find duplicates', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [files])

  const toggleSelect = (path: string): void => {
    const next = new Set(selectedPaths)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setSelectedPaths(next)
  }

  const handleDelete = async (): Promise<void> => {
    const toDelete: FileEntry[] = []
    duplicates.forEach((g) => {
      g.files.forEach((f) => {
        if (selectedPaths.has(f.path)) toDelete.push(f)
      })
    })

    if (confirm(t('duplicates.confirmDelete', { count: toDelete.length }))) {
      await onDelete(toDelete)
      onClose()
    }
  }

  const totalWaste = duplicates.reduce(
    (acc, group) => acc + group.size * (group.files.length - 1),
    0
  )

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              {t('duplicates.title')}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-1">
              {t('duplicates.spaceReclaim')}:
              <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">
                {(totalWaste / 1024 / 1024).toFixed(2)} MB
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
              <Sparkles className="w-10 h-10 mb-4 opacity-50" />
              <p>{t('duplicates.scanning')}</p>
            </div>
          ) : duplicates.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-500/10 text-green-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {t('duplicates.noDuplicates')}
                </p>
                <p className="text-sm opacity-80">Votre dossier est parfaitement propre !</p>
              </div>
            </div>
          ) : (
            duplicates.map((group) => (
              <div
                key={group.hash}
                className="group border border-border/50 rounded-xl p-4 bg-card hover:bg-card/80 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Hash: {group.hash.substring(0, 8)}...
                  </span>
                  <span className="font-medium text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {(group.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="space-y-1">
                  {group.files.map((file) => (
                    <div
                      key={file.path}
                      className={clsx(
                        'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 border border-transparent',
                        selectedPaths.has(file.path)
                          ? 'bg-destructive/5 border-destructive/20'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => toggleSelect(file.path)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPaths.has(file.path)}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive"
                      />
                      <div className="flex-1 min-w-0 grid gap-0.5">
                        <div
                          className={clsx(
                            'truncate text-sm font-medium',
                            selectedPaths.has(file.path) ? 'text-destructive' : 'text-foreground'
                          )}
                        >
                          {file.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground font-mono opacity-70">
                          {file.path}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap px-2">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('duplicates.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={selectedPaths.size === 0}
            className="shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('duplicates.deleteSelected', { count: selectedPaths.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
