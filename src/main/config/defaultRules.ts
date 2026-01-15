import { app } from 'electron'
import { join } from 'path'
import { Rule } from '../../shared/types'

export const getDefaultRules = (): Rule[] => {
  const home = app.getPath('home')

  // Use relative paths or absolute helpers if needed, but simpler to match Universal Rules style
  // defaultRules usually assume specific targets.

  return [
    {
      id: 'admin',
      name: 'Documents Administratifs',
      type: 'extension',
      extensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'txt', 'csv'],
      destination: join(home, 'Documents', 'Admin'),
      isActive: true,
      priority: 20, // Higher priority
      description: 'Factures, contrats et documents officiels'
    },
    {
      id: 'media',
      name: 'Photos & Souvenirs',
      type: 'extension',
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'svg', 'mov', 'mp4'],
      destination: join(home, 'Pictures', 'Sorted'),
      isActive: true,
      priority: 20,
      description: 'Photos et vidéos personnelles'
    },
    {
      id: 'misc',
      name: 'Vrac & Installateurs',
      type: 'extension',
      extensions: ['zip', 'rar', '7z', 'dmg', 'pkg', 'iso'],
      destination: join(home, 'Downloads', 'Installers'),
      isActive: true,
      priority: 10,
      description: "Archives et fichiers d'installation"
    },
    // Keep a fallback Dev rule maybe?
    {
      id: 'dev',
      name: 'Code & Scripts',
      type: 'extension',
      extensions: ['js', 'ts', 'tsx', 'json', 'py', 'java'],
      destination: join(home, 'Documents', 'Dev'),
      isActive: true,
      priority: 5,
      description: 'Fichiers de développement'
    }
  ]
}
