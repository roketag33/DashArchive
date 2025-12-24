import React from 'react'
import { Folder } from '../../../../shared/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Play, Eye, EyeOff, Settings, Trash2, Folder as FolderIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FolderCardProps {
  folder: Folder
  onSort: (folder: Folder) => void
  onToggleWatch: (folder: Folder) => void
  onSettings: (folder: Folder) => void
  onDelete: (folder: Folder) => void
  isSorting?: boolean
}

export function FolderCard({
  folder,
  onSort,
  onToggleWatch,
  onSettings,
  onDelete,
  isSorting
}: FolderCardProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className="text-sm font-medium flex items-center gap-2 truncate"
          title={folder.path}
        >
          <FolderIcon className="h-4 w-4 text-primary" />
          {folder.name}
        </CardTitle>
        <Badge variant={folder.autoWatch ? 'default' : 'secondary'} className="text-xs">
          {folder.autoWatch ? (
            <Eye className="h-3 w-3 mr-1" />
          ) : (
            <EyeOff className="h-3 w-3 mr-1" />
          )}
          {folder.autoWatch ? t('app.statusWatching') : t('app.statusManual')}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs truncate mb-4" title={folder.path}>
          {folder.path}
        </CardDescription>

        <div className="flex justify-between gap-2">
          <Button size="sm" variant="default" onClick={() => onSort(folder)} disabled={isSorting}>
            <Play className="h-3 w-3 mr-2" />
            {t('app.organize')}
          </Button>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleWatch(folder)}
              title={t('app.toggleWatch')}
            >
              {folder.autoWatch ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSettings(folder)}
              title={t('app.settingsRef')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(folder)}
              title={t('app.remove')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
