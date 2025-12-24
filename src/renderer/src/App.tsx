import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './features/Dashboard/Dashboard'
import { SettingsPanel } from './features/Settings/SettingsPanel'
import { HistoryPanel } from './features/History/HistoryPanel'
import { DropZone } from './features/DropZone/DropZone'
import { StorageView } from './features/Storage/StorageView'
import { FlowEditor } from './features/Automation/FlowEditor'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="folders" element={<Dashboard />} />
        <Route path="folders/:folderId" element={<Dashboard />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="history" element={<HistoryPanel />} />
        <Route path="storage" element={<StorageView />} />
        <Route path="automation" element={<FlowEditor />} />
      </Route>
      <Route path="/dropzone" element={<DropZone />} />
    </Routes>
  )
}

export default App
