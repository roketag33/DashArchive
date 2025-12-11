import React, { useState, useEffect, useCallback } from 'react'
import { JournalEntry } from '../../../../shared/types'
import { CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'

export function HistoryPanel(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [history, setHistory] = useState<JournalEntry[]>([])

  const loadHistory = useCallback(async (): Promise<void> => {
    try {
      const h = await window.api.getHistory()
      setHistory(h)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load history')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory()
  }, [loadHistory])

  const handleUndo = async (entry: JournalEntry): Promise<void> => {
    try {
      const result = await window.api.undoPlan(entry.plan)
      if (result.success) {
        await window.api.markReverted(entry.id)
        loadHistory()
        toast.success(t('history.undoSuccess'))
      } else {
        toast.error('Undo failed: ' + result.errors.map((e) => e.error).join(', '))
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to undo')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 animate-in fade-in-0 slide-in-from-bottom-4">
      <Card className="flex flex-col shadow-lg border-0 bg-background">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle>{t('history.title')}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('history.noHistory')}</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded border ${entry.status === 'reverted' ? 'bg-muted opacity-60' : 'bg-card'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        {entry.status === 'reverted' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                            {t('history.reverted')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {t('history.processed', { count: entry.plan.totalFiles })}
                      </p>
                    </div>
                    {entry.status === 'revertible' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUndo(entry)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> {t('history.undo')}
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-500" />
                    Completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
