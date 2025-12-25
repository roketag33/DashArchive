import { ipcMain } from 'electron'
import { vaultService } from '../services/security/VaultService'
import { VaultFileSystemService } from '../services/security/VaultFileSystemService'
import log from 'electron-log'

const fileSystemService = new VaultFileSystemService()

export function registerVaultHandlers(): void {
  ipcMain.handle('vault:unlock', async (_, password: string) => {
    try {
      const success = await vaultService.unlock(password)
      log.info(`[Vault] Unlock attempt: ${success ? 'Success' : 'Failed'}`)
      return success
    } catch (error) {
      log.error('[Vault] Unlock error:', error)
      return false
    }
  })

  ipcMain.handle('vault:lock', () => {
    vaultService.lock()
    log.info('[Vault] Locked')
  })

  ipcMain.handle('vault:status', () => {
    return vaultService.isUnlocked()
  })

  ipcMain.handle('vault:encrypt-file', async (_, { source, dest }) => {
    try {
      if (!vaultService.isUnlocked()) throw new Error('Vault is locked')
      const key = vaultService.getMasterKey()

      log.info(`[Vault] Encrypting ${source} -> ${dest}`)
      await fileSystemService.encryptFile(source, dest, key)
      return { success: true }
    } catch (error) {
      log.error('[Vault] Encryption failed:', error)
      throw error
    }
  })

  // Decrypt directly to a file (Export)
  ipcMain.handle('vault:decrypt-file', async (_, { source, dest }) => {
    try {
      if (!vaultService.isUnlocked()) throw new Error('Vault is locked')
      const key = vaultService.getMasterKey()

      log.info(`[Vault] Decrypting ${source} -> ${dest}`)
      await fileSystemService.decryptFile(source, dest, key)
      return { success: true }
    } catch (error) {
      log.error('[Vault] Decryption failed:', error)
      throw error
    }
  })
}
