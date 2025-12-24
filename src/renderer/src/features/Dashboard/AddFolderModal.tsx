// Placeholder to avoid validation error while I create components
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AddFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (folder: { name: string; path: string; autoWatch: boolean }) => void
}

export function AddFolderModal({
  open,
  onOpenChange,
  onAdd
}: AddFolderModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [autoWatch, setAutoWatch] = useState(true)

  const handleBrowse = async (): Promise<void> => {
    const selected = await window.api.selectFolder()
    if (selected) {
      setPath(selected)
      // Auto-fill name if empty
      if (!name) {
        const parts = selected.split(/[/\\]/)
        setName(parts[parts.length - 1] || 'New Folder')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (name && path) {
      onAdd({ name, path, autoWatch })
      onOpenChange(false)
      // Reset
      setName('')
      setPath('')
      setAutoWatch(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            {t('app.addFolder')}
          </DialogTitle>
          <DialogDescription>{t('app.addFolderDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="path" className="text-right font-medium">
              {t('app.path')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="path"
                value={path}
                readOnly
                placeholder="/path/to/folder"
                className="flex-1 font-mono text-xs bg-muted/50"
              />
              <Button type="button" variant="secondary" size="icon" onClick={handleBrowse}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right font-medium">
              {t('app.name')}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50"
              placeholder="My Documents"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="autoWatch" className="text-base font-medium">
                {t('app.autoWatch')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {autoWatch ? t('app.autoWatchEnabled') : t('app.autoWatchDisabled')}
              </p>
            </div>
            <Switch id="autoWatch" checked={autoWatch} onCheckedChange={setAutoWatch} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t('app.cancel', 'Annuler')}
            </Button>
            <Button type="submit" disabled={!name || !path}>
              {t('app.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
