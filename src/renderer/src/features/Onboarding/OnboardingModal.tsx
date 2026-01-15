import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import { Label } from '../../components/ui/label'
import { ArrowRight, Check, Sparkles, Brain, FolderInput } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Rule } from '../../../../shared/types'
import { v4 as uuidv4 } from 'uuid'

const ONBOARDING_KEY = 'dasharchive-onboarding-completed'

export const OnboardingModal = (): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(() => {
    return !localStorage.getItem(ONBOARDING_KEY)
  })
  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // AI Fallback State
  const [enableFallback, setEnableFallback] = useState(true)
  const [fallbackCategories, setFallbackCategories] = useState(
    'Administratif, Personnel, Factures, Divers'
  )
  const [documentsPath, setDocumentsPath] = useState<string>('')

  useEffect(() => {
    // Fetch paths for default destination
    window.api.getSystemPaths().then((paths) => {
      setDocumentsPath(paths.documents)
    })
  }, [])

  const handleComplete = async (): Promise<void> => {
    setIsSaving(true)
    try {
      // 1. If Fallback enabled, create the wildcard rule
      if (enableFallback) {
        const currentRules = await window.api.getRules()
        const categories = fallbackCategories
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s)

        const fallbackRule: Rule = {
          id: uuidv4(),
          name: 'Tri Intelligent (Reste)',
          type: 'ai',
          extensions: ['*'],
          isActive: true,
          priority: 0, // Low priority to act as fallback
          destination: `${documentsPath}/{{category}}`,
          aiPrompts: categories.length > 0 ? categories : ['Divers'],
          description: 'Gère les fichiers qui ne correspondent à aucune autre règle.'
        }

        await window.api.saveSettings({
          rules: [...currentRules, fallbackRule]
        })
      }

      localStorage.setItem(ONBOARDING_KEY, 'true')
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to save presets:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = (): void => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur DashArchive',
      description: 'Le Ghost Librarian qui range vos fichiers à votre place.',
      content: (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <p className="text-center text-muted-foreground max-w-xs">
            Dites adieu au chaos numérique. Laissez l&apos;IA organiser votre vie numérique en tâche
            de fond.
          </p>
        </div>
      )
    },

    {
      id: 'ai-fallback',
      title: 'Intelligence Artificielle',
      description: 'Que faire des fichiers qui ne correspondent à aucune règle ?',
      content: (
        <div className="flex flex-col gap-6 py-4 w-full">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Tri Intelligent</span>
                <span className="text-xs text-muted-foreground">
                  L&apos;IA analyse le contenu et le nom pour deviner le dossier.
                </span>
              </div>
            </div>
            <Switch checked={enableFallback} onCheckedChange={setEnableFallback} />
          </div>

          {enableFallback && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label>Catégories Sugggérées</Label>
                <Input
                  value={fallbackCategories}
                  onChange={(e) => setFallbackCategories(e.target.value)}
                  placeholder="Ex: Factures, Contrats, Photos..."
                />
                <p className="text-[10px] text-muted-foreground">
                  L&apos;IA choisira parmi ces catégories pour ranger vos fichiers inconnus.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded border text-xs text-muted-foreground">
                <FolderInput className="w-4 h-4" />
                Destination :{' '}
                {documentsPath ? `${documentsPath}/{{category}}` : 'Documents/{{category}}'}
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  const currentStep = steps[step]

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing by clicking outside if not complete?
        // Actually the code allows closing if blocks selected.
        if (!isOpen && !open) return // safety
        // if (!open && selectedBlocks.length > 0) handleComplete() // removed
      }}
    >
      <DialogContent className="max-w-md sm:max-w-xl p-0 border-0 overflow-hidden bg-background">
        <div className="relative h-full flex flex-col min-h-[550px]">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-8 flex flex-col items-center flex-1">
            <h2 className="text-2xl font-bold mb-2 tracking-tight text-center">
              {currentStep.title}
            </h2>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              {currentStep.description}
            </p>

            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {currentStep.content}
            </div>

            <div className="flex items-center gap-2 mt-8 w-full">
              {step === 0 && (
                <Button variant="ghost" className="flex-1 opacity-0 pointer-events-none">
                  Retour
                </Button>
              )}
              {step > 0 && (
                <Button variant="ghost" className="flex-1" onClick={() => setStep(step - 1)}>
                  Retour
                </Button>
              )}

              <div className="flex gap-1.5 mx-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      i === step ? 'bg-primary w-6' : 'bg-muted'
                    )}
                  />
                ))}
              </div>

              <Button onClick={handleNext} className="flex-1" disabled={isSaving}>
                {step === steps.length - 1 ? (
                  <>
                    {isSaving ? 'Configuration...' : 'Terminer'} <Check className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Suivant <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
