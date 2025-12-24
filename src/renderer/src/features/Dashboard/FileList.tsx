import React, { useState } from 'react'
import { FileEntry } from '../../../../shared/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
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
        return <ImageIcon className="h-5 w-5 text-purple-500" />
      case 'video':
        return <Video className="h-5 w-5 text-pink-500" />
      case 'audio':
        return <Music className="h-5 w-5 text-blue-500" />
      case 'code':
        return <Code className="h-5 w-5 text-green-500" />
      case 'archive':
        return <Box className="h-5 w-5 text-orange-500" />
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

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(filter.toLowerCase()) ||
      f.extension.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedFiles = React.useMemo(() => {
    if (!sortConfig) return filteredFiles
    return [...filteredFiles].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle potential undefined/null values safely
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

  return (
    <Card className="border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('app.searchFiles', 'Rechercher un fichier...')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
          />
        </div>

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

      <div className="p-0">
        {viewMode === 'list' ? (
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Nom <ArrowUpDown className="inline h-3 w-3 ml-1" />
                </TableHead>
                <TableHead
                  className="w-[100px] cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('extension')}
                >
                  Type
                </TableHead>
                <TableHead
                  className="w-[100px] text-right cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('size')}
                >
                  Taille
                </TableHead>
                <TableHead
                  className="w-[150px] text-right cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFiles.map((file) => (
                <TableRow
                  key={file.path}
                  className="group hover:bg-muted/30 transition-colors border-b border-border/40"
                >
                  <TableCell className="font-medium">
                    <div className="p-2 rounded-md bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform">
                      {getFileIcon(file.category)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span
                        className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[300px]"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground opacity-60 truncate max-w-[300px]">
                        {file.path}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                    {file.extension.replace('.', '')}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {sortedFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Aucun fichier trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-muted/5">
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
            {sortedFiles.length === 0 && (
              <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
                Aucun fichier trouvé.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
