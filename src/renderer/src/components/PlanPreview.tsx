import React from 'react'
import { Plan } from '../../../shared/types'

interface Props {
  plan: Plan
  onConfirm: () => void
  onCancel: () => void
  isExecuting?: boolean
}

export function PlanPreview({ plan, onConfirm, onCancel, isExecuting }: Props): React.JSX.Element {
  const validMoves = plan.items.filter((i) => i.status === 'ok')
  const conflicts = plan.items.filter((i) => i.status === 'conflict')
  // const warnings = plan.items.filter(i => i.warning);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Review Organization Plan</h2>

      <div className="flex gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded text-center flex-1">
          <div className="text-2xl font-bold text-blue-600">{validMoves.length}</div>
          <div className="text-sm text-gray-600">Files to Move</div>
        </div>
        {conflicts.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded text-center flex-1">
            <div className="text-2xl font-bold text-yellow-600">{conflicts.length}</div>
            <div className="text-sm text-gray-600">Conflicts (will be renamed)</div>
          </div>
        )}
      </div>

      <div className="border rounded max-h-[400px] overflow-auto mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2">File</th>
              <th className="p-2">Current Location</th>
              <th className="p-2">New Location</th>
            </tr>
          </thead>
          <tbody>
            {plan.items.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{item.file.name}</td>
                <td className="p-2 text-gray-500 truncate max-w-[150px]" title={item.file.path}>
                  {item.file.path}
                </td>
                <td
                  className="p-2 text-blue-600 truncate max-w-[250px]"
                  title={item.destinationPath}
                >
                  {item.destinationPath}
                  {item.status === 'conflict' && (
                    <span className="text-yellow-500 text-xs ml-2">(rename)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isExecuting}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isExecuting || plan.items.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isExecuting ? 'Organizing...' : 'Confirm & Organize'}
        </button>
      </div>
    </div>
  )
}
