
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Folder, Rule } from '../../../../shared/types'
import { Checkbox } from '../../components/ui/checkbox'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useTranslation } from 'react-i18next'


interface FolderSettingsModalProps {
    folder: Folder | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (folderId: string, ruleIds: string[]) => void
}

export function FolderSettingsModal({ folder, open, onOpenChange, onSave }: FolderSettingsModalProps): React.JSX.Element {
    const { t } = useTranslation()
    const [rules, setRules] = useState<Rule[]>([])
    const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let mounted = true;
        if (open && folder) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true)
            Promise.all([
                window.api.getRules(),
                window.api.getFolderRules(folder.id)
            ]).then(([allRules, activeIds]) => {
                if (mounted) {
                    setRules(allRules)
                    setSelectedRuleIds(new Set(activeIds))
                }
            }).finally(() => {
                if (mounted) setLoading(false)
            })
        }
        return () => { mounted = false; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, folder])

    const toggleRule = (ruleId: string): void => {
        const next = new Set(selectedRuleIds)
        if (next.has(ruleId)) next.delete(ruleId)
        else next.add(ruleId)
        setSelectedRuleIds(next)
    }

    const handleSave = (): void => {
        if (folder) {
            onSave(folder.id, Array.from(selectedRuleIds))
            onOpenChange(false)
        }
    }

    if (!folder) return <></>

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('app.folderSettingsTitle', { name: folder.name })}</DialogTitle>
                    <DialogDescription>
                        {t('app.folderSettingsDesc')}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[300px] border rounded-md p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {rules.map(rule => (
                                <div key={rule.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={rule.id}
                                        checked={selectedRuleIds.has(rule.id)}
                                        onCheckedChange={() => toggleRule(rule.id)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={rule.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {rule.name}
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            {rule.description || t('app.noDescription')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {rules.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('app.noRules')}</p>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('settings.cancel')}</Button>
                    <Button onClick={handleSave}>{t('settings.saveChanges')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
