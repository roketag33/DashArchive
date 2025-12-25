import React, { useState } from 'react'
import { FileEntry } from '../../../../shared/types'
// @ts-ignore - react-window types compatibility with CJS/ESM in Vite
import * as ReactWindow from 'react-window'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rw = ReactWindow as any
const FixedSizeList = rw.FixedSizeList || rw.default.FixedSizeList
import AutoSizer from 'react-virtualized-auto-sizer'
import { Card } from '../../components/ui/card'
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Code,
  Box,
  LayoutGrid,
  List as ListIcon,
  Search,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface FileListProps {
  files: FileEntry[]
}

export function FileList({ files }: FileListProps): React.JSX.Element {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filter, setFilter] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FileEntry
    direction: 'asc' | 'desc'
  } | null>(null)

  const getFileIcon = (category: string): React.JSX.Element => {
    switch (category) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
      case 'video':
        return <Video className="h-5 w-5 text-pink-500 dark:text-pink-400" />
      case 'audio':
        return <Music className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      case 'code':
        return <Code className="h-5 w-5 text-green-500 dark:text-green-400" />
      case 'archive':
        return <Box className="h-5 w-5 text-orange-500 dark:text-orange-400" />
      case 'document':
        return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Debugging Helpers - Stress Test
  const [isStressTest, setIsStressTest] = useState(false)
  const stressFiles = React.useMemo(() => {
    if (!isStressTest) return []
    return Array.from({ length: 5000 }).map(
      (_, i) =>
        ({
          path: `/dummy/path/file-${i}.txt`,
          name: `Dummy File ${i}.txt`,
          size: 1024 * i,
          category: 'document',
          extension: '.txt',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          isDirectory: false
        }) as unknown as FileEntry
    )
  }, [isStressTest])

  const effectiveFiles = isStressTest ? stressFiles : files

  const filteredFiles = effectiveFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(filter.toLowerCase()) ||
      f.extension.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedFiles = React.useMemo(() => {
    if (!sortConfig) return filteredFiles
    return [...filteredFiles].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredFiles, sortConfig])

  const handleSort = (key: keyof FileEntry): void => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const Row = ({
    index,
    style
  }: {
    index: number
    style: React.CSSProperties
  }): React.JSX.Element => {
    const file = sortedFiles[index]
    return (
      <div
        style={style}
        className="flex items-center border-b border-border/40 hover:bg-muted/30 transition-colors group px-4"
      >
        {/* Icon */}
        <div className="w-[50px] flex-shrink-0">
          <div className="p-2 rounded-md bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform w-fit">
            {getFileIcon(file.category)}
          </div>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex flex-col">
            <span
              className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm"
              title={file.name}
            >
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground opacity-60 truncate">{file.path}</span>
          </div>
        </div>

        {/* Type */}
        <div className="w-[100px] text-muted-foreground uppercase text-xs font-semibold tracking-wider hidden sm:block">
          {file.extension.replace('.', '')}
        </div>

        {/* Size */}
        <div className="w-[100px] text-right font-mono text-xs text-muted-foreground hidden md:block">
          {formatSize(file.size)}
        </div>

        {/* Date */}
        <div className="w-[150px] text-right text-xs text-muted-foreground hidden lg:block">
          {new Date(file.createdAt).toLocaleDateString()}
        </div>
      </div>
    )
  }

  return (
    <Card className="border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-14rem)]">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('app.searchFiles', 'Rechercher un fichier...')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsStressTest(!isStressTest)}
            className={`text-xs ${isStressTest ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground'}`}
          >
            {isStressTest ? 'Stop Stress' : 'Stress Test (5k)'}
          </Button>

          <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-background/20 relative">
        {viewMode === 'list' ? (
          <>
            {/* Header */}
            <div className="flex items-center h-12 border-b border-border/50 bg-muted/10 px-4 text-xs font-medium text-muted-foreground">
              <div className="w-[50px]"></div>
              <div
                className="flex-1 cursor-pointer hover:text-primary transition-colors flex items-center"
                onClick={() => handleSort('name')}
              >
                Nom <ArrowUpDown className="h-3 w-3 ml-1" />
              </div>
              <div
                className="w-[100px] hidden sm:block cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('extension')}
              >
                Type
              </div>
              <div
                className="w-[100px] text-right hidden md:block cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('size')}
              >
                Taille
              </div>
              <div
                className="w-[150px] text-right hidden lg:block cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                Date
              </div>
            </div>

            {/* Virtual List */}
            <div className="h-[calc(100%-3rem)] w-full">
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemCount={sortedFiles.length}
                    itemSize={72} // Row height
                  >
                    {Row}
                  </FixedSizeList>
                )}
              </AutoSizer>
              {sortedFiles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Aucun fichier trouvé.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedFiles.map((file) => (
                <motion.div
                  key={file.path}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative flex flex-col items-center p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-default shadow-sm hover:shadow-md"
                >
                  <div className="h-12 w-12 mb-3 rounded-full bg-background border border-border/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {getFileIcon(file.category)}
                  </div>
                  <span
                    className="text-sm font-medium text-center truncate w-full px-2 group-hover:text-primary transition-colors"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 uppercase font-semibold opacity-70">
                    {file.extension.replace('.', '')}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {formatSize(file.size)}
                  </span>
                </motion.div>
              ))}
            </div>
            {sortedFiles.length === 0 && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucun fichier trouvé.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
