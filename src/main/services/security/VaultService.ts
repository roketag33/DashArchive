import * as crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

interface EncryptedData {
  iv: Buffer
  authTag: Buffer
  content: Buffer
}

interface VaultMeta {
  salt: string
  canary: string // Encrypted "valid" string to verify password
}

export class VaultService {
  private readonly ALGORITHM = 'aes-256-gcm'
  private readonly KEY_LENGTH = 32
  private readonly IV_LENGTH = 16
  private masterKey: Buffer | null = null
  private readonly META_FILE = 'vault.meta.json'

  private get metaPath(): string {
    return path.join(app.getPath('userData'), this.META_FILE)
  }

  public isUnlocked(): boolean {
    return this.masterKey !== null
  }

  public lock(): void {
    this.masterKey = null
  }

  public getMasterKey(): Buffer {
    if (!this.masterKey) throw new Error('Vault is locked')
    return this.masterKey
  }

  /**
   * Initializes or unlocks the vault.
   * If first run, creates new salt and sets up canary.
   * If existing, verifies password handling.
   */
  public async unlock(password: string): Promise<boolean> {
    try {
      // 1. Check if meta exists
      if (!fs.existsSync(this.metaPath)) {
        return await this.initializeVault(password)
      }

      // 2. Load meta
      const metaStr = fs.readFileSync(this.metaPath, 'utf-8')
      const meta: VaultMeta = JSON.parse(metaStr)

      // 3. Derive key
      const key = await this.deriveKey(password, meta.salt)

      // 4. Verify Canary (try to decrypt)
      // The canary is just an encrypted string "VALID".
      // We stored it as hex: iv:authtag:content
      const [ivHex, tagHex, contentHex] = meta.canary.split(':')
      const encryptedCanary: EncryptedData = {
        iv: Buffer.from(ivHex, 'hex'),
        authTag: Buffer.from(tagHex, 'hex'),
        content: Buffer.from(contentHex, 'hex')
      }

      try {
        const decrypted = this.decrypt(encryptedCanary, key)
        if (decrypted.toString() === 'VALID') {
          this.masterKey = key
          return true
        }
      } catch {
        // Decryption failed = wrong password
        return false
      }
      return false
    } catch (err) {
      console.error('Vault unlock error:', err)
      return false
    }
  }

  private async initializeVault(password: string): Promise<boolean> {
    const salt = crypto.randomBytes(16).toString('hex')
    const key = await this.deriveKey(password, salt)

    // Create Canary
    const canaryData = Buffer.from('VALID')
    const encrypted = this.encrypt(canaryData, key)

    // Serialize Canary: iv:tag:content
    const canaryStr = `${encrypted.iv.toString('hex')}:${encrypted.authTag.toString('hex')}:${encrypted.content.toString('hex')}`

    const meta: VaultMeta = {
      salt,
      canary: canaryStr
    }

    fs.writeFileSync(this.metaPath, JSON.stringify(meta))
    this.masterKey = key
    return true
  }

  /**
   * Derives a secure key from a password using PBKDF2.
   * @param password The user's password.
   * @param salt The salt (hex string).
   */
  public async deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, this.KEY_LENGTH, 'sha256', (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey)
      })
    })
  }

  /**
   * Encrypts a buffer using AES-256-GCM.
   */
  public encrypt(data: Buffer, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv)

    const encryptedContent = Buffer.concat([cipher.update(data), cipher.final()])
    const authTag = cipher.getAuthTag()

    return {
      iv,
      authTag,
      content: encryptedContent
    }
  }

  /**
   * Decrypts an encrypted object.
   */
  public decrypt(encryptedData: EncryptedData, key: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, encryptedData.iv)
    decipher.setAuthTag(encryptedData.authTag)

    return Buffer.concat([decipher.update(encryptedData.content), decipher.final()])
  }
}

export const vaultService = new VaultService()
