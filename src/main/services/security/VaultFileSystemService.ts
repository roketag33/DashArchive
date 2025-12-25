import * as fs from 'fs'
import * as crypto from 'crypto'
import { pipeline } from 'stream/promises'

export class VaultFileSystemService {
  private readonly ALGORITHM = 'aes-256-gcm'

  /**
   * Encrypts a file using AES-256-GCM stream.
   * Format: [IV 16B] [Encrypted Content] [AuthTag 16B]
   */
  async encryptFile(sourcePath: string, destPath: string, key: Buffer): Promise<void> {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv)

    const input = fs.createReadStream(sourcePath)
    const output = fs.createWriteStream(destPath)

    // Write IV first
    output.write(iv)

    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output, { end: false })

      cipher.on('end', () => {
        try {
          const authTag = cipher.getAuthTag()
          output.write(authTag)
          output.end()
          resolve()
        } catch (err) {
          output.end() // Ensure stream is closed even on error
          reject(err)
        }
      })

      cipher.on('error', (err) => {
        output.end()
        reject(err)
      })

      input.on('error', (err) => {
        output.end()
        reject(err)
      })
    })
  }

  /**
   * Decrypts a file. Reads IV from start, Tag from end.
   */
  async decryptFile(sourcePath: string, destPath: string, key: Buffer): Promise<void> {
    // 1. Get file size to locate AuthTag
    const stats = await fs.promises.stat(sourcePath)
    const fileSize = stats.size

    if (fileSize < 32) {
      // 16B IV + 16B Tag = 32B min
      throw new Error('File too short (corrupted or not encrypted correctly)')
    }

    // 2. Read IV (Start) and AuthTag (End)
    const fd = await fs.promises.open(sourcePath, 'r')
    const iv = Buffer.alloc(16)
    const authTag = Buffer.alloc(16)

    try {
      await fd.read(iv, 0, 16, 0) // Read 16 bytes at pos 0
      await fd.read(authTag, 0, 16, fileSize - 16) // Read 16 bytes at end
    } finally {
      await fd.close()
    }

    // 3. Setup Decipher
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // 4. Stream the middle content
    // Content starts at 16, length is fileSize - 16 (IV) - 16 (Tag)
    // fs.createReadStream end is inclusive, so we want up to fileSize - 17
    const input = fs.createReadStream(sourcePath, { start: 16, end: fileSize - 17 })
    const output = fs.createWriteStream(destPath)

    await pipeline(input, decipher, output)
  }
}
