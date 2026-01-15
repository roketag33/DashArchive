import React, { useState } from 'react'
import { Sparkles, Play, Check, AlertTriangle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ToolExecutionCardProps {
  tool: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any
  onExecute: () => Promise<void>
  onRefuse: () => void
}

export function ToolExecutionCard({
  tool,
  args,
  onExecute,
  onRefuse
}: ToolExecutionCardProps): React.JSX.Element {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleExecute = async () => {
    setStatus('running')
    try {
      await onExecute()
      setStatus('success')
    } catch (e) {
      console.error(e)
      setStatus('error')
      let msg = e instanceof Error ? e.message : String(e)

      // Clean up Electron error prefix
      if (msg.includes('Error invoking remote method')) {
        const parts = msg.split('Error:')
        // Take the last meaningful part
        msg = parts[parts.length - 1].trim()
      }
      setErrorMessage(msg)
    }
  }

  // Helper to generate friendly description
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getActionDescription = () => {
    if (tool === 'organize_folder') {
      return `Trier le dossier "${args.path}" par ${args.strategy === 'date' ? 'Date' : 'Type'}`
    }
    if (tool === 'merge_folders') {
      return `Fusionner ${args.sources?.length} dossiers vers "${args.destination}"`
    }
    return tool
  }

  return (
    <div
      className={cn(
        'mt-4 p-4 border rounded-xl relative overflow-hidden transition-all duration-300',
        status === 'success'
          ? 'bg-green-500/10 border-green-500/30'
          : status === 'error'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-purple-500/10 border-purple-500/30'
      )}
    >
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <Sparkles
          className={cn(
            'h-12 w-12',
            status === 'success'
              ? 'text-green-500'
              : status === 'error'
                ? 'text-red-500'
                : 'text-purple-500'
          )}
        />
      </div>

      <div className="relative z-10">
        <h4
          className={cn(
            'text-sm font-semibold mb-2 flex items-center gap-2',
            status === 'success'
              ? 'text-green-200'
              : status === 'error'
                ? 'text-red-200'
                : 'text-purple-200'
          )}
        >
          {status === 'success' ? (
            <Check className="w-4 h-4" />
          ) : status === 'error' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}

          {status === 'success'
            ? 'Action Terminée'
            : status === 'error'
              ? 'Erreur'
              : 'Action Proposée'}
        </h4>

        <p className="text-sm opacity-90 mb-4 font-medium">{getActionDescription()}</p>

        {status === 'error' && (
          <div className="mb-4 p-3 bg-red-950/40 rounded-lg border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Details Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] uppercase tracking-wider font-bold opacity-50 hover:opacity-100 flex items-center gap-1 transition-opacity"
          >
            {showDetails ? 'Masquer les détails techniques' : 'Voir les détails techniques'}
            <Play
              className={cn('w-2 h-2 transition-transform', showDetails ? 'rotate-90' : 'rotate-0')}
            />
          </button>

          {showDetails && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="text-[10px] bg-black/40 p-2 rounded border border-white/5 mt-2 overflow-x-auto text-muted-foreground font-mono"
            >
              {JSON.stringify(args, null, 2)}
            </motion.pre>
          )}
        </div>

        <div className="flex gap-2">
          {status === 'idle' && (
            <>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg shadow-purple-900/20"
                onClick={handleExecute}
              >
                <Play className="w-3 h-3 mr-1.5" /> Confirmer
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={onRefuse}>
                Annuler
              </Button>
            </>
          )}

          {status === 'running' && (
            <Button size="sm" disabled className="bg-purple-600/50 text-white cursor-wait">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="mr-2"
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
              Traitement en cours...
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
