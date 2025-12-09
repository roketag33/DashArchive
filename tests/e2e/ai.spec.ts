import { test, expect } from '@playwright/test'

test.describe('AI Settings UI', () => {
  test.beforeEach(async ({ page }) => {
    // Launch app
    await page.goto('/')
  })

  test('should allow creating an AI rule with Quick Tags', async ({ page }) => {
    // Open Settings
    await page.click('button[title="Settings"]')
    await expect(page.locator('text=Manage your organization rules')).toBeVisible()

    // Add Rule
    await page.click('text=Add Rule')
    
    // Switch to AI Mode (if rule mode selector exists, assuming default is manual or extension)
    // The "Rule Mode" selector has "AI Smart Sort" text
    await page.click('text=AI Smart Sort')

    // Check if input placeholder changes or Quick Tags appear
    const input = page.locator('input[placeholder*="Categories"]')
    await expect(input).toBeVisible()

    // Click a Quick Tag (e.g., "Invoice")
    await page.click('text=Invoice')
    
    // Check input value
    await expect(input).toHaveValue('Invoice')

    // Click another tag
    await page.click('text=Receipt')
    
    // Check appended value
    await expect(input).toHaveValue('Invoice, Receipt')

    // Click "Invoice" again to remove it
    await page.click('text=Invoice')
    await expect(input).toHaveValue('Receipt')

    // Set other fields
    await page.fill('input[placeholder="Rule Name"]', 'My AI Rule')
    await page.fill('input[placeholder="Destination Folder"]', 'AI_Docs')

    // Save
    await page.click('text=Save')

    // Verify Rule appears in list
    await expect(page.locator('text=My AI Rule')).toBeVisible()
    await expect(page.locator('text=AI_Docs')).toBeVisible()
  })

  test('should allow Magic Suggest button interaction', async ({ page }) => {
    await page.click('button[title="Settings"]')
    await page.click('text=Add Rule')
    await page.click('text=AI Smart Sort')

    // Magic Wand button
    const wandBtn = page.locator('button[title*="Magic Suggest"]')
    await expect(wandBtn).toBeVisible()
    
    // Note: Clicking it triggers IPC which might fail or do nothing in mockless E2E if folders aren't set up.
    // We mainly verify the UI element exists and is clickable.
    await expect(wandBtn).toBeEnabled()
  })
})
