import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'

test.describe('AI Rules Lifecycle & Validation', () => {
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
    
    // Open Settings
    await window.click('button[title="Settings"]')
    // Wait for modal to render and fetch settings
    await expect(window.locator('text=Manage your organization rules')).toBeVisible()
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
    if (userDataDir) {
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {})
    }
  })

  test('should validate empty AI fields', async () => {
    await window.click('[data-testid="add-rule-btn"]', { force: true })
    
    // Switch to AI
    await window.click('[data-testid="rule-mode-ai"]', { force: true })
    
    // Clear name
    await window.fill('[data-testid="rule-name-input"]', '')
    
    // Attempt save
    await window.click('[data-testid="save-rule-btn"]')
    
    // Modal should stay open (inputs visible)
    const nameInput = window.locator('[data-testid="rule-name-input"]')
    await expect(nameInput).toBeVisible()
    
    // Fix to be valid
    await window.fill('[data-testid="rule-name-input"]', 'Valid Name')
    // Attempt save again if needed, or just verify state
  })

  test('should delete an AI rule', async () => {
    // Create a rule first
    await window.click('[data-testid="add-rule-btn"]', { force: true })
    await window.click('[data-testid="rule-mode-ai"]', { force: true })

    await window.locator('[data-testid="rule-name-input"]').fill('Delete Me', { force: true })
    await window.locator('[data-testid="rule-dest-input"]').fill('Trash', { force: true })
    
    // Add a tag to make it valid
    await window.click('[data-testid="quick-tag-Invoice"]', { force: true })
    
    await window.click('[data-testid="save-rule-btn"]', { force: true })

    // Verify created
    const ruleRow = window.locator('div', { hasText: 'Delete Me' }).first()
    await expect(ruleRow).toBeVisible()

    // Delete
    // Use the last delete button since our rule was appended to the end
    await window.locator('[data-testid="delete-rule-btn"]').last().click({ force: true })

    // Verify gone
    await expect(window.locator('text=Delete Me')).not.toBeVisible()
  })
})
