import React from 'react'
import { Rule } from '../../../../shared/types'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Trash2, Edit2, ArrowRight } from 'lucide-react'
import { RuleEditor } from './RuleEditor'

interface RuleListProps {
  rules: Rule[]
  editingRuleId: string | null
  onEdit: (rule: Rule) => void
  onCancelEdit: () => void
  onSaveRule: (rule: Rule) => void
  onDelete: (id: string) => void
  onToggleActive: (rule: Rule) => void
}

export function RuleList({
  rules,
  editingRuleId,
  onEdit,
  onCancelEdit,
  onSaveRule,
  onDelete,
  onToggleActive
}: RuleListProps): React.JSX.Element {
  return (
    <div className="grid gap-4">
      {rules.map((rule) => (
        <Card
          key={rule.id}
          className={`transition-colors ${!rule.isActive ? 'opacity-60 bg-muted/50' : ''}`}
        >
          <CardContent className="p-4">
            {editingRuleId === rule.id ? (
              <RuleEditor initialRule={rule} onSave={onSaveRule} onCancel={onCancelEdit} />
            ) : (
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <div className="font-semibold flex items-center gap-2">
                    {rule.name}
                    <Badge variant="outline">{rule.type}</Badge>
                    {!rule.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {rule.type === 'extension' && (
                      <span>Extensions: {rule.extensions?.join(', ')}</span>
                    )}
                    {rule.type === 'name' && <span>Pattern: {rule.namePattern}</span>}
                    {rule.type === 'ai' && <span>AI: {rule.aiPrompts?.join(', ')}</span>}
                    <ArrowRight className="h-3 w-3 mx-1" />
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                      {rule.destination}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={rule.isActive ? 'text-green-600' : 'text-muted-foreground'}
                    onClick={() => onToggleActive(rule)}
                  >
                    {rule.isActive ? 'Active' : 'Enable'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
