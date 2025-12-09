import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'

test.describe('AI Rules Lifecycle & Validation', () => {
  let app: ElectronApplication
  let window: Page

  test.beforeEach(async () => {
    const mainPath = join(__dirname, '../../out/main/index.js')
    app = await electron.launch({
      args: [mainPath]
    })
    window = await app.firstWindow()
    await window.click('button[title="Settings"]')
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  test('should validate empty AI fields', async () => {
    await window.click('text=Add Rule')
    await window.click('text=AI Smart Sort')
    
    // Clear name if any
    await window.fill('input[placeholder="Rule Name"]', '')
    
    // Attempt save
    await window.click('text=Save')
    
    const modal = window.locator('text=Edit Rule')
    await expect(modal).toBeVisible()
    
    await window.fill('input[placeholder="Rule Name"]', 'Valid Name')
    await window.fill('input[placeholder*="Categories"]', '') // Clear prompts
    await window.click('text=Save')
    
    // Check modal still open
    await expect(modal).toBeVisible()
  })

  test('should delete an AI rule', async () => {
    // Create a rule first
    await window.click('text=Add Rule')
    await window.click('text=AI Smart Sort')
    await window.fill('input[placeholder="Rule Name"]', 'Delete Me')
    await window.fill('input[placeholder="Destination Folder"]', 'Trash')
    await window.click('text=Invoice') // Add tag
    await window.click('text=Save')

    // Verify created
    const ruleRow = window.locator('div', { hasText: 'Delete Me' }).first()
    await expect(ruleRow).toBeVisible()

    // Delete
    // Finding the delete button within the row
    // Assuming structure: Row > [Info] [Action Buttons]
    // We can filter by the SVG or title
    const deleteBtn = ruleRow.locator('button[title="Delete Rule"]')
    await deleteBtn.click()

    // Verify gone
    await expect(window.locator('text=Delete Me')).not.toBeVisible()
  })
})
