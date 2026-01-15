import React, { useState, useEffect, useCallback } from 'react'
import { Rule, AppSettings, ConflictResolution } from '../../../../shared/types'
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
  const { t, i18n } = useTranslation()
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

  if (!settings)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )

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
    <div className="container max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl">{t('settings.description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-background/50 backdrop-blur-sm border-border/50"
          >
            {t('settings.cancel')}
          </Button>
          <Button
            onClick={handleSaveAll}
            className="shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {t('settings.saveChanges')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Global Preferences Card */}
        <Card className="border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary text-xs">
                <Switch
                  id="pref-icon"
                  checked={true}
                  readOnly
                  className="pointer-events-none scale-75"
                />
              </span>
              {t('settings.preferences.title')}
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence et le comportement général.
            </CardDescription>
          </CardHeader>
          <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* Onboarding Reset */}
            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none text-blue-600 dark:text-blue-400">
                  Ghost Mode & Analyse
                </label>
                <p className="text-xs text-muted-foreground">
                  Relancez l&apos;analyse universelle (Ghost Mode) pour organiser vos fichiers.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await window.api.saveSettings({ ...settings, firstRun: true })
                    // Also trigger the scan via generic means if needed, but firstRun flag usually triggers it
                    window.location.reload()
                  } catch {
                    toast.error('Impossible de relancer le Ghost Mode')
                  }
                }}
                className="border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/50"
              >
                Relancer le Scan
              </Button>
            </div>

            {/* Restart Onboarding */}
            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none text-purple-600 dark:text-purple-400">
                  Assistant de Bienvenue
                </label>
                <p className="text-xs text-muted-foreground">
                  Relancer le questionnaire de démarrage (Briques de vie, IA...).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('dasharchive-onboarding-completed')
                  window.location.reload()
                }}
                className="border-purple-200 hover:bg-purple-100 dark:border-purple-800 dark:hover:bg-purple-900/50"
              >
                Recommencer
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  {t('settings.preferences.darkMode')}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.preferences.darkModeDesc')}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  {t('settings.preferences.language')}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.preferences.languageDesc')}
                </p>
              </div>
              <select
                className="h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  {t('app.conflictResolution')}
                </label>
                <p className="text-xs text-muted-foreground">{t('app.conflictResolutionDesc')}</p>
              </div>
              <select
                className="h-9 min-w-[200px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                value={settings?.conflictResolution || 'rename'}
                onChange={(e) =>
                  setSettings(
                    settings
                      ? { ...settings, conflictResolution: e.target.value as ConflictResolution }
                      : null
                  )
                }
              >
                <option value="rename">{t('app.conflictRename')}</option>
                <option value="overwrite">{t('app.conflictOverwrite')}</option>
                <option value="skip">{t('app.conflictSkip')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Rules Management Card */}
        <Card className="border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500 text-xs">
                  <Plus className="w-4 h-4" />
                </span>
                {t('settings.rules.title')}
                <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                  {rules.length}
                </span>
              </CardTitle>
              <CardDescription>
                Définissez comment vos fichiers doivent être organisés automatiquement.
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={handleAddRule} size="sm" className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> {t('settings.rules.add')}
              </Button>
            )}
          </CardHeader>

          <div className="p-6 flex-1 bg-muted/5">
            {isCreating ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-4 p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    Nouvelle Règle
                  </h4>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mb-4">
                    Créez une règle personnalisée pour trier vos fichiers.
                  </p>
                  <RuleEditor
                    initialRule={newRuleTemplate}
                    onSave={handleSaveRule}
                    onCancel={handleCancelEdit}
                  />
                </div>
              </div>
            ) : (
              <RuleList
                rules={rules}
                editingRuleId={editingRuleId}
                onEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveRule={handleSaveRule}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
