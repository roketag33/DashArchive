import { test, expect } from '@playwright/test'

test.describe('AI Rules Lifecycle & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('button[title="Settings"]')
  })

  test('should validate empty AI fields', async ({ page }) => {
    await page.click('text=Add Rule')
    await page.click('text=AI Smart Sort')
    
    // Clear name if any
    await page.fill('input[placeholder="Rule Name"]', '')
    
    // Attempt save
    await page.click('text=Save')
    
    // Should show error or not close modal
    // Assuming HTML5 validation or UI error toast.
    // If we use standard required text, we check for validation message or that modal is still open.
    const modal = page.locator('text=Edit Rule')
    await expect(modal).toBeVisible()
    
    // Check for error visualization (e.g. red border or message) could be tricky without implementation details.
    // simpler: fill name, leave prompts empty.
    await page.fill('input[placeholder="Rule Name"]', 'Valid Name')
    await page.fill('input[placeholder*="Categories"]', '') // Clear prompts
    await page.click('text=Save')
    
    // Check modal still open
    await expect(modal).toBeVisible()
  })

  test('should delete an AI rule', async ({ page }) => {
    // Create a rule first
    await page.click('text=Add Rule')
    await page.click('text=AI Smart Sort')
    await page.fill('input[placeholder="Rule Name"]', 'Delete Me')
    await page.fill('input[placeholder="Destination Folder"]', 'Trash')
    await page.click('text=Invoice') // Add tag
    await page.click('text=Save')

    // Verify created
    const ruleRow = page.locator('div', { hasText: 'Delete Me' }).first()
    await expect(ruleRow).toBeVisible()

    // Delete
    const deleteBtn = ruleRow.locator('button[title="Delete Rule"]') // or similar icon
    // We might need to scope it better if buttons are generic icons
    // Using nth if multiple rules, but "Delete Me" is unique.
    
    // Click delete. Assuming confirmation or direct delete.
    // If we implemented confirmation, we need to handle it.
    // Standard SettingsPanel usually has direct delete on icon click or confirm dialog.
    // Inspecting SettingsPanel.tsx previously: `onDelete` is passed to `SettingsPanel`.
    // It renders: `<Button ... onClick={() => onDelete(rule.id)} ...><Trash2 .../></Button>`
    await deleteBtn.click()

    // Verify gone
    await expect(page.locator('text=Delete Me')).not.toBeVisible()
  })
})
