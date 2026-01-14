import React, { useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'

export function Onboarding(): React.ReactNode {
  const { updateSettings } = useSettings()

  useEffect(() => {
    const handleFinish = async (): Promise<void> => {
      await updateSettings({ firstRun: false })
    }

    const startSilentScan = async (): Promise<void> => {
      try {
        // 1. Get System Paths
        const paths = await window.api.getSystemPaths()
        const targets = [paths.downloads, paths.desktop]

        // 2. Run Universal Scan
        // Artificial delay for UX
        const [results] = await Promise.all([
          window.api.universalScan(targets),
          new Promise((resolve) => setTimeout(resolve, 2000))
        ])

        if (results.totalDetected > 0) {
          // Trigger Desktop Notification Window
          window.api.showNotification(results)
          // Mark as "handled" locally so we don't show anything?
          // Actually we can just update settings to firstRun: false immediately
          // OR let the user do it via notification actions.
          // Better: let notification actions handle it.
          // But if user ignores? "Ghost Mode" runs every time?
          // Settings says 'firstRun'.
          // For 'manual trigger' (via settings), we probably want it to run.
        } else {
          // Nothing found, silent finish
          handleFinish()
        }
      } catch (error) {
        console.error('Silent scan failed:', error)
        handleFinish()
      }
    }

    startSilentScan()
  }, [updateSettings])

  // This component is now purely logic + IPC trigger. It renders nothing visible.
  return null
}
