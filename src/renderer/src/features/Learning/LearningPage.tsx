import React, { useState } from 'react'
import { FolderSearch, Brain, FileText, Folder } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
// import { FolderProfile } from '../../../../main/services/core/learning' // Types can be inferred or imported if shared
// Using 'any' for profile initially to avoid strict type import issues across boundaries if shared/types isn't updated yet in renderer
type FolderProfile = {
  path: string
  fileCount: number
  extensions: Record<string, number>
  samples: string[]
  subfolders: string[]
}

export function LearningPage(): React.JSX.Element {
  const [analyzing, setAnalyzing] = useState(false)
  const [profiles, setProfiles] = useState<FolderProfile[]>([])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleScan = async () => {
    setAnalyzing(true)
    try {
      // Pick folder
      const path = await window.api.selectFolder()
      if (path) {
        const results = await window.api.analyzeFolder(path)
        setProfiles(results)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  // derived stats
  const totalFiles = profiles.reduce((acc, p) => acc + p.fileCount, 0)
  const rootProfile = profiles[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cerveau Numérique</h2>
          <p className="text-muted-foreground">
            Analysez vos dossiers pour permettre à l&apos;IA de comprendre votre logique.
          </p>
        </div>
        <Button
          onClick={handleScan}
          disabled={analyzing}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {analyzing ? (
            <Brain className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderSearch className="mr-2 h-4 w-4" />
          )}
          {analyzing ? 'Analyse en cours...' : 'Scanner un dossier'}
        </Button>
      </div>

      {profiles.length === 0 ? (
        <EmptyState onScan={handleScan} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Overview Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Resume de l&apos;Analyse</CardTitle>
              <CardDescription>Structure détectée dans {rootProfile?.path}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-8">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalFiles}</p>
                  <p className="text-xs text-muted-foreground">Fichiers trouvés</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{profiles.length}</p>
                  <p className="text-xs text-muted-foreground">Dossiers scannés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extensions Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Types de Fichiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(rootProfile?.extensions || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([ext, count]) => (
                    <div key={ext} className="flex justify-between items-center text-sm">
                      <span className="uppercase font-mono bg-muted px-2 py-0.5 rounded text-xs">
                        {ext}
                      </span>
                      <span className="text-muted-foreground">{count} fichiers</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Structure Insights */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Structure & Stratégie</CardTitle>
              <CardDescription>Ce que l&apos;IA a déduit de votre organisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Analyse Préliminaire
                </h4>
                <p className="text-sm mt-2 text-purple-700 dark:text-purple-400">
                  L&apos;IA a détecté {rootProfile?.subfolders.length} sous-dossiers principaux.
                  {rootProfile?.subfolders.some((f) => /^\d{4}$/.test(f))
                    ? ' Il semble y avoir une organisation chronologique (Années détectées).'
                    : " L'organisation semble thématique."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {rootProfile?.subfolders.map((sub) => (
                  <div
                    key={sub}
                    className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{sub}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
      <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
        <Brain className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucune donnée d&apos;apprentissage</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Le cerveau est vide. Scannez un dossier de référence (ex: &quot;Mes Documents&quot;) pour
        apprendre vos habitudes.
      </p>
      <Button onClick={onScan} variant="outline">
        Commencer l&apos;analyse
      </Button>
    </div>
  )
}
