import React, { useState, useEffect, useCallback } from 'react'
import { Rule, AppSettings } from '../../../../shared/types'
import { Button } from '../../components/ui/button'
import { Switch } from '../../components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { RuleList } from './RuleList'
import { RuleEditor } from './RuleEditor'

export function SettingsPanel(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      const s = await window.api.getSettings()
      setSettings(s)
      setRules(s.rules)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load settings')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings()
  }, [loadSettings])

  const handleSaveAll = async (): Promise<void> => {
    if (!settings) return
    try {
      const newSettings = { ...settings, rules }
      await window.api.saveSettings(newSettings)
      toast.success(t('settings.saved'))
      navigate('/')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save settings')
    }
  }

  const handleDelete = (id: string): void => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const handleStartEdit = (rule: Rule): void => {
    setEditingRuleId(rule.id)
    setIsCreating(false)
  }

  const handleCancelEdit = (): void => {
    setEditingRuleId(null)
    setIsCreating(false)
  }

  const handleSaveRule = (updatedRule: Rule): void => {
    if (isCreating) {
      setRules([...rules, updatedRule])
    } else {
      setRules(rules.map((r) => (r.id === updatedRule.id ? updatedRule : r)))
    }
    setEditingRuleId(null)
    setIsCreating(false)
  }

  const handleAddRule = (): void => {
    const newRule: Rule = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Rule',
      isActive: true,
      priority: 0,
      type: 'extension',
      extensions: ['txt'],
      destination: 'NewFolder'
    }
    setIsCreating(true)
    setEditingRuleId(newRule.id)
    // We append nicely, but if we want inline creation, we need to handle it in List or separate block
    // For now, let's just use the Editor directly if creating, or add to list and edit?
    // Let's add to list (temporary state) to reuse List logic or show Editor above list.
    // Easier: Show editor above list if creating.
    // BUT: The newRule is not in 'rules' yet.
  }

  const handleToggleActive = (rule: Rule): void => {
    setRules(rules.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)))
  }

  if (!settings) return <div className="p-8 text-center">Loading settings...</div>

  // If creating, we need a dummy rule object to pass to Editor
  const newRuleTemplate: Rule = {
    id: 'temp-new',
    name: '',
    isActive: true,
    priority: 0,
    type: 'extension',
    extensions: [],
    destination: ''
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 animate-in fade-in-0 slide-in-from-bottom-4">
      <Card className="flex flex-col shadow-lg border-0 bg-background">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="grid gap-1">
            <CardTitle>{t('settings.title')}</CardTitle>
            <CardDescription>{t('settings.description')}</CardDescription>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('settings.preferences.title')}</h3>
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  {t('settings.preferences.darkMode')}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.preferences.darkModeDesc')}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {t('settings.rules.title')} ({rules.length})
              </h3>
              {!isCreating && (
                <Button onClick={handleAddRule} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> {t('settings.rules.add')}
                </Button>
              )}
            </div>

            {isCreating && (
              <div className="mb-4">
                <RuleEditor
                  initialRule={newRuleTemplate}
                  onSave={handleSaveRule}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}

            <RuleList
              rules={rules}
              editingRuleId={editingRuleId}
              onEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveRule={handleSaveRule}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2 bg-muted/50 rounded-b-lg">
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleSaveAll}>{t('settings.saveChanges')}</Button>
        </div>
      </Card>
    </div>
  )
}
