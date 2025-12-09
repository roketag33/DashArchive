import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'

test.describe('AI Settings UI', () => {
  let app: ElectronApplication
  let window: Page

  test.beforeEach(async () => {
    const mainPath = join(__dirname, '../../out/main/index.js')
    app = await electron.launch({
      args: [mainPath],
      env: { ...process.env, NODE_ENV: 'test' }
    })
    window = await app.firstWindow()
    await window.waitForLoadState('domcontentloaded')
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
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
    await window.click('[data-testid="rule-mode-ai"]')

    // Check if input placeholder changes or Quick Tags appear
    const input = window.locator('input[placeholder*="Categories"]')
    await expect(input).toBeVisible()

    // Click a Quick Tag
    await window.locator('div', { hasText: 'Invoice' }).last().click()
    
    // Check input value
    await expect(input).toHaveValue('Invoice')

    // Click another tag
    await window.locator('div', { hasText: 'Receipt' }).last().click()
    
    // Check appended value
    await expect(input).toHaveValue('Invoice, Receipt')

    // Set other fields
    await window.fill('input[placeholder="Rule Name"]', 'My AI Rule')
    await window.fill('input[placeholder="Destination Folder"]', 'AI_Docs')

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
