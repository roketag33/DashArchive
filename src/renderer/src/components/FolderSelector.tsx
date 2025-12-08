import React from 'react'

interface Props {
  onSelect: (path: string) => void
  isLoading?: boolean
}

export function FolderSelector({ onSelect, isLoading }: Props): React.JSX.Element {
  const handleSelect = async (): Promise<void> => {
    // @ts-ignore : Window.api is defined in preload but TS cleanup is pending
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
      // In Electron, File object has a 'path' property
      const file = e.dataTransfer.files[0]
      // @ts-ignore : 'path' exists on File in Electron
      const path = file.path
      if (path) {
        onSelect(path)
      }
    }
  }

  return (
    <div
      className={`p-8 rounded-lg shadow-sm text-center border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-xl font-semibold mb-2">Organize your files</h2>
      <p className="text-gray-500 mb-6">Drag and drop a folder here, or click to select</p>

      <button
        onClick={handleSelect}
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {isLoading ? 'Scanning...' : 'Choose Folder'}
      </button>
    </div>
  )
}
