import React, { useState } from 'react'
import { Rule } from '../../../../shared/types'
import { COMMON_CATEGORIES } from '../../../../shared/constants'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { FolderOpen, Brain, Wrench, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface RuleEditorProps {
  initialRule: Rule
  onSave: (rule: Rule) => void
  onCancel: () => void
}

const COMMON_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'png', 'zip', 'mp4', 'mp3']

export function RuleEditor({ initialRule, onSave, onCancel }: RuleEditorProps): React.JSX.Element {
  const { t } = useTranslation()
  const [editForm, setEditForm] = useState<Partial<Rule>>({ ...initialRule })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [extInput, setExtInput] = useState('')

  const handleChange = (field: keyof Rule, value: string | string[] | number): void => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddExtension = (ext: string): void => {
    const clean = ext.trim().toLowerCase().replace(/^\./, '')
    if (!clean) return
    const current = editForm.extensions || []
    if (!current.includes(clean)) {
      setEditForm((prev) => ({ ...prev, extensions: [...current, clean] }))
    }
  }

  const handleRemoveExtension = (ext: string): void => {
    setEditForm((prev) => ({
      ...prev,
      extensions: (prev.extensions || []).filter((e) => e !== ext)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddExtension(extInput)
      setExtInput('')
    }
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

  /*
  // Disabled: Feature not yet wired to UI
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
  */

  const handleSaveEdit = (): void => {
    if (!editForm.name || editForm.name.trim() === '') {
      toast.error('Rule name cannot be empty')
      return
    }
    // Merge back to a full Rule object
    onSave({ ...initialRule, ...editForm } as Rule)
  }

  const isSimpleExtensionRule = editForm.type === 'extension' || !editForm.type

  return (
    <div className="flex flex-col gap-4 border p-6 rounded-xl bg-card shadow-sm animate-in fade-in zoom-in-95 duration-200">
      {/* Header / Name */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('settings.rules.edit.name')}
        </label>
        <Input
          className="text-lg font-medium border-0 border-b rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 transition-colors bg-transparent"
          placeholder="ex: Documents Personnels"
          value={editForm.name}
          onChange={(e) => handleChange('name', e.target.value)}
          autoFocus
        />
      </div>

      {/* Simplified Main Logic */}
      {isSimpleExtensionRule ? (
        <div className="grid gap-6 py-2">
          {/* Extensions visual input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fichiers concernés (extensions)</Label>
              <div className="flex gap-1">
                {COMMON_EXTENSIONS.slice(0, 4).map((ext) => (
                  <button
                    key={ext}
                    onClick={() => handleAddExtension(ext)}
                    className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition-colors"
                  >
                    +{ext}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[42px] p-2 rounded-lg border bg-background flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {(editForm.extensions || []).map((ext) => (
                <Badge
                  key={ext}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1 text-sm font-normal"
                >
                  .{ext}
                  <button
                    onClick={() => handleRemoveExtension(ext)}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <input
                className="flex-1 bg-transparent min-w-[60px] outline-none text-sm placeholder:text-muted-foreground/50"
                placeholder={
                  (editForm.extensions || []).length === 0
                    ? 'Ajouter une extension (ex: pdf) + Entrée'
                    : ''
                }
                value={extInput}
                onChange={(e) => setExtInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (extInput) {
                    handleAddExtension(extInput)
                    setExtInput('')
                  }
                }}
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Déplacer vers</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  className="pl-9 bg-muted/20 border-muted-foreground/20"
                  value={editForm.destination || ''}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  placeholder="Choisir un dossier..."
                />
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="secondary" onClick={handleSelectDestination}>
                Parcourir
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback for AI/Complex modes - just a placeholder or the simplified AI view */
        <div className="p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
          Mode avancé activé. Utilisez les options ci-dessous pour modifier la logique complexe.
        </div>
      )}

      {/* Footer / Advanced Toggle */}
      <div className="pt-2 border-t mt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          {showAdvanced ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {showAdvanced
            ? 'Masquer les options avancées'
            : 'Options avancées (conflits, mode IA, regex...)'}
        </button>

        {showAdvanced && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-top-2">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">{t('settings.labelColor')}</Label>
              <div className="flex flex-wrap gap-2">
                {['none', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Gray'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => handleChange('labelColor', color)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        editForm.labelColor === color
                          ? 'border-primary scale-110 shadow-sm'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: color === 'none' ? 'transparent' : color.toLowerCase()
                      }}
                      title={color}
                    >
                      {color === 'none' && <X className="w-4 h-4 m-auto text-muted-foreground" />}
                    </button>
                  )
                )}
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

            {/* Legacy/Detailed manual criteria fields if type is strangely set to name/size/etc */}
            {!isSimpleExtensionRule && editForm.type !== 'ai' && (
              <div className="grid gap-2 p-4 border rounded bg-muted/10">
                <Label>Condition Type</Label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={editForm.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="name">Nom du fichier (Regex)</option>
                  <option value="size">Taille</option>
                  <option value="date">Date</option>
                </select>
                {/* Specific inputs for regex/size would go here or be revealed */}
                {editForm.type === 'name' && (
                  <Input
                    placeholder="Regex Pattern"
                    value={editForm.namePattern || ''}
                    onChange={(e) => handleChange('namePattern', e.target.value)}
                  />
                )}
              </div>
            )}

            {editForm.type === 'ai' && (
              <div className="grid gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg">
                <Label>Catégories (Prompt)</Label>
                <Input
                  placeholder="e.g. Factures, Contrats"
                  value={editForm.aiPrompts?.join(', ') || ''}
                  onChange={(e) => handleAiPromptsChange(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {COMMON_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() =>
                        handleAiPromptsChange((editForm.aiPrompts || []).concat(cat).join(','))
                      }
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
          Annuler
        </Button>
        <Button onClick={handleSaveEdit} className="min-w-[100px] shadow-lg shadow-primary/20">
          Enregistrer
        </Button>
      </div>
    </div>
  )
}
