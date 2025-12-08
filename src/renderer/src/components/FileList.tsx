import React from 'react'
import { FileEntry } from '../../../shared/types'

interface Props {
  files: FileEntry[]
}

export function FileList({ files }: Props): React.JSX.Element {
  if (files.length === 0) {
    return <div className="text-gray-500 text-center mt-4">No files found.</div>
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
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded">
        <span className="font-bold">{files.length} files</span>
        <span className="text-sm text-gray-600">{totalSize} MB</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Storage Overview
          </h3>
          <div className="text-3xl font-bold dark:text-white">
            {files.length} <span className="text-lg font-normal text-gray-400">files</span>
          </div>
          <div className="text-gray-600 dark:text-gray-300 mt-1">{totalSize} MB total size</div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow-sm border dark:border-gray-700 overflow-hidden">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, count]) => {
              const percentage = Math.round((count / files.length) * 100)
              return (
                <div key={cat} className="flex items-center text-xs">
                  <div
                    className="w-20 font-medium capitalize truncate dark:text-gray-300"
                    title={cat}
                  >
                    {cat}
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mx-2">
                    <div
                      className={`h-full rounded-full ${getCategoryColorBar(cat)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-gray-500 dark:text-gray-400">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-[400px] border rounded dark:border-gray-700">
        <table className="w-full text-sm text-left dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Size (KB)</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={idx}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-2 truncate max-w-[200px]" title={file.name}>
                  {file.name}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(file.category)}`}
                  >
                    {file.category}
                  </span>
                </td>
                <td className="p-2 font-mono">{(file.size / 1024).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'image':
      return 'bg-purple-100 text-purple-800'
    case 'video':
      return 'bg-pink-100 text-pink-800'
    case 'document':
      return 'bg-blue-100 text-blue-800'
    case 'archive':
      return 'bg-yellow-100 text-yellow-800'
    case 'dev':
      return 'bg-green-100 text-green-800'
    case 'executable':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
