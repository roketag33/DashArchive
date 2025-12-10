import React from 'react'
import { FileEntry } from '../../../../shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import * as ReactWindow from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const List = (ReactWindow as any).FixedSizeList

interface Props {
  files: FileEntry[]
}

export function FileList({ files }: Props): React.JSX.Element {
  if (files.length === 0) {
    return <div className="text-muted-foreground text-center mt-4">No files found.</div>
  }

  // Summary stats
  const totalSize = (files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)
  const byCategory = files.reduce(
    (acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const Row = ({
    index,
    style
  }: {
    index: number
    style: React.CSSProperties
  }): React.JSX.Element => {
    const file = files[index]
    const parts = file.path.split(/[/\\]/)
    const parent = parts.length > 1 ? parts[parts.length - 2] : ''

    return (
      <div
        style={style}
        className="flex items-center hover:bg-muted/50 transition-colors px-2 border-b last:border-0"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="truncate font-medium text-sm" title={file.name}>
            {file.name}
          </div>
        </div>
        <div className="w-[25%] truncate text-muted-foreground text-xs pr-4" title={file.path}>
          {parent}
        </div>
        <div className="w-[20%] pr-4 uppercase">
          <Badge variant="outline" className={getCategoryBadgeStyle(file.category)}>
            {file.category}
          </Badge>
        </div>
        <div className="w-[15%] text-right font-mono text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {files.length}{' '}
              <span className="text-lg font-normal text-muted-foreground">files</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalSize} MB total size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(byCategory).map(([cat, count]) => {
                const percentage = Math.round((count / files.length) * 100)
                return (
                  <div key={cat} className="flex items-center text-xs">
                    <div className="w-20 font-medium capitalize truncate" title={cat}>
                      {cat}
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden mx-2">
                      <div
                        className={`h-full rounded-full ${getCategoryColorBar(cat)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-muted-foreground">{count}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg bg-background h-[500px] flex flex-col">
        <div className="flex items-center px-2 py-3 bg-muted/50 border-b font-medium text-xs text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 pl-2">Name</div>
          <div className="w-[25%]">Folder</div>
          <div className="w-[20%]">Category</div>
          <div className="w-[15%] text-right pr-2">Size</div>
        </div>
        <div className="flex-1">
          <AutoSizer>
            {({ height, width }) => (
              <List height={height} itemCount={files.length} itemSize={50} width={width}>
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  )
}

function getCategoryBadgeStyle(cat: string): string {
  switch (cat) {
    case 'image':
      return 'border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-800'
    case 'video':
      return 'border-pink-200 text-pink-700 bg-pink-50 dark:bg-pink-900/10 dark:text-pink-400 dark:border-pink-800'
    case 'document':
      return 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800'
    case 'archive':
      return 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800'
    case 'dev':
      return 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800'
    case 'executable':
      return 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800'
    default:
      return 'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}

function getCategoryColorBar(cat: string): string {
  switch (cat) {
    case 'image':
      return 'bg-purple-500'
    case 'video':
      return 'bg-pink-500'
    case 'document':
      return 'bg-blue-500'
    case 'archive':
      return 'bg-yellow-500'
    case 'dev':
      return 'bg-green-500'
    case 'executable':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}
