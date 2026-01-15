import React, { useState } from 'react'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { ArrowRight, Check, Briefcase, Palette, Code, GraduationCap, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { LIFE_BLOCKS } from './presets'

const ONBOARDING_KEY = 'dasharchive-onboarding-completed'

export const OnboardingModal = (): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(() => {
    return !localStorage.getItem(ONBOARDING_KEY)
  })
  const [step, setStep] = useState(0)
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleComplete = async (): Promise<void> => {
    setIsSaving(true)
    try {
      // Save selected presets
      await window.api.savePresets(selectedBlocks)
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

  const toggleBlock = (id: string): void => {
    setSelectedBlocks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }

  const getIcon = (name: string): React.ReactNode => {
    switch (name) {
      case 'Briefcase':
        return <Briefcase className="w-8 h-8" />
      case 'Palette':
        return <Palette className="w-8 h-8" />
      case 'Code':
        return <Code className="w-8 h-8" />
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8" />
      default:
        return <Sparkles className="w-8 h-8" />
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
      id: 'blocks',
      title: 'Qui êtes-vous ?',
      description: 'Sélectionnez vos "Briques de Vie" pour configurer le Ghost.',
      content: (
        <div className="grid grid-cols-2 gap-3 py-4 w-full">
          {LIFE_BLOCKS.map((block) => {
            const isSelected = selectedBlocks.includes(block.id)
            return (
              <button
                key={block.id}
                onClick={() => toggleBlock(block.id)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-center gap-3',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md scale-105'
                    : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div
                  className={cn(
                    'p-3 rounded-full transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {getIcon(block.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{block.label}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                    {block.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )
    }
  ]

  const currentStep = steps[step]
  const canContinue = step !== 1 || selectedBlocks.length > 0

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && selectedBlocks.length > 0) handleComplete()
      }}
    >
      <DialogContent className="max-w-md sm:max-w-xl p-0 border-0 overflow-hidden bg-background">
        <div className="relative h-full flex flex-col min-h-[500px]">
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

              <Button onClick={handleNext} className="flex-1" disabled={!canContinue || isSaving}>
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
