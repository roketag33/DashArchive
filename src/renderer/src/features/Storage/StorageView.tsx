/* eslint-disable react/prop-types */
import React, { useMemo } from 'react'
import { useDashboard } from '../Dashboard/useDashboard'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { Loader2, HardDrive } from 'lucide-react'
import { transformFilesToTreemap } from '../../utils/fileTree'

// ...

// unescaped quote fix
;<p className="text-muted-foreground">Analysez l&apos;utilisation de votre espace disque.</p>

const CUSTOM_COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Content = (props: any): React.JSX.Element => {
  const { root, depth, x, y, width, height, index, colors, name } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill:
            depth < 2
              ? colors[Math.floor((index / root.children.length) * 6)]
              : 'rgba(255,255,255,0.1)',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10)
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {index + 1}
        </text>
      ) : null}
    </g>
  )
}

const CustomTooltip = ({ active, payload }): React.JSX.Element | null => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="font-semibold text-foreground">{data.name}</p>
        <p className="text-muted-foreground">
          Make sure to format size properly.
          {(data.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    )
  }
  return null
}

export function StorageView(): React.JSX.Element {
  const { files, isLoadingFolders } = useDashboard()

  // Memoize transformation: Flat files -> Tree
  const data = useMemo(() => {
    if (!files || files.length === 0) return []
    // Map FileEntry to the simpler shape expected by utils
    const simpleFiles = files.map((f) => ({
      path: f.path,
      name: f.name,
      size: f.size
    }))
    return transformFilesToTreemap(simpleFiles)
  }, [files])

  if (isLoadingFolders) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          <HardDrive className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Intelligence de Stockage</h2>
          <p className="text-muted-foreground">
            Analysez l&apos;utilisation de votre espace disque.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main Treemap Area */}
        <div className="lg:col-span-2 bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-4 flex flex-col min-h-[400px]">
          <h3 className="font-semibold mb-4">Répartition (Treemap)</h3>
          <div className="flex-1 w-full min-h-0">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  width={400}
                  height={200}
                  data={data}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<Content colors={CUSTOM_COLORS} />}
                  animationDuration={800}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip content={CustomTooltip as any} />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée à afficher. Scanner des dossiers.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats (Donut / List) */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Statistiques Rapides</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">Total Fichiers</span>
              <span className="font-bold">{files.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">Taille Totale</span>
              <span className="font-bold">
                {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
