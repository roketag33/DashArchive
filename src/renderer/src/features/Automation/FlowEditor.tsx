import React, { useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Zap } from 'lucide-react'

const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Quand un fichier est ajouté... (Trigger)' },
    type: 'input'
  },
  {
    id: '2',
    position: { x: 100, y: 300 },
    data: { label: "Si c'est une Facture (Condition)" }
  },
  {
    id: '3',
    position: { x: 100, y: 500 },
    data: { label: 'Déplacer vers "Comptabilité" (Action)' },
    type: 'output'
  }
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }]

export function FlowEditor(): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds) as any),
    [setEdges]
  )

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automation Lab</h2>
          <p className="text-muted-foreground">
            Créez des règles visuelles pour automatiser vos fichiers.
          </p>
        </div>
      </div>

      <div className="h-[600px] bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden glass-panel relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-background/40"
        >
          <Background gap={12} size={1} />
          <Controls className="fill-foreground text-foreground" />
        </ReactFlow>

        <div className="absolute top-4 right-4 bg-popover/80 backdrop-blur border border-border p-3 rounded-lg text-xs max-w-[200px] shadow-lg">
          <p className="font-semibold mb-1">Status: Prototype</p>
          <p className="text-muted-foreground">
            Ceci est une démo de l&apos;éditeur visuel. Les règles ne sont pas encore exécutées.
          </p>
        </div>
      </div>
    </div>
  )
}
