import React, { useState, useEffect } from 'react'
import { Rule, AppSettings } from '../../../shared/types'

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="flex items-center justify-between border p-4 rounded bg-gray-50">
              <div>
                <div className="font-bold">Dark Mode</div>
                <div className="text-sm text-gray-600">Enable dark theme for the interface</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.theme === 'dark'}
                  onChange={(e) =>
                    onSave({ ...settings, theme: e.target.checked ? 'dark' : 'light' })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rules ({rules.length})</h3>
            <button
              onClick={handleAddRule}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              + Add Rule
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`border rounded p-4 ${!rule.isActive ? 'opacity-50' : ''}`}
              >
                {editingRuleId === rule.id ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Name</label>
                      <input
                        className="border w-full p-1 rounded"
                        value={editForm.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Destination</label>
                      <input
                        className="border w-full p-1 rounded"
                        value={editForm.destination || ''}
                        onChange={(e) => handleChange('destination', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Type</label>
                      <select
                        className="border w-full p-1 rounded"
                        value={editForm.type || 'extension'}
                        onChange={(e) => handleChange('type', e.target.value)}
                      >
                        <option value="extension">Extension</option>
                        <option value="name">Name Pattern</option>
                        <option value="size">Size</option>
                        <option value="date">Date (Age)</option>
                        <option value="category">Category</option>
                        <option value="fallback">Fallback</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold mb-1">Type Specific Config</label>

                      {editForm.type === 'extension' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Extensions (comma sep)
                          </label>
                          <input
                            className="border w-full p-1 rounded"
                            value={editForm.extensions?.join(', ') || ''}
                            onChange={(e) => handleArrayChange(e.target.value)}
                          />
                        </div>
                      )}

                      {editForm.type === 'name' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Name Regex Pattern
                          </label>
                          <input
                            className="border w-full p-1 rounded font-mono text-sm"
                            placeholder="^report_.*"
                            value={editForm.namePattern || ''}
                            onChange={(e) => handleChange('namePattern', e.target.value)}
                          />
                        </div>
                      )}

                      {editForm.type === 'size' && (
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Min Size (bytes)
                            </label>
                            <input
                              type="number"
                              className="border w-full p-1 rounded"
                              value={editForm.sizeMin || ''}
                              onChange={(e) => handleChange('sizeMin', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Max Size (bytes)
                            </label>
                            <input
                              type="number"
                              className="border w-full p-1 rounded"
                              value={editForm.sizeMax || ''}
                              onChange={(e) => handleChange('sizeMax', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      )}

                      {editForm.type === 'date' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Older than (days)
                          </label>
                          <input
                            type="number"
                            className="border w-full p-1 rounded"
                            value={editForm.ageDays || ''}
                            onChange={(e) => handleChange('ageDays', parseInt(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 mt-2">
                      <button onClick={handleCancelEdit} className="text-gray-500 text-sm">
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">
                        {rule.name}{' '}
                        <span className="text-xs font-normal text-gray-500">({rule.type})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {rule.type === 'extension' ? `[${rule.extensions?.join(', ')}]` : ''}→{' '}
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          {rule.destination}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setRules(
                            rules.map((r) =>
                              r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                            )
                          )
                        }
                        className={`text-sm px-2 py-1 rounded border ${rule.isActive ? 'text-green-600 border-green-200' : 'text-gray-400 border-gray-200'}`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleStartEdit(rule)}
                        className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
