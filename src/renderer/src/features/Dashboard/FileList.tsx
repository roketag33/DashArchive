import React from 'react'
import { FileEntry } from '../../../../shared/types'
import { FileIcon, ImageIcon, Music, Video, FileText, Code, Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FileListProps {
  files: FileEntry[]
}

export function FileList({ files }: FileListProps): React.JSX.Element {
  const { t } = useTranslation()

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('fileList.noFiles')}
      </div>
    )
  }

  // Calculate stats
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getIcon = (category: string): React.ReactNode => {
    switch (category.toLowerCase()) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-purple-500" />
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />
      case 'audio':
        return <Music className="h-4 w-4 text-yellow-500" />
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'code':
        return <Code className="h-4 w-4 text-green-500" />
      case 'archive':
        return <Archive className="h-4 w-4 text-orange-500" />
      default:
        return <FileIcon className="h-4 w-4 text-gray-400" />
    }
  }

  // Group by category for stats
  const stats = files.reduce(
    (acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('fileList.storageOverview')}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {files.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t('fileList.files')}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatSize(totalSize)} {t('fileList.totalSize')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            {t('fileList.distribution')}
          </h3>
          <div className="space-y-2">
            {Object.entries(stats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center text-xs">
                  <span className="w-20 font-medium truncate capitalize text-gray-700 dark:text-gray-300">
                    {cat}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mx-2">
                    <div
                      className="h-full bg-blue-500 rounded-full opacity-80"
                      style={{ width: `${(count / files.length) * 100}% ` }}
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 px-1">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t('fileList.headers.name')}</th>
                <th className="px-4 py-3 font-medium">{t('fileList.headers.folder')}</th>
                <th className="px-4 py-3 font-medium">{t('fileList.headers.category')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('fileList.headers.size')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {files.slice(0, 50).map((file) => (
                <tr
                  key={file.path}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                    {file.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {file.path.split('/').slice(-2, -1)[0]}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize border border-blue-100 dark:border-blue-800">
                      {getIcon(file.category)}
                      <span className="ml-1.5">{file.category}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {formatSize(file.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {files.length > 50 && (
            <div className="px-4 py-3 text-center text-xs text-gray-500 border-t dark:border-gray-700">
              And {files.length - 50} more files...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
