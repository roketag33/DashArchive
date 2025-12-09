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
  it('should assign correct rules to files', async () => {
    const plan = await buildPlan([mockFile1, mockFile2], mockRules)
    expect(plan.totalFiles).toBe(2)

    const move1 = plan.items.find((i) => i.file.name === 'img1.jpg')
    expect(move1).toBeDefined()
    expect(move1?.ruleId).toBe('r1') // Img rule
    expect(move1?.destinationPath).toBe('/src/Images/img1.jpg')

    const move2 = plan.items.find((i) => i.file.name === 'doc.pdf')
    expect(move2).toBeDefined()
    expect(move2?.ruleId).toBe('r2') // Fallback rule in mock
    expect(move2?.destinationPath).toBe('/src/Others/doc.pdf') // Relative to /src/doc.pdf
  })

  it('should handle conflict resolution renaming', async () => {
    // File 1: conflict.jpg -> /source/Images/conflict.jpg
    // File 2: sub/conflict.jpg -> /source/sub/Images/conflict.jpg (Relative to source!)

    // Note: With "Relative to Source" logic, they go to different folders, so NO CONFLICT!
    // Unless we force them to same folder.
    // In this test setup, they go to different folders:
    // /source/Images/conflict.jpg
    // /source/sub/Images/conflict.jpg
    // So 'conflict (1)' logic won't trigger if they are in different dirs.
    // To test conflict, we need them to resolve to SAME destination.

    const file1: FileEntry = {
      path: '/source/conflict.jpg',
      name: 'conflict.jpg',
      extension: 'jpg',
      size: 100,
      createdAt: new Date(),
      modifiedAt: new Date(),
      category: 'image'
    }
    const file2: FileEntry = {
      path: '/source/other_conflict.jpg',
      name: 'conflict.jpg',
      extension: 'jpg',
      size: 100,
      createdAt: new Date(),
      modifiedAt: new Date(),
      category: 'image'
    }
    // Rule maps both to 'Images/conflict.jpg' (since name is {name} and both are unnamed? No rule uses {name}?)
    // Wait, resolveDestination uses file.name if pattern doesn't have {name}.
    // If rule dest is 'Images', dest is 'Images/conflict.jpg'.
    // If both files are named 'conflict.jpg', dest is same IF they are in same dir.

    const inputFiles = [file1, file2]
    const plan = await buildPlan(inputFiles, mockRules)

    expect(plan.items).toHaveLength(2)
    const item1 = plan.items.find((i) => i.file.path === '/source/conflict.jpg')
    const item2 = plan.items.find((i) => i.file.path === '/source/other_conflict.jpg')

    expect(item1?.destinationPath).toBe('/source/Images/conflict.jpg')
    expect(item2?.destinationPath).toBe('/source/Images/conflict (1).jpg')
    expect(item2?.status).toBe('ok')
  })

  it('should skip files matching no rules (if no fallback)', async () => {
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
    const plan = await buildPlan([mockFile2], strictRules) // doc.pdf
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
