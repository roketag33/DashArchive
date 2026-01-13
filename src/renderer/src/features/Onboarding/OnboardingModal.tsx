import React, { useState } from 'react'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Mic, Shield, Brain, FolderLock, ArrowRight, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

const ONBOARDING_KEY = 'dasharchive-onboarding-completed'

export const OnboardingModal = (): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(() => {
    return !localStorage.getItem(ONBOARDING_KEY)
  })
  const [step, setStep] = useState(0)

  const handleComplete = (): void => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsOpen(false)
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
      title: 'Bienvenue sur DashArchive',
      description: 'Votre nouvel assistant personnel pour organiser vos fichiers intelligemment.',
      icon: <Brain className="w-16 h-16 text-primary mb-4" />,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Confidentialité Totale (Local First)',
      description:
        "Vos données restent chez vous. L'IA tourne en local sur votre machine. Rien ne part dans le cloud.",
      icon: <Shield className="w-16 h-16 text-green-500 mb-4" />,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Intelligence Artificielle',
      description:
        'Utilisez la commande vocale ("Jarvis") et le Chat RAG pour interagir avec vos documents.',
      icon: <Mic className="w-16 h-16 text-red-500 mb-4" />,
      color: 'bg-red-500/10 text-red-500'
    },
    {
      title: 'Coffre-fort Sécurisé',
      description:
        "Chiffrez vos fichiers sensibles par simple glisser-déposer dans l'onglet Vault.",
      icon: <FolderLock className="w-16 h-16 text-yellow-500 mb-4" />,
      color: 'bg-yellow-500/10 text-yellow-500'
    }
  ]

  const currentStep = steps[step]

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing by clicking outside if not finished?
        // For UX we usually allow closing, but maybe we want to force completion or at least mark as read if closed?
        // Let's allow closing and mark as read to avoid annoyance.
        if (!open) handleComplete()
      }}
    >
      <DialogContent className="max-w-md sm:max-w-lg p-0 border-0 overflow-hidden bg-background">
        <div className="relative h-full flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-8 flex flex-col items-center text-center pt-12">
            <div
              className={cn(
                'p-4 rounded-full mb-6 transition-colors duration-300',
                currentStep.color
              )}
            >
              {currentStep.icon}
            </div>

            <h2 className="text-2xl font-bold mb-2 tracking-tight">{currentStep.title}</h2>
            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
              {currentStep.description}
            </p>

            <div className="flex items-center gap-2 mt-auto w-full">
              <Button variant="ghost" className="flex-1" onClick={handleComplete}>
                Passer
              </Button>
              <div className="flex gap-1 mx-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      i === step ? 'bg-primary w-4' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <Button onClick={handleNext} className="flex-1">
                {step === steps.length - 1 ? (
                  <>
                    Commencer <Check className="ml-2 w-4 h-4" />
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
