import { JournalEntry } from '../../../../shared/types'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HistoryPanelProps {
  history: JournalEntry[]
  onUndo: (entry: JournalEntry) => void
  onClose: () => void
}

export function HistoryPanel({ history, onUndo, onClose }: HistoryPanelProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4 max-h-[80vh] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('history.title')}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t('history.noHistory')}
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded border dark:border-gray-700 ${entry.status === 'reverted' ? 'bg-gray-50 dark:bg-gray-900 opacity-75' : 'bg-gray-50 dark:bg-gray-700/50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    {entry.status === 'reverted' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        {t('history.reverted')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {t('history.processed', { count: entry.plan.totalFiles })}
                  </p>
                </div>
                {entry.status === 'revertible' && (
                  <button
                    onClick={() => onUndo(entry)}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <RotateCcw className="h-3 w-3" /> {t('history.undo')}
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-500" />
                {/* Assuming success if it's in history and not defaulted to failure, although JournalEntry doesn't explicitly store success boolean other than implied by existence */}
                {t('history.undoSuccess')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
