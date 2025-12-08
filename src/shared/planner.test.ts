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

const mockRules: Rule[] = [
  {
    id: 'r1',
    name: 'Img',
    isActive: true,
    priority: 1,
    type: 'extension',
    extensions: ['jpg'],
    destination: 'Images'
  },
  {
    id: 'r2',
    name: 'Fallback',
    isActive: true,
    priority: 0,
    type: 'fallback',
    destination: 'Others'
  }
]

describe('Plan Builder', () => {
  it('should assign correct rules to files', () => {
    const plan = buildPlan([mockFile1, mockFile2], mockRules)
    expect(plan.totalFiles).toBe(2)

    const move1 = plan.items.find((i) => i.file.name === 'img1.jpg')
    expect(move1).toBeDefined()
    expect(move1?.ruleId).toBe('r1') // Img rule
    expect(move1?.destinationPath).toBe('Images/img1.jpg')

    const move2 = plan.items.find((i) => i.file.name === 'doc.pdf')
    expect(move2).toBeDefined()
    expect(move2?.ruleId).toBe('r2') // Fallback rule
    expect(move2?.destinationPath).toBe('Others/doc.pdf')
  })

  it('should handle conflict resolution renaming', () => {
    // Two files resulting in same destination
    // File 1: conflict.jpg -> Images/conflict.jpg
    // File 2: conflict.jpg (different folder but same name) -> Images/conflict.jpg -> Images/conflict (1).jpg

    // Determine order: plan builder preserves order of input files
    const file1 = { ...mockFile1, name: 'conflict.jpg', path: '/source/conflict.jpg' }
    const file2 = { ...mockFile1, name: 'conflict.jpg', path: '/source/sub/conflict.jpg' }

    const plan = buildPlan([file1, file2], mockRules)

    expect(plan.totalFiles).toBe(2)

    const item1 = plan.items.find((i) => i.file.path === '/source/conflict.jpg')
    const item2 = plan.items.find((i) => i.file.path === '/source/sub/conflict.jpg')

    expect(item1?.destinationPath).toBe('Images/conflict.jpg')
    expect(item2?.destinationPath).toBe('Images/conflict (1).jpg')
    expect(item2?.status).toBe('ok')
  })

  it('should skip files matching no rules (if no fallback)', () => {
    const strictRules: Rule[] = [
      {
        id: 'r1',
        name: 'Img',
        isActive: true,
        priority: 1,
        type: 'extension',
        extensions: ['jpg'],
        destination: 'Images'
      }
    ]
    const plan = buildPlan([mockFile2], strictRules) // doc.pdf
    expect(plan.totalFiles).toBe(1)
    expect(plan.items).toHaveLength(0)
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
