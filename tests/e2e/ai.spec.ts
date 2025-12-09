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
    // Wait for app to be ready
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
    await window.click('button:has-text("Add Rule")')
    
    // Switch to AI Mode
    // Use partial match and stricter selector
    const aiModeBtn = window.locator('button', { hasText: 'AI Smart Sort' })
    await expect(aiModeBtn).toBeVisible()
    await aiModeBtn.click()

    // Check if input placeholder changes or Quick Tags appear
    const input = window.locator('input[placeholder*="Categories"]')
    await expect(input).toBeVisible()

    // Click a Quick Tag (e.g., "Invoice") - assuming Badge is clickable
    await window.click('.badge:has-text("Invoice")', { force: true }) // force if badge has restricted pointer events?
    // Actually Badge in Setup has onClick, so it's fine.
    // Use text locator which is standard
    await window.locator('div', { hasText: 'Invoice' }).last().click()
    
    // Check input value
    await expect(input).toHaveValue('Invoice')

    // Click another tag
    await window.locator('div', { hasText: 'Receipt' }).last().click()
    
    // Check appended value
    await expect(input).toHaveValue('Invoice, Receipt')

    // Click "Invoice" again to remove it
    await window.locator('div', { hasText: 'Invoice' }).last().click()
    await expect(input).toHaveValue('Receipt')

    // Set other fields
    await window.fill('input[placeholder="Rule Name"]', 'My AI Rule')
    await window.fill('input[placeholder="Destination Folder"]', 'AI_Docs')

    // Save
    await window.click('button:has-text("Save")')

    // Verify Rule appears in list
    await expect(window.locator('text=My AI Rule')).toBeVisible()
    await expect(window.locator('text=AI_Docs')).toBeVisible()
  })

  test('should allow Magic Suggest button interaction', async () => {
    await window.click('button[title="Settings"]')
    await window.click('button:has-text("Add Rule")')
    await window.locator('button', { hasText: 'AI Smart Sort' }).click()

    // Magic Wand button. It has title "✨ Magic Suggest from Folder"
    const wandBtn = window.locator('button[title*="Magic Suggest"]')
    await expect(wandBtn).toBeVisible()
    await expect(wandBtn).toBeEnabled()
  })
})
