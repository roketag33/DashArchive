import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { History, Settings, Moon, Sun } from 'lucide-react'
import electronLogo from '../assets/electron.svg' // Adjust path if needed
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'
import { Button } from './ui/button'

export function Layout(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src={electronLogo} className="h-8 w-8 animate-spin-slow" alt="logo" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>

            <Button variant="ghost" size="icon" onClick={toggleTheme} title={t('app.toggleTheme')}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link to="/history">
              <Button variant="ghost" size="icon" title={t('app.history')}>
                <History className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/settings">
              <Button variant="ghost" size="icon" title={t('app.settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-4xl mt-6">
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
