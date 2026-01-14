import React from 'react'
import { motion } from 'framer-motion'
import { Ghost, FileText, Image, Box, Check } from 'lucide-react'
import { UniversalScanResult } from '../../../../shared/types'
import { cn } from '../../lib/utils'

interface SmartPopupProps {
  results: UniversalScanResult
  onOrganize: () => void
  onDashboard: () => void
  isEmbedded?: boolean
}

export function SmartPopup({
  results,
  onOrganize,
  onDashboard,
  isEmbedded = false
}: SmartPopupProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={cn(
        'bg-background border border-border rounded-xl shadow-lg overflow-hidden',
        isEmbedded
          ? 'relative w-full h-full rounded-none border-0 shadow-none'
          : 'fixed bottom-4 right-4 z-[100] w-[350px]'
      )}
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-center gap-3 border-b border-border bg-muted/40">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
          <Ghost className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold leading-none">Analyse Terminée</h2>
        </div>
        <button
          onClick={onDashboard}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          {/* Close/Dismiss icon could go here, for now reusing Dashboard action implicitly or just letting logic handle it */}
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-bold">{results.totalDetected} fichiers</span>{' '}
          trouvés.
        </p>

        {/* Mini Visual Stats */}
        <div className="flex gap-2 justify-between">
          <StatItem
            icon={FileText}
            count={results.stats['admin'] || 0}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatItem
            icon={Image}
            count={results.stats['media'] || 0}
            color="text-pink-400"
            bg="bg-pink-500/10"
          />
          <StatItem
            icon={Box}
            count={results.stats['misc'] || 0}
            color="text-yellow-400"
            bg="bg-yellow-500/10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-muted/40 flex gap-2">
        <button
          onClick={onDashboard}
          className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
        >
          Voir
        </button>
        <button
          onClick={onOrganize}
          className="flex-[2] py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-3 h-3" /> Ranger
        </button>
      </div>
    </motion.div>
  )
}

function StatItem({
  icon: Icon,
  count,
  color,
  bg
}: {
  icon: React.ElementType
  count: number
  color: string
  bg: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex-1 p-2 rounded-lg flex flex-col items-center gap-0.5 border border-border/5',
        bg
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', color)} />
      <span className={cn('font-bold text-sm', color)}>{count}</span>
    </div>
  )
}
