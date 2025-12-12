import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { FileCheck, HardDrive, Ruler } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatBytes } from '../../lib/utils'

interface Stats {
  totalFiles: number
  spaceSaved: number
  activeRules: number
}

export function DashboardStats(): React.JSX.Element {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, spaceSaved: 0, activeRules: 0 })

  useEffect(() => {
    // Fetch stats on mount
    window.api.getStats().then(setStats)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('app.stats.totalFiles')}</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('app.stats.spaceSaved')}</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(stats.spaceSaved)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('app.stats.activeRules')}</CardTitle>
          <Ruler className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRules}</div>
        </CardContent>
      </Card>
    </div>
  )
}
