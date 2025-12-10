import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'

test.describe('Application Launch', () => {
  let app: ElectronApplication
  let window: Page

  test.beforeEach(async () => {
    // Build path should be your main entry point or the built app
    // Using 'dist/mac/FileOrganizer.app/Contents/MacOS/FileOrganizer' if testing built app,
    // For development, we usually point to electron binary with app root
    // However, Electron-Playwright usually launches main.js directly.
    // Let's assume testing against source for now:
    const mainPath = join(__dirname, '../../out/main/index.js')
    app = await electron.launch({
      args: [mainPath, '--no-sandbox']
    })
    window = await app.firstWindow()
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  test('should launch and show correct title', async () => {
    // Depending on how title is set (index.html or main process)
    // Check index.html or App.tsx for title
    // App.tsx has "File Organizer" in h1, html title might be "Electron App" default
    // Let's check window content
    const logo = await window.locator('img[alt="logo"]')
    await expect(logo).toBeVisible()

    const h1 = await window.locator('h1')
    await expect(h1).toHaveText('File Organizer')
  })

  test('should navigate to settings', async () => {
    const settingsBtn = await window.locator('button[title="Settings"]')
    await settingsBtn.click()

    const settingsTitle = await window.locator('h3', { hasText: 'Settings' })
    await expect(settingsTitle).toBeVisible()
  })
})
