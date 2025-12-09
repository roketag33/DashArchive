import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'

test.describe('AI Rules Lifecycle & Validation', () => {
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
    
    // Open Settings
    await window.click('button[title="Settings"]')
    // Wait for modal to render and fetch settings
    await expect(window.locator('text=Manage your organization rules')).toBeVisible()
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  test('should validate empty AI fields', async () => {
    await window.click('[data-testid="add-rule-btn"]')
    
    // Switch to AI
    await window.click('[data-testid="rule-mode-ai"]')
    
    // Clear name
    await window.fill('input[placeholder="Rule Name"]', '')
    
    // Attempt save
    await window.click('[data-testid="save-rule-btn"]')
    
    // Modal should stay open (inputs visible)
    const nameInput = window.locator('input[placeholder="Rule Name"]')
    await expect(nameInput).toBeVisible()
    
    // Fix to be valid
    await window.fill('input[placeholder="Rule Name"]', 'Valid Name')
    // Attempt save again if needed, or just verify state
  })

  test('should delete an AI rule', async () => {
    // Create a rule first
    await window.click('[data-testid="add-rule-btn"]')
    await window.click('[data-testid="rule-mode-ai"]')

    await window.fill('input[placeholder="Rule Name"]', 'Delete Me')
    await window.fill('input[placeholder="Destination Folder"]', 'Trash')
    
    // Add a tag to make it valid
    await window.locator('div', { hasText: 'Invoice' }).last().click()
    
    await window.click('[data-testid="save-rule-btn"]')

    // Verify created
    const ruleRow = window.locator('div', { hasText: 'Delete Me' }).first()
    await expect(ruleRow).toBeVisible()

    // Delete
    // Find the delete button within the row
    const deleteBtn = ruleRow.locator('[data-testid="delete-rule-btn"]')
    await deleteBtn.click()

    // Verify gone
    await expect(window.locator('text=Delete Me')).not.toBeVisible()
  })
})
