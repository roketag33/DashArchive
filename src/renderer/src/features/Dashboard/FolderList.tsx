
import React from 'react'
import { Folder } from '../../../../shared/types'
import { FolderCard } from './FolderCard'

interface FolderListProps {
    folders: Folder[]
    onSort: (folder: Folder) => void
    onToggleWatch: (folder: Folder) => void
    onSettings: (folder: Folder) => void
    onDelete: (folder: Folder) => void
    sortingFolderId?: string | null
}

import { useTranslation } from 'react-i18next'
// ...
export function FolderList({ folders, onSort, onToggleWatch, onSettings, onDelete, sortingFolderId }: FolderListProps): React.JSX.Element {
    const { t } = useTranslation()

    if (folders.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">{t('app.noFolders')}</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folders.map(folder => (
                <FolderCard
                    key={folder.id}
                    folder={folder}
                    onSort={onSort}
                    onToggleWatch={onToggleWatch}
                    onSettings={onSettings}
                    onDelete={onDelete}
                    isSorting={sortingFolderId === folder.id}
                />
            ))}
        </div>
    )
}
