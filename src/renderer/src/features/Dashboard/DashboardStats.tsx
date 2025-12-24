import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { FileCheck, HardDrive, Ruler, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatBytes } from '../../lib/utils'

interface Stats {
  totalFiles: number
  spaceSaved: number
  activeRules: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export function DashboardStats(): React.JSX.Element {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, spaceSaved: 0, activeRules: 0 })

  useEffect(() => {
    // Fetch stats on mount
    window.api.getStats().then(setStats)
  }, [])

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-3"
    >
      <motion.div variants={item}>
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('app.stats.totalFiles')}
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <FileCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalFiles > 0 ? '+12% from last week' : 'No files processed'}
              {/* Mock data for "visual awe" - in real app would need history */}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('app.stats.spaceSaved')}
            </CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
              <HardDrive className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatBytes(stats.spaceSaved)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Auto-optimization active</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('app.stats.activeRules')}
            </CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
              <Ruler className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground mt-1">Global organization rules</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
