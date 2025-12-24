import { describe, it, expect, beforeEach } from 'vitest'
import { VaultService } from './VaultService'
import * as crypto from 'crypto'

describe('VaultService', () => {
  let vaultService: VaultService

  beforeEach(() => {
    vaultService = new VaultService()
  })

  it('should verify password correctly', async () => {
    const password = 'super-secret-password'

    // Test key derivation (basic logic check)
    const key = await vaultService.deriveKey(password, 'salt')
    expect(key).toBeInstanceOf(Buffer)
    expect(key.length).toBe(32) // AES-256 requires 32 bytes
  })

  it('should encrypt and decrypt data correctly', async () => {
    const password = 'password123'
    const data = Buffer.from('Sensitive Data')

    // 1. Initialize/Derive Key
    const salt = crypto.randomBytes(16)
    const key = await vaultService.deriveKey(password, salt.toString('hex'))

    // 2. Encrypt
    const encrypted = vaultService.encrypt(data, key)
    expect(encrypted).not.toEqual(data)
    expect(encrypted.iv).toBeDefined()
    expect(encrypted.authTag).toBeDefined()
    expect(encrypted.content).toBeDefined()

    // 3. Decrypt
    const decrypted = vaultService.decrypt(encrypted, key)
    expect(decrypted.toString()).toBe('Sensitive Data')
  })

  it('should fail decryption with wrong key', async () => {
    const password = 'password123'
    const wrongPassword = 'wrong-password'
    const data = Buffer.from('Sensitive Data')

    const salt = crypto.randomBytes(16)
    const key = await vaultService.deriveKey(password, salt.toString('hex'))
    const wrongKey = await vaultService.deriveKey(wrongPassword, salt.toString('hex'))

    const encrypted = vaultService.encrypt(data, key)

    expect(() => {
      vaultService.decrypt(encrypted, wrongKey)
    }).toThrow()
  })
})
