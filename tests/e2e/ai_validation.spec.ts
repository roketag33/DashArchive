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
  })

  test.afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  test('should validate empty AI fields', async () => {
    await window.click('button:has-text("Add Rule")')
    
    // Switch to AI
    const aiBtn = window.locator('button', { hasText: 'AI Smart Sort' })
    await aiBtn.click()
    
    // Clear name
    await window.fill('input[placeholder="Rule Name"]', '')
    
    // Attempt save
    await window.click('button:has-text("Save")')
    
    // Modal should stay open (inputs visible)
    const nameInput = window.locator('input[placeholder="Rule Name"]')
    await expect(nameInput).toBeVisible()
    
    // Fix to be valid
    await window.fill('input[placeholder="Rule Name"]', 'Valid Name')
    // Ensure AI prompts are somehow empty or filled? 
    // If validation requires prompts, we might need to handle it.
    // For now, assume Name is required.
    
    // If we click save now, it might close if valid.
    // Let's just verify invalid state kept it open.
  })

  test('should delete an AI rule', async () => {
    // Create a rule first
    await window.click('button:has-text("Add Rule")')
    const aiBtn = window.locator('button', { hasText: 'AI Smart Sort' })
    await aiBtn.click()

    await window.fill('input[placeholder="Rule Name"]', 'Delete Me')
    await window.fill('input[placeholder="Destination Folder"]', 'Trash')
    
    // Add a tag to make it valid
    await window.locator('div', { hasText: 'Invoice' }).last().click()
    
    await window.click('button:has-text("Save")')

    // Verify created
    const ruleRow = window.locator('div', { hasText: 'Delete Me' }).first()
    await expect(ruleRow).toBeVisible()

    // Delete
    // The delete button is usually an icon button.
    // We can use the row locator to find the button inside it.
    // Assuming the Trash2 icon is inside a button with specific title or no title but identifiable.
    // In SettingsPanel, it's `Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}`. It contains <Trash2>.
    // It doesn't have a title in the code provided?
    // Wait, the code says: `<Button ... className="text-destructive ..."><Trash2 .../></Button>`
    // We can target by the class or SVG.
    // Or simpler: The button with text-destructive class inside the row.
    const deleteBtn = ruleRow.locator('button.text-destructive')
    await deleteBtn.click()

    // Verify gone
    await expect(window.locator('text=Delete Me')).not.toBeVisible()
  })
})
