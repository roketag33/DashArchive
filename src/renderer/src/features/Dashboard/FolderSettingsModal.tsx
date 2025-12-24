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
import { Folder as FolderType, Rule } from '../../../../shared/types'
import { Folder as FolderIcon } from 'lucide-react'
import { Checkbox } from '../../components/ui/checkbox'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

interface FolderSettingsModalProps {
  folder: FolderType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (folderId: string, ruleIds: string[], frequency?: string) => void
}

export function FolderSettingsModal({
  folder,
  open,
  onOpenChange,
  onSave
}: FolderSettingsModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [rules, setRules] = useState<Rule[]>([])
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [frequency, setFrequency] = useState<string>('')

  useEffect(() => {
    let mounted = true
    if (open && folder) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      // Initialize frequency

      if (folder.scanFrequency) {
        setFrequency(folder.scanFrequency)
      } else {
        setFrequency('')
      }

      Promise.all([window.api.getRules(), window.api.getFolderRules(folder.id)])
        .then(([allRules, activeIds]) => {
          if (mounted) {
            setRules(allRules)
            setSelectedRuleIds(new Set(activeIds))
          }
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
    }
    return () => {
      mounted = false
    }
  }, [open, folder])

  const toggleRule = (ruleId: string): void => {
    const next = new Set(selectedRuleIds)
    if (next.has(ruleId)) next.delete(ruleId)
    else next.add(ruleId)
    setSelectedRuleIds(next)
  }

  const handleSave = (): void => {
    if (folder) {
      onSave(folder.id, Array.from(selectedRuleIds), frequency)
      onOpenChange(false)
    }
  }

  if (!folder) return <></>

  // ... imports

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/50 bg-muted/10">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <FolderIcon className="w-5 h-5" />
              </div>
              {t('app.folderSettingsTitle', { name: folder.name })}
            </DialogTitle>
            <DialogDescription>{t('app.folderSettingsDesc')}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              {t('app.scanFrequency')}
            </label>
            <div className="relative">
              <select
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="">{t('app.freqManual')}</option>
                <option value="15m">{t('app.freq15m')}</option>
                <option value="30m">{t('app.freq30m')}</option>
                <option value="1h">{t('app.freq1h')}</option>
                <option value="daily">{t('app.freqDaily')}</option>
              </select>
              {/* Custom arrow could go here */}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              {t('settings.rules.title')}
            </label>
            <ScrollArea className="h-[240px] border rounded-lg p-0 bg-muted/5">
              {loading ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  Is Loading...
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={clsx(
                        'flex items-start space-x-3 p-3 rounded-md transition-colors border border-transparent',
                        selectedRuleIds.has(rule.id)
                          ? 'bg-primary/5 border-primary/10'
                          : 'hover:bg-accent'
                      )}
                    >
                      <Checkbox
                        id={rule.id}
                        checked={selectedRuleIds.has(rule.id)}
                        onCheckedChange={() => toggleRule(rule.id)}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1 leading-none flex-1">
                        <label
                          htmlFor={rule.id}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {rule.name}
                        </label>
                        <p className="text-xs text-muted-foreground mr-4 leading-relaxed">
                          {rule.description || t('app.noDescription')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {rules.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">{t('app.noRules')}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleSave} className="shadow-lg shadow-primary/20">
            {t('settings.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
