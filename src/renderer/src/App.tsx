import { useState } from 'react'
import { FolderSelector } from './components/FolderSelector'
import { FileList } from './components/FileList'
import { FileEntry } from '../../shared/types'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleFolderSelect = async (path: string): Promise<void> => {
    setSelectedPath(path)
    setScanning(true)
    setFiles([]) // Clear previous
    try {
      // @ts-ignore : Window.api is defined in preload
      const result = await window.api.scanFolder(path)
      setFiles(result)
    } catch (e) {
      console.error(e)
      alert('Failed to scan folder')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex items-center gap-4 mb-8 border-b pb-4">
        <img src={electronLogo} className="h-10 w-10 animate-spin-slow" alt="logo" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          File Organizer
        </h1>
      </header>

      <main className="space-y-6">
        <FolderSelector onSelect={handleFolderSelect} isLoading={scanning} />

        {selectedPath && (
          <div className="bg-blue-50 px-4 py-2 rounded text-blue-700 text-sm">
            Selected: <span className="font-mono">{selectedPath}</span>
          </div>
        )}

        {files.length > 0 && <FileList files={files} />}
      </main>
    </div>
  )
}

export default App
