import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './features/Dashboard/Dashboard'
import { SettingsPanel } from './features/Settings/SettingsPanel'
import { HistoryPanel } from './features/History/HistoryPanel'
import { DropZone } from './features/DropZone/DropZone'
import { StorageView } from './features/Storage/StorageView'
import { Spotlight } from './features/Spotlight/Spotlight'
import { ChatInterface } from './features/Chat/ChatInterface'
import { AIProvider } from './context/AIContext'
import { useSettings } from './hooks/useSettings'
import { NotificationPage } from './pages/NotificationPage'

function App(): React.JSX.Element {
  const { loading } = useSettings()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <AIProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="folders" element={<Dashboard />} />
          <Route path="folders/:folderId" element={<Dashboard />} />
          <Route path="settings" element={<SettingsPanel />} />
          <Route path="history" element={<HistoryPanel />} />
          <Route path="storage" element={<StorageView />} />
          <Route path="chat" element={<ChatInterface />} />
        </Route>
        <Route path="/dropzone" element={<DropZone />} />
        <Route path="/spotlight" element={<Spotlight />} />
        <Route path="/notification" element={<NotificationPage />} />
      </Routes>
    </AIProvider>
  )
}

export default App
