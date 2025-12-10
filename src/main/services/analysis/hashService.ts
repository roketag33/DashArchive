import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { FileEntry, DuplicateGroup } from '../../../shared/types'

/**
 * Calculates the SHA-256 hash of a file.
 * Stream-based to handle large files efficiently.
 */
export const calculateFileHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)

    stream.on('error', (err) => reject(err))
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

/**
 * Identifies duplicates in a list of files using a Size-First strategy.
 * 1. Group by size.
 * 2. If >1 file has same size, calculate hash.
 * 3. Group by hash.
 */
export const findDuplicates = async (files: FileEntry[]): Promise<DuplicateGroup[]> => {
  const sizeMap = new Map<number, FileEntry[]>()

  // 1. Group by size
  for (const file of files) {
    if (file.isDirectory) continue
    const filesAtSize = sizeMap.get(file.size) || []
    filesAtSize.push(file)
    sizeMap.set(file.size, filesAtSize)
  }

  const duplicates: DuplicateGroup[] = []

  // 2. Hash collisions
  for (const [size, candidates] of sizeMap.entries()) {
    if (candidates.length < 2) continue

    // Hash map for this specific size
    const hashMap = new Map<string, FileEntry[]>()

    // Resolve hashes in parallel
    await Promise.all(
      candidates.map(async (file) => {
        try {
          const hash = await calculateFileHash(file.path)
          // Mutate file entry to cache hash (optional, but good for UI)
          file.hash = hash
          const filesAtHash = hashMap.get(hash) || []
          filesAtHash.push(file)
          hashMap.set(hash, filesAtHash)
        } catch (error) {
          console.error(`Failed to hash ${file.path}:`, error)
        }
      })
    )

    // 3. Collect true duplicates
    for (const [hash, group] of hashMap.entries()) {
      if (group.length > 1) {
        duplicates.push({
          hash,
          size,
          files: group
        })
      }
    }
  }

  return duplicates
}
