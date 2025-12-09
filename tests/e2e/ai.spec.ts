import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'

test.describe('AI Settings UI', () => {
  let app: ElectronApplication
  let window: Page
  let userDataDir: string

  test.beforeEach(async () => {
    userDataDir = await mkdtemp(join(tmpdir(), 'electron-test-'))
    const mainPath = join(__dirname, '../../out/main/index.js')
    app = await electron.launch({
      args: [mainPath, `--user-data-dir=${userDataDir}`],
      env: { ...process.env, NODE_ENV: 'test' }
    })
    window = await app.firstWindow()
    await window.waitForLoadState('domcontentloaded')
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
    if (userDataDir) {
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {})
    }
  })

  test('should allow creating an AI rule with Quick Tags', async () => {
    // Open Settings
    await window.click('button[title="Settings"]')
    await expect(window.locator('text=Manage your organization rules')).toBeVisible()

    // Add Rule
    const addBtn = window.locator('[data-testid="add-rule-btn"]')
    await addBtn.waitFor()
    await addBtn.click()

    // Switch to AI Mode
    await window.click('[data-testid="rule-mode-ai"]', { force: true })

    // Check if input placeholder changes or Quick Tags appear
    const input = window.locator('[data-testid="ai-categories-input"]')
    await expect(input).toBeVisible()

    // Click a Quick Tag
    await window.click('[data-testid="quick-tag-Invoice"]', { force: true })

    // Check input value
    await expect(input).toHaveValue('Invoice')

    // Click another tag
    await window.click('[data-testid="quick-tag-Receipt"]', { force: true })

    // Check appended value
    await expect(input).toHaveValue('Invoice, Receipt')

    // Set other fields
    await window.locator('[data-testid="rule-name-input"]').fill('My AI Rule', { force: true })
    await window.locator('[data-testid="rule-dest-input"]').fill('AI_Docs', { force: true })

    // Save
    await window.click('[data-testid="save-rule-btn"]')

    // Verify Rule appears in list
    await expect(window.locator('text=My AI Rule')).toBeVisible()
    await expect(window.locator('text=AI_Docs')).toBeVisible()
  })

  test('should allow Magic Suggest button interaction', async () => {
    await window.click('button[title="Settings"]')
    const addBtn = window.locator('[data-testid="add-rule-btn"]')
    await addBtn.waitFor()
    await addBtn.click()
    await window.click('[data-testid="rule-mode-ai"]')

    // Magic Wand button
    const wandBtn = window.locator('[data-testid="magic-suggest-btn"]')
    await expect(wandBtn).toBeVisible()
    await expect(wandBtn).toBeEnabled()
  })
})
