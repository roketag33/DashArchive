import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './features/Dashboard/Dashboard'
import { SettingsPanel } from './features/Settings/SettingsPanel'
import { HistoryPanel } from './features/History/HistoryPanel'
import { DropZone } from './features/DropZone/DropZone'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="folders" element={<Dashboard />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="history" element={<HistoryPanel />} />
        <Route
          path="dropzone"
          element={
            <div className="h-screen w-screen flex items-center justify-center bg-transparent">
              <DropZone />
            </div>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
