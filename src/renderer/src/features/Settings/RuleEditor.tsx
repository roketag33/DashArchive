import React, { useState } from 'react'
import { Rule } from '../../../../shared/types'
import { COMMON_CATEGORIES } from '../../../../shared/constants'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Save, FolderOpen, Wand2, Brain, Wrench, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface RuleEditorProps {
  initialRule: Rule
  onSave: (rule: Rule) => void
  onCancel: () => void
}

export function RuleEditor({ initialRule, onSave, onCancel }: RuleEditorProps): React.JSX.Element {
  const { t } = useTranslation()
  const [editForm, setEditForm] = useState<Partial<Rule>>({ ...initialRule })

  const handleChange = (field: keyof Rule, value: string | string[] | number): void => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (value: string): void => {
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
    setEditForm((prev) => ({ ...prev, extensions: arr }))
  }

  const handleAiPromptsChange = (value: string): void => {
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
    setEditForm((prev) => ({ ...prev, aiPrompts: arr }))
  }

  const handleSelectDestination = async (): Promise<void> => {
    const path = await window.api.selectFolder()
    if (path) {
      handleChange('destination', path)
    }
  }

  const handleSuggestCategories = async (): Promise<void> => {
    const folder = await window.api.selectFolder()
    if (!folder) return

    toast.info('Analyzing folder...')
    try {
      const suggestions = await window.api.suggestAiCategories(folder)
      if (suggestions && suggestions.length > 0) {
        const current = editForm.aiPrompts || []
        const combined = Array.from(new Set([...current, ...suggestions]))
        setEditForm((prev) => ({ ...prev, aiPrompts: combined }))
        toast.success(`Added ${suggestions.length} categories`)
      } else {
        toast.info('No common document categories found in sample.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to analyze folder.')
    }
  }

  const handleSaveEdit = (): void => {
    if (!editForm.name || editForm.name.trim() === '') {
      toast.error('Rule name cannot be empty')
      return
    }
    // Merge back to a full Rule object
    onSave({ ...initialRule, ...editForm } as Rule)
  }

  return (
    <div className="grid gap-4 border p-4 rounded-lg bg-card/50">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">{t('settings.rules.edit.name')}</label>
          <Input
            placeholder={t('settings.rules.edit.namePlaceholder')}
            value={editForm.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Destination</label>
          <div className="flex gap-2">
            <Input
              value={editForm.destination || ''}
              onChange={(e) => handleChange('destination', e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSelectDestination}
              title="Select destination folder"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">{t('settings.rules.edit.ruleMode')}</label>
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${editForm.type === 'ai' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleChange('type', 'ai')}
            >
              <Brain className="h-4 w-4" /> {t('settings.rules.edit.aiSmartSort')}
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${editForm.type !== 'ai' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleChange('type', 'extension')}
            >
              <Wrench className="h-4 w-4" /> {t('settings.rules.edit.manualCriteria')}
            </button>
          </div>
        </div>

        {editForm.type === 'ai' ? (
          <div className="grid gap-2 col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <label className="text-sm font-medium">Categories to Match</label>
            <div className="flex gap-2 items-end">
              <div className="grid gap-2 flex-1">
                <Input
                  placeholder="Categories e.g. Invoice, Contract, Personal"
                  value={editForm.aiPrompts?.join(', ') || ''}
                  onChange={(e) => handleAiPromptsChange(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSuggestCategories}
                title="Magic Suggest from Folder"
                className="shrink-0"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={editForm.aiPrompts?.includes(cat) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const current = editForm.aiPrompts || []
                    if (!current.includes(cat)) {
                      setEditForm((prev) => ({
                        ...prev,
                        aiPrompts: [...current, cat]
                      }))
                    } else {
                      setEditForm((prev) => ({
                        ...prev,
                        aiPrompts: current.filter((c) => c !== cat)
                      }))
                    }
                  }}
                >
                  {editForm.aiPrompts?.includes(cat) && (
                    <Check className="h-3 w-3 mr-1 inline-block" />
                  )}
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-900 mt-2">
              <strong>Note:</strong> First run will download the AI model (~50MB). Processing will
              be slower than standard rules.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 col-span-2 border p-4 rounded-lg bg-muted/20">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                {t('settings.rules.edit.matchingCondition')}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editForm.type || 'extension'}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="extension">{t('settings.rules.edit.fileExtension')}</option>
                <option value="name">{t('settings.rules.edit.fileName')}</option>
                <option value="size">{t('settings.rules.edit.fileSize')}</option>
                <option value="date">{t('settings.rules.edit.fileDate')}</option>
                <option value="fallback">{t('settings.rules.edit.fallback')}</option>
              </select>
            </div>

            <div className="grid gap-2">
              {editForm.type === 'extension' && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Extensions</label>
                  <Input
                    placeholder="e.g. txt, md, json"
                    value={editForm.extensions?.join(', ') || ''}
                    onChange={(e) => handleArrayChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma separated list of extensions.
                  </p>
                </div>
              )}
              {editForm.type === 'name' && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Pattern</label>
                  <Input
                    placeholder="Regex Pattern e.g. ^report_.*"
                    value={editForm.namePattern || ''}
                    onChange={(e) => handleChange('namePattern', e.target.value)}
                  />
                </div>
              )}
              {editForm.type === 'size' && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Size Range (Bytes)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={editForm.sizeMin || ''}
                      onChange={(e) => handleChange('sizeMin', parseInt(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={editForm.sizeMax || ''}
                      onChange={(e) => handleChange('sizeMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
              {editForm.type === 'date' && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Minimum Age</label>
                  <Input
                    type="number"
                    placeholder="Days old"
                    value={editForm.ageDays || ''}
                    onChange={(e) => handleChange('ageDays', parseInt(e.target.value))}
                  />
                </div>
              )}
              {editForm.type === 'fallback' && (
                <p className="text-sm text-muted-foreground italic">
                  Matches any file that was not matched by previous rules.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSaveEdit}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>
    </div>
  )
}
