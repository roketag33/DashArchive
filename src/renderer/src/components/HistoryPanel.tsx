import { JournalEntry } from '../../../shared/types'

interface Props {
  history: JournalEntry[]
  onUndo: (entry: JournalEntry) => Promise<void>
  onClose: () => void
}

export function HistoryPanel({ history, onUndo, onClose }: Props): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">History / Journal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No organization history yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded p-4 flex justify-between items-center bg-gray-50"
                >
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      {entry.status === 'reverted' && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
                          Reverted
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Processed {entry.plan.totalFiles} files.
                    </div>
                  </div>

                  {entry.status === 'revertible' && (
                    <button
                      onClick={() => onUndo(entry)}
                      className="px-3 py-1 bg-gray-200 hover:bg-red-100 text-red-700 rounded text-sm transition-colors border border-gray-300 hover:border-red-200"
                    >
                      Undo
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
