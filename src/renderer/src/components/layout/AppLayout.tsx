import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Home, History, Sun, Moon, HardDrive, Zap } from 'lucide-react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { SearchBar } from '../../features/Search/SearchBar'

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  isActive?: boolean
  onClick?: () => void
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick
}: SidebarItemProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 outline-none hover:bg-accent/50',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 h-4 w-1 rounded-r-full bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </button>
  )
}

export function AppLayout(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const currentPath = location.pathname

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const navigateTo = (path: string): void => {
    navigate(path)
  }

  // Map path to title
  const getPageTitle = (): string => {
    switch (currentPath) {
      case '/':
        return t('app.dashboard', 'Tableau de Bord')
      case '/folders':
        return t('app.folders', 'Dossiers')
      case '/history':
        return t('app.history', 'Historique')
      case '/settings':
        return t('app.settings', 'Paramètres')
      default:
        return 'DashArchive'
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex w-64 flex-col gap-4 border-r border-border/40 bg-card/30 p-4 backdrop-blur-xl"
      >
        <div className="flex h-12 items-center px-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20" />
            <span className="text-lg font-bold tracking-tight">DashArchive</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Menu
          </div>
          <div className="space-y-1">
            <SidebarItem
              icon={Home}
              label={t('app.dashboard', 'Tableau de Bord')}
              isActive={currentPath === '/' || currentPath === '/folders'}
              onClick={() => navigateTo('/folders')}
            />
            <SidebarItem
              icon={Zap}
              label="Automation"
              isActive={currentPath === '/automation'}
              onClick={() => navigateTo('/automation')}
            />
            <SidebarItem
              icon={HardDrive}
              label="Stockage"
              isActive={currentPath === '/storage'}
              onClick={() => navigateTo('/storage')}
            />
            <SidebarItem
              icon={History}
              label={t('app.history', 'Historique')}
              isActive={currentPath === '/history'}
              onClick={() => navigateTo('/history')}
            />
          </div>

          <div className="mt-auto border-t border-border/40 pt-4">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Système
            </div>
            <SidebarItem
              icon={Settings}
              label={t('app.settings', 'Paramètres')}
              isActive={currentPath === '/settings'}
              onClick={() => navigateTo('/settings')}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-br from-background to-muted/20">
        {/* Top Header (Transparent / Minimal) */}
        <header className="flex h-16 shrink-0 items-center justify-between px-8 pt-4 pb-2">
          <div className="flex flex-col">
            <motion.h1
              key={currentPath}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              {getPageTitle()}
            </motion.h1>
            <p className="text-muted-foreground text-sm">
              {/* Dynamic subtitle could go here */}
              Gérez vos fichiers intelligemment.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SearchBar />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Simple Language Toggle for now */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
                className="font-medium"
              >
                {i18n.language === 'fr' ? 'FR' : 'EN'}
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-6xl mx-auto pb-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="bottom-right" theme={theme as 'light' | 'dark' | 'system'} />
    </div>
  )
}
