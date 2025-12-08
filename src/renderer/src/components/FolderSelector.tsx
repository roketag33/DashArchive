import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { FolderOpen } from 'lucide-react'

interface Props {
  onSelect: (path: string) => void
  isLoading?: boolean
}

export function FolderSelector({ onSelect, isLoading }: Props): React.JSX.Element {
  const handleSelect = async (): Promise<void> => {
    // @ts-ignore : Window.api is defined in preload
    const path = await window.api.selectFolder()
    if (path) {
      onSelect(path)
    }
  }

  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // @ts-ignore : 'path' exists on File in Electron
      const path = file.path
      if (path) {
        onSelect(path)
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card
        className={`w-full max-w-md transition-all duration-200 cursor-pointer border-2 border-dashed ${
          isDragging
            ? 'border-primary ring-2 ring-primary/20 bg-accent'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelect} // Click anywhere to select
      >
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-2">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <CardTitle>Organize your files</CardTitle>
          <CardDescription>Drag and drop a folder here, or click to browse</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button
            onClick={(e) => {
              e.stopPropagation() // Prevent double trigger
              handleSelect()
            }}
            disabled={isLoading}
            data-testid="select-folder-btn"
          >
            {isLoading ? 'Scanning...' : 'Choose Folder'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
