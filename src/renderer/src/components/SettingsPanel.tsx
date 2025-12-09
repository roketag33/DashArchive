import React, { useState, useEffect } from 'react'
import { Rule, AppSettings } from '../../../shared/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { X, Plus, Trash2, Edit2, Save, FolderOpen, Wand2 } from 'lucide-react'

interface Props {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
  onClose: () => void
}

export function SettingsPanel({ settings, onSave, onClose }: Props): React.JSX.Element {
  const [rules, setRules] = useState<Rule[]>(settings.rules)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)

  // Form state for editing
  const [editForm, setEditForm] = useState<Partial<Rule>>({})

  useEffect(() => {
    setRules(settings.rules)
  }, [settings])

  const handleSave = (): void => {
    onSave({ ...settings, rules })
    onClose()
  }

  const handleDelete = (id: string): void => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const handleStartEdit = (rule: Rule): void => {
    setEditingRuleId(rule.id)
    setEditForm({ ...rule })
  }

  const handleCancelEdit = (): void => {
    setEditingRuleId(null)
    setEditForm({})
  }

  const handleSaveEdit = (): void => {
    if (!editingRuleId || !editForm) return

    setRules(rules.map((r) => (r.id === editingRuleId ? ({ ...r, ...editForm } as Rule) : r)))
    setEditingRuleId(null)
    setEditForm({})
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
    setRules([...rules, newRule])
    handleStartEdit(newRule)
  }

  const handleChange = (field: keyof Rule, value: string | string[] | number): void => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  // Helper for array inputs (extensions)
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
    // @ts-ignore (api exposed in preload)
    const path = await window.api.selectFolder()
    if (path) {
      handleChange('destination', path)
    }
  }

  const handleSuggestCategories = async (): Promise<void> => {
    // @ts-ignore
    const folder = await window.api.selectFolder()
    if (!folder) return

    // Show loading state could be here, but for now blocking sync is 'ok' for MVP.
    // Ideally use a toast or loading state on button.
    try {
      // @ts-ignore
      const suggestions = await window.api.suggestAiCategories(folder)
      if (suggestions && suggestions.length > 0) {
        const current = editForm.aiPrompts || []
        // Merge unique
        const combined = Array.from(new Set([...current, ...suggestions]))
        setEditForm((prev) => ({ ...prev, aiPrompts: combined }))
      } else {
        alert('No common document categories found in sample.')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to analyze folder.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in-0">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="grid gap-1">
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your organization rules and preferences.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferences</h3>
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Dark Mode
                </label>
                <p className="text-sm text-muted-foreground">Enable dark theme for the interface</p>
              </div>
              <Switch
                data-testid="dark-mode-toggle"
                checked={settings.theme === 'dark'}
                onChange={(e) =>
                  onSave({ ...settings, theme: e.target.checked ? 'dark' : 'light' })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Rules ({rules.length})</h3>
              <Button onClick={handleAddRule} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`transition-colors ${!rule.isActive ? 'opacity-60 bg-muted/50' : ''}`}
                >
                  <CardContent className="p-4">
                    {editingRuleId === rule.id ? (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              value={editForm.name || ''}
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
                            <label className="text-sm font-medium">Rule Mode</label>
                            <div className="flex p-1 bg-muted rounded-lg">
                              <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editForm.type === 'ai' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => handleChange('type', 'ai')}
                              >
                                🧠 AI Smart Sort
                              </button>
                              <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editForm.type !== 'ai' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => handleChange('type', 'extension')}
                              >
                                🛠️ Manual Criteria
                              </button>
                            </div>
                          </div>

                          {editForm.type === 'ai' ? (
                            <div className="grid gap-2 col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                              <label className="text-sm font-medium">Categories to Match</label>
                              <div className="flex gap-2 items-end">
                                <div className="grid gap-2 flex-1">
                                  <Input
                                    placeholder="e.g. Invoice, Contract, Personal, Receipt"
                                    value={editForm.aiPrompts?.join(', ') || ''}
                                    onChange={(e) => handleAiPromptsChange(e.target.value)}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={handleSuggestCategories}
                                  title="✨ Magic Suggest from Folder"
                                  className="shrink-0 bg-background"
                                >
                                  <Wand2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground flex gap-2 items-start mt-2">
                                <div className="bg-yellow-100 dark:bg-yellow-900/40 p-1 rounded text-yellow-700 dark:text-yellow-400">
                                  ⚠️
                                </div>
                                <div>
                                  <strong>Local AI Model:</strong> First run downloads ~50MB. Analysis takes 1-2s per file.
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid gap-4 col-span-2 border p-4 rounded-lg bg-muted/20">
                              <div className="grid gap-2">
                                <label className="text-sm font-medium">Matching Condition</label>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  // @ts-ignore - RuleType includes ai but linter is confused
                                  value={editForm.type === 'ai' ? 'extension' : editForm.type}
                                  onChange={(e) => handleChange('type', e.target.value)}
                                >
                                  <option value="extension">File Extension</option>
                                  <option value="name">File Name (Regex)</option>
                                  <option value="size">File Size</option>
                                  <option value="date">File Date (Age)</option>
                                  <option value="fallback">Everything Else (Fallback)</option>
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
                                    <p className="text-xs text-muted-foreground">Comma separated list of extensions.</p>
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
                                        onChange={(e) =>
                                          handleChange('sizeMin', parseInt(e.target.value))
                                        }
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Max"
                                        value={editForm.sizeMax || ''}
                                        onChange={(e) =>
                                          handleChange('sizeMax', parseInt(e.target.value))
                                        }
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
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="mr-2 h-4 w-4" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="grid gap-1">
                          <div className="font-semibold flex items-center gap-2">
                            {rule.name}
                            <Badge variant="outline">{rule.type}</Badge>
                            {!rule.isActive && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rule.type === 'extension' && (
                              <span>Extensions: {rule.extensions?.join(', ')}</span>
                            )}
                            {rule.type === 'name' && <span>Pattern: {rule.namePattern}</span>}
                            {rule.type === 'ai' && <span>AI: {rule.aiPrompts?.join(', ')}</span>}
                            <span className="mx-2">→</span>
                            <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                              {rule.destination}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={rule.isActive ? 'text-green-600' : 'text-muted-foreground'}
                            onClick={() =>
                              setRules(
                                rules.map((r) =>
                                  r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                                )
                              )
                            }
                          >
                            {rule.isActive ? 'Active' : 'Enable'}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStartEdit(rule)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rule.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2 bg-muted/50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}
