import React from 'react'
import { Plan } from '../../../shared/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

import { Badge } from './ui/badge'
import { ArrowRight } from 'lucide-react'

interface Props {
  plan: Plan
  onConfirm: () => void
  onCancel: () => void
  isExecuting?: boolean
}

export function PlanPreview({ plan, onConfirm, onCancel, isExecuting }: Props): React.JSX.Element {
  const validMoves = plan.items.filter((i) => i.status === 'ok')
  const conflicts = plan.items.filter((i) => i.status === 'conflict')

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Review Organization Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Card className="flex-1 bg-secondary/20 border-secondary">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{validMoves.length}</div>
              <div className="text-sm text-muted-foreground">Files to Move</div>
            </CardContent>
          </Card>
          {conflicts.length > 0 && (
            <Card className="flex-1 bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{conflicts.length}</div>
                <div className="text-sm text-muted-foreground">Conflicts</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="border rounded-md max-h-[400px] overflow-auto">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="p-3 font-medium text-muted-foreground w-[25%]">File</th>
                <th className="p-3 font-medium text-muted-foreground w-[35%]">Current Location</th>
                <th className="p-3 font-medium text-muted-foreground w-[40%]">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plan.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium truncate" title={item.file.name}>{item.file.name}</td>
                  <td
                    className="p-3 text-muted-foreground truncate"
                    title={item.file.path}
                  >
                    {item.file.path}
                  </td>
                  <td className="p-3">
                    <div
                      className="flex items-center gap-2 text-primary truncate"
                      title={item.destinationPath}
                    >
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.destinationPath}</span>
                      {item.status === 'conflict' && (
                        <Badge variant="destructive" className="ml-2 text-[10px] h-5 shrink-0">
                          Rename
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isExecuting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isExecuting || plan.items.length === 0}>
            {isExecuting ? 'Organizing...' : 'Confirm & Organize'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
