import React from 'react'
import { FileEntry } from '../../../shared/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

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

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="p-3 font-medium text-muted-foreground w-[30%]">Name</th>
                <th className="p-3 font-medium text-muted-foreground w-[25%]">Folder</th>
                <th className="p-3 font-medium text-muted-foreground w-[25%]">Category</th>
                <th className="p-3 font-medium text-muted-foreground w-[20%]">Size (KB)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {files.map((file, idx) => {
                // simple parent extraction
                const parts = file.path.split(/[/\\]/)
                const parent = parts.length > 1 ? parts[parts.length - 2] : ''

                return (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </td>
                    <td className="p-3 truncate max-w-[150px] text-muted-foreground text-xs" title={file.path}>
                      {parent}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={getCategoryBadgeStyle(file.category)}>
                        {file.category}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {(file.size / 1024).toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
