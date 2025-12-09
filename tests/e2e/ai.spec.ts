import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'

test.describe('AI Settings UI', () => {
  let app: ElectronApplication
  let window: Page

  test.beforeEach(async () => {
    const mainPath = join(__dirname, '../../out/main/index.js')
    app = await electron.launch({
      args: [mainPath]
    })
    window = await app.firstWindow()
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
    await window.click('text=Add Rule')
    
    // Switch to AI Mode
    await window.click('text=AI Smart Sort')

    // Check if input placeholder changes or Quick Tags appear
    const input = window.locator('input[placeholder*="Categories"]')
    await expect(input).toBeVisible()

    // Click a Quick Tag (e.g., "Invoice")
    await window.click('text=Invoice')
    
    // Check input value
    await expect(input).toHaveValue('Invoice')

    // Click another tag
    await window.click('text=Receipt')
    
    // Check appended value
    await expect(input).toHaveValue('Invoice, Receipt')

    // Click "Invoice" again to remove it
    await window.click('text=Invoice')
    await expect(input).toHaveValue('Receipt')

    // Set other fields
    await window.fill('input[placeholder="Rule Name"]', 'My AI Rule')
    await window.fill('input[placeholder="Destination Folder"]', 'AI_Docs')

    // Save
    await window.click('text=Save')

    // Verify Rule appears in list
    await expect(window.locator('text=My AI Rule')).toBeVisible()
    await expect(window.locator('text=AI_Docs')).toBeVisible()
  })

  test('should allow Magic Suggest button interaction', async () => {
    await window.click('button[title="Settings"]')
    await window.click('text=Add Rule')
    await window.click('text=AI Smart Sort')

    // Magic Wand button
    const wandBtn = window.locator('button[title*="Magic Suggest"]')
    await expect(wandBtn).toBeVisible()
    await expect(wandBtn).toBeEnabled()
  })
})
