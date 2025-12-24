import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, File } from 'lucide-react'

export function DropZone(): React.JSX.Element {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    // Debounce or check just to be safe, but usually just preventing default is enough
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // In Electron renderer, File object has a 'path' property
      interface ElectronFile extends File {
        path: string
      }
      const filePaths = files.map((f) => (f as ElectronFile).path)
      await window.api.processDroppedFiles(filePaths)
    }
  }

  return (
    <div
      data-testid="drop-zone"
      className={`
        h-full w-full flex flex-col items-center justify-center 
        transition-all duration-300 ease-out
        ${isDragOver ? 'scale-110 bg-primary/20 backdrop-blur-xl border-primary' : 'scale-100 bg-background/10 backdrop-blur-md border-transparent'}
        border-2 rounded-full overflow-hidden select-none cursor-default
      `}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver ? (
        <Upload className="w-10 h-10 text-primary animate-bounce" />
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <File className="w-6 h-6 text-primary/80" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{t('dropZone.idle')}</span>
        </div>
      )}
    </div>
  )
}
