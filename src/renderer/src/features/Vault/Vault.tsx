import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowRight, AlertCircle, Fingerprint, FileLock, Upload } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Tooltip } from '../../components/ui/tooltip'

export function Vault(): React.JSX.Element {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [processingFile, setProcessingFile] = useState<string | null>(null)

  // Check initial status
  useEffect(() => {
    window.api.vault.getStatus().then(setUnlocked)
  }, [])

  const handleUnlock = async (): Promise<void> => {
    if (!password) return

    setLoading(true)
    setError('')

    try {
      const success = await window.api.vault.unlock(password)
      if (success) {
        setUnlocked(true)
      } else {
        setError('Accès refusé. Mot de passe incorrect.')
        setPassword('')
      }
    } catch (err) {
      setError('Erreur lors du déverrouillage.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()

    if (!unlocked) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setProcessingFile('Chiffrement en cours...')

    for (const file of files) {
      try {
        // Encrypt to .enc sidecar
        const dest = `${file.path}.enc`
        await window.api.vault.encryptFile(file.path, dest)
        console.log(`Encrypted ${file.path} to ${dest}`)
      } catch (error) {
        console.error('Encryption failed', error)
        setError(`Échec du chiffrement de ${file.name}`)
      }
    }
    setProcessingFile(null)
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (unlocked) {
    return (
      <div className="h-full w-full p-8 text-foreground flex flex-col items-center justify-center">
        <Shield className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Coffre-fort Ouvert</h1>
        <p className="text-muted-foreground mb-8">
          Vos documents sont déchiffrés et accessibles en mémoire.
        </p>

        <div
          className="p-8 border-2 border-dashed rounded-xl border-muted-foreground/30 w-full max-w-lg flex flex-col items-center justify-center h-64 transition-colors hover:border-primary/50 hover:bg-muted/10"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {processingFile ? (
            <div className="flex flex-col items-center animate-pulse">
              <FileLock className="h-10 w-10 text-primary mb-2" />
              <p className="text-sm font-medium">{processingFile}</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-semibold text-foreground">
                Déposez des fichiers ici pour les chiffrer
              </p>
              <Tooltip content="Chiffrement militaire AES-256-GCM" side="bottom">
                <p className="text-xs text-muted-foreground mt-2 cursor-help">
                  Algorithme AES-256-GCM
                </p>
              </Tooltip>
            </>
          )}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Note: Les fichiers chiffrés (.enc) seront créés à côté des originaux.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 flex flex-col items-center"
      >
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-inner">
          <Lock className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center tracking-tight">Fort Knox</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Zone Sécurisée. Chiffrement AES-256.
          <br />
          Veuillez vous authentifier.
        </p>

        <div className="w-full space-y-4">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Mot de passe maître"
              className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center tracking-widest placeholder:tracking-normal font-mono"
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-red-400 text-sm py-1"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          <Button
            onClick={handleUnlock}
            className="w-full h-12 text-base font-medium transition-all"
            disabled={loading || !password}
          >
            {loading ? (
              <span className="flex items-center gap-2">Déchiffrement...</span>
            ) : (
              <span className="flex items-center gap-2">
                Déverrouiller <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="pt-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/50 hover:text-primary transition-colors"
              title="TouchID (Coming Soon)"
            >
              <Fingerprint className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </motion.div>

      <p className="absolute bottom-8 text-xs text-muted-foreground/30 font-mono">
        SECURE_ENCLAVE_READY • VER: 2.0.4
      </p>
    </div>
  )
}
