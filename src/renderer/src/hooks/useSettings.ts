import { useState, useEffect, useCallback } from 'react'
import { AppSettings } from '../../../shared/types'
import { toast } from 'sonner'

interface UseSettingsResult {
  settings: AppSettings | null
  loading: boolean
  error: string | null
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>
  reload: () => Promise<void>
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const s = await window.api.getSettings()
      setSettings(s)
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Failed to load settings')
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()

    const handleUpdate = (): void => {
      void loadSettings()
    }
    window.addEventListener('settings-updated', handleUpdate)
    return () => window.removeEventListener('settings-updated', handleUpdate)
  }, [loadSettings])

  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>): Promise<void> => {
      if (!settings) return
      try {
        const merged = { ...settings, ...newSettings }
        const updated = await window.api.saveSettings(merged)
        setSettings(updated)
        // Dispatch a custom event so other hook instances know to reload
        window.dispatchEvent(new Event('settings-updated'))
      } catch (e) {
        console.error(e)
        toast.error('Failed to save settings')
        throw e
      }
    },
    [settings]
  )

  return {
    settings,
    loading,
    error,
    updateSettings,
    reload: loadSettings
  }
}
