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

export function AddFolderModal({ open, onOpenChange, onAdd }: AddFolderModalProps): React.JSX.Element {
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('app.addFolder')}</DialogTitle>
                    <DialogDescription>
                        {t('app.addFolderDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="path" className="text-right">
                            {t('app.path')}
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            <Input id="path" value={path} readOnly placeholder="/path/to/folder" className="flex-1" />
                            <Button type="button" variant="outline" size="icon" onClick={handleBrowse}>
                                <FolderOpen className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t('app.name')}
                        </Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="My Folder" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="autoWatch" className="text-right">
                            {t('app.autoWatch')}
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Switch id="autoWatch" checked={autoWatch} onCheckedChange={setAutoWatch} />
                            <span className="text-xs text-muted-foreground">
                                {autoWatch ? t('app.autoWatchEnabled') : t('app.autoWatchDisabled')}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!name || !path}>{t('app.add')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
