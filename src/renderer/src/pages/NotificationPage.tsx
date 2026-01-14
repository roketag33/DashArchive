import React, { useEffect, useState } from 'react'
import { SmartPopup } from '../features/Onboarding/SmartPopup'
import type { UniversalScanResult } from '../../../shared/types'

export function NotificationPage(): React.JSX.Element {
  const [data, setData] = useState<UniversalScanResult | null>(null)

  useEffect(() => {
    console.log('[NotificationPage] Mounted!')
    document.body.classList.add('transparent-body')

    // Listen for data
    const cleanup = window.api.onNotificationData((receivedData) => {
      console.log('[NotificationPage] Notification received data', receivedData)
      setData(receivedData)
    })
    return () => {
      cleanup()
      document.body.classList.remove('transparent-body')
    }
  }, [])

  // In this detached window, "Dashboard" button should probably focus main window
  // But currently we don't have IPC for that.
  // Let's assume onDashboard just closes for now or we add 'notification:expand' later.
  const handleClose = (): void => {
    window.api.closeNotification()
  }

  // "Organize" should probably trigger apply AND close?
  // Or just apply.
  // Wait, apply logic is in main process or renderer?
  // It's `window.api.universalApply`. We can call it from here!
  const handleOrganize = async (): Promise<void> => {
    if (data) {
      await window.api.universalApply(data)
      window.api.closeNotification()
    }
  }

  if (!data) return <div className="p-4 text-white">Loading...</div>

  // We reuse SmartPopup but we might need to adjust it to fill the window
  // Since the window IS the notification size (approx), we remove fixed positioning?
  // SmartPopup currently has `fixed bottom-4 right-4`.
  // We should make SmartPopup flexible or wrap it.
  // Actually, `NotificationWindow` is transparent and click-through?
  // No, `NotificationWindow` provided `width: 400, height: 300`.
  // And `SmartPopup` is `w-[350px]`.
  // If we render SmartPopup as is (fixed positioning), it might look weird inside a small window.
  // It's better to modify SmartPopup to support "embedded" mode or just override styles here.
  // But for now, let's see.
  // If SmartPopup uses `fixed`, it will be fixed relative to the NotificationWindow viewport.

  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <SmartPopup
        results={data}
        onOrganize={handleOrganize}
        onDashboard={handleClose}
        isEmbedded={true}
      />
    </div>
  )
}
