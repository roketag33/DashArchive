import { Rule } from '../../../../shared/types'

export interface LifeBlock {
  id: string
  label: string
  description: string
  icon: string
  presets: Partial<Rule>[] // Simplified rules
}

export const LIFE_BLOCKS: LifeBlock[] = [
  {
    id: 'admin',
    label: 'Administratif',
    description: 'Factures, impôts, contrats...',
    icon: 'Briefcase',
    presets: [
      {
        name: 'Factures & Admin',
        extensions: ['pdf'],
        destination: 'Documents/Administratif',
        description: 'Auto-classement des PDF administratifs'
      }
    ]
  },
  {
    id: 'creative',
    label: 'Créatif',
    description: 'Images, assets, design...',
    icon: 'Palette',
    presets: [
      {
        name: 'Images & Assets',
        extensions: ['jpg', 'png', 'svg', 'webp', 'psd', 'ai'],
        destination: 'Images/Assets',
        description: 'Centralisation des ressources graphiques'
      }
    ]
  },
  {
    id: 'dev',
    label: 'Développeur',
    description: 'Code, scripts, configs...',
    icon: 'Code',
    presets: [
      {
        name: 'Code & Scripts',
        extensions: ['ts', 'js', 'py', 'json', 'html', 'css', 'sql'],
        destination: 'Documents/Dev',
        description: 'Regroupement des fichiers sources'
      }
    ]
  },
  {
    id: 'student',
    label: 'Étudiant',
    description: 'Cours, notes, recherches...',
    icon: 'GraduationCap',
    presets: [
      {
        name: 'Cours & Notes',
        extensions: ['docx', 'pdf', 'ppt', 'pptx', 'md'],
        destination: 'Documents/Cours',
        description: 'Organisation des supports de cours'
      }
    ]
  }
]
