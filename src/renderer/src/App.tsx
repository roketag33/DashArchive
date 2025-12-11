import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './features/Dashboard/Dashboard'
import { SettingsPanel } from './features/Settings/SettingsPanel'
import { HistoryPanel } from './features/History/HistoryPanel'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="history" element={<HistoryPanel />} />
      </Route>
    </Routes>
  )
}

export default App
