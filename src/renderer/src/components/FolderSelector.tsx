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

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm text-center">
      <h2 className="text-lg font-semibold mb-2">Select a folder to organize</h2>
      <button
        onClick={handleSelect}
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Scanning...' : 'Choose Folder'}
      </button>
    </div>
  )
}
