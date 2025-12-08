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

      <div className="mb-4 flex gap-2 flex-wrap">
        {Object.entries(byCategory).map(([cat, count]) => (
          <span key={cat} className="px-2 py-1 bg-gray-200 rounded text-xs">
            {cat}: {count}
          </span>
        ))}
      </div>

      <div className="overflow-auto max-h-[400px] border rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Size (KB)</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
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
