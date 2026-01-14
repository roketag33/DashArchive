import { Rule, RuleType } from '../../../shared/types'

export type LifeBlockId = 'admin' | 'dev' | 'photos' | 'school' | 'creative' | 'media'

export const getPresetsForProfile = (blocks: LifeBlockId[]): Rule[] => {
  const rules: Rule[] = []

  // Helper to create rule
  const createRule = (
    id: string,
    name: string,
    destination: string,
    type: RuleType,
    config: { extensions?: string[]; namePattern?: string }
  ): Rule => ({
    id,
    name,
    isActive: true,
    priority: 10,
    destination,
    type,
    ...config
  })

  if (blocks.includes('admin')) {
    rules.push(
      createRule(
        'admin-invoices',
        'Factures PDF',
        'Documents/Administratif/Factures',
        'extension',
        { extensions: ['pdf'] }
      )
    )
    rules.push(
      createRule('admin-taxes', 'Impôts', 'Documents/Administratif/Impôts', 'name', {
        namePattern: '.*(impot|tax).*'
      })
    )
  }

  if (blocks.includes('dev')) {
    rules.push(
      createRule('dev-snippets', 'Code Snippets', 'Developer/Snippets', 'extension', {
        extensions: ['ts', 'js', 'py', 'cpp']
      })
    )
    rules.push(
      createRule('dev-configs', 'Config Files', 'Developer/Configs', 'extension', {
        extensions: ['json', 'yaml', 'env']
      })
    )
  }

  if (blocks.includes('photos')) {
    rules.push(
      createRule('photos-raw', 'Images', 'Pictures/Sorted', 'extension', {
        extensions: ['jpg', 'jpeg', 'png', 'heic', 'raw']
      })
    )
    rules.push(
      createRule('photos-mov', 'Vidéos Perso', 'Movies/Perso', 'extension', {
        extensions: ['mov', 'mp4']
      })
    )
  }

  if (blocks.includes('creative')) {
    rules.push(
      createRule('creative-assets', 'Design Assets', 'Design/Assets', 'extension', {
        extensions: ['psd', 'ai', 'fig', 'svg']
      })
    )
  }

  if (blocks.includes('school')) {
    rules.push(
      createRule('school-courses', 'Cours & Thèses', 'Documents/School', 'extension', {
        extensions: ['docx', 'pdf', 'pptx']
      })
    )
  }

  if (blocks.includes('media')) {
    rules.push(
      createRule('media-movies', 'Films', 'Movies/Library', 'extension', {
        extensions: ['mkv', 'avi', 'mp4']
      })
    )
  }

  return rules
}
