import * as crypto from 'crypto'

interface EncryptedData {
  iv: Buffer
  authTag: Buffer
  content: Buffer
}

export class VaultService {
  private readonly ALGORITHM = 'aes-256-gcm'
  private readonly KEY_LENGTH = 32
  private readonly IV_LENGTH = 16

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
   * @param data The data to encrypt.
   * @param key The derived master key.
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
   * Decrypts an encrypted object using AES-256-GCM.
   * @param encryptedData The object containing IV, AuthTag, and Content.
   * @param key The derived master key.
   */
  public decrypt(encryptedData: EncryptedData, key: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, encryptedData.iv)
    decipher.setAuthTag(encryptedData.authTag)

    return Buffer.concat([decipher.update(encryptedData.content), decipher.final()])
  }
}
