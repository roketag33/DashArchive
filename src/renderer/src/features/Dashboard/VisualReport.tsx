import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, FileText, Image, Box, Shield } from 'lucide-react'
import { UniversalScanResult, ProposedMove } from '../../../../shared/types'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'

interface VisualReportProps {
  results: UniversalScanResult
  onConfirm: () => void
  onCancel: () => void
}

export function VisualReport({
  results,
  onConfirm,
  onCancel
}: VisualReportProps): React.JSX.Element {
  // Group moves by Rule ID (Category)
  const groupedMoves = useMemo(() => {
    const groups: { [key: string]: ProposedMove[] } = {}
    results.moves.forEach((move) => {
      if (!groups[move.ruleId]) groups[move.ruleId] = []
      groups[move.ruleId].push(move)
    })
    return groups
  }, [results])

  const categories = [
    {
      id: 'admin',
      label: 'Administratif',
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'media',
      label: 'Photos & Médias',
      icon: Image,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    },
    {
      id: 'misc',
      label: 'Divers & Vrac',
      icon: Box,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    }
  ]

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            Rapport de confiance
          </h2>
          <p className="text-muted-foreground text-lg">
            Voici ce que l&apos;IA propose pour organiser vos {results.totalDetected} fichiers
            détectés.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Ignorer pour l&apos;instant
          </Button>
          <Button
            size="lg"
            onClick={onConfirm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <Check className="w-5 h-5 mr-2" />
            Valider et Ranger
          </Button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const files = groupedMoves[cat.id] || []
          if (files.length === 0) return null

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              <div className={cn('p-4 border-b border-border/50 flex items-center gap-3', cat.bg)}>
                <cat.icon className={cn('w-5 h-5', cat.color)} />
                <h3 className="font-bold text-lg">{cat.label}</h3>
                <span className="ml-auto text-xs font-mono bg-background/50 px-2 py-1 rounded-full opacity-70">
                  {files.length} fichiers
                </span>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {files.map((move, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="truncate font-medium">{move.file.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs shrink-0">
                      <ArrowRight className="w-3 h-3 opacity-50" />
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                        {move.targetFolder.split('/').pop()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-muted/30 border border-border/50 rounded-xl p-6 flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm max-w-xl">
          En validant, ces fichiers seront déplacés vers leurs dossiers respectifs. Vous pourrez
          toujours annuler cette action depuis l&apos;historique ou ajuster les règles plus tard.
        </p>
      </div>
    </div>
  )
}
