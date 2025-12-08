import { describe, it, expect } from 'vitest'
import { buildPlan } from './planner'
import { FileEntry, Rule } from './types'

const mockFile1: FileEntry = {
  path: '/src/img1.jpg',
  name: 'img1.jpg',
  extension: 'jpg',
  size: 100,
  createdAt: new Date(),
  modifiedAt: new Date('2023-01-01'),
  category: 'image'
}

const mockFile2: FileEntry = {
  path: '/src/doc.pdf',
  name: 'doc.pdf',
  extension: 'pdf',
  size: 100,
  createdAt: new Date(),
  modifiedAt: new Date('2023-01-01'),
  category: 'document'
}

const rules: Rule[] = [
  { id: 'r1', priority: 10, type: 'extension', match: ['jpg'], destination: 'Images' },
  { id: 'r2', priority: 5, type: 'fallback', destination: 'Other' }
]

describe('Plan Builder', () => {
  it('should assign correct rules to files', () => {
    const plan = buildPlan([mockFile1, mockFile2], rules)
    expect(plan.totalFiles).toBe(2)

    const move1 = plan.items.find((i) => i.file.name === 'img1.jpg')
    expect(move1).toBeDefined()
    expect(move1?.destinationPath).toBe('Images/img1.jpg')
    expect(move1?.ruleId).toBe('r1')

    const move2 = plan.items.find((i) => i.file.name === 'doc.pdf')
    expect(move2).toBeDefined()
    // doc.pdf doesn't match r1, should match r2 (fallback)
    expect(move2?.destinationPath).toBe('Other/doc.pdf')
    expect(move2?.ruleId).toBe('r2')
  })

  it('should handle destination collisions with rename', () => {
    const conflictFiles = [
      { ...mockFile1, name: 'dup.jpg' },
      { ...mockFile1, name: 'dup.jpg', path: '/src/sub/dup.jpg' } // Same name, different source
    ]

    // Both go to 'Images/dup.jpg' initially
    const plan = buildPlan(conflictFiles, rules)

    const moves = plan.items
    expect(moves).toHaveLength(2)

    const dests = moves.map((m) => m.destinationPath).sort()
    expect(dests).toEqual(['Images/dup (1).jpg', 'Images/dup.jpg'])
  })

  it('should handle no matching rules', () => {
    const file = { ...mockFile2 } // pdf
    const plan = buildPlan([file], [rules[0]]) // Only jpg rule

    expect(plan.items).toHaveLength(0) // Assuming we ignore files with no rules? Or specific "ignored" status?
    // Let's refine requirements: "Plan includes... Ignored status"
    // If no rule matches, does it appear in plan?
    // Requirement 4.4: Table operations... Status (OK / Conflit / Ignoré)
    // So yes, it should appear with ignored status?
    // Or "Ignoré" means "Rule found but action ignored"?
    // Usually, if no rule matches, we don't move it.
    // Let's assume we ONLY log items that HAVE a matching rule for now, OR return everything.
    // Re-reading: "Le plan est une liste d’opérations".
    // If no rule matches, no operation.
    // But UX might want to show "Unmatched".
    // Let's stick to "If matches rule, add to plan".
    // Wait, "Ignoré" status in req 4.4 likely refers to "Ignorer" conflict strategy.
    // I will implement: If NO rule matches, do NOT add to plan (safe default).
    // Or add with validation error?
    // Let's stick to: No rule = No move = Not in plan (or in a separate "unmatched" list if needed later).
    // For MVP, buildPlan returns proposed moves.
  })
})
