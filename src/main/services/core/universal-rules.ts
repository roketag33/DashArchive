export interface UniversalRule {
  id: string
  label: string
  extensions: string[]
  targetFolder: string
  icon: 'document' | 'image' | 'box'
}

export const UNIVERSAL_RULES: UniversalRule[] = [
  {
    id: 'admin',
    label: 'Documents Administratifs',
    extensions: ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.txt', '.csv'],
    targetFolder: 'Documents/Admin',
    icon: 'document'
  },
  {
    id: 'media',
    label: 'Photos & Souvenirs',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.svg', '.mov', '.mp4'],
    targetFolder: 'Pictures/Sorted',
    icon: 'image'
  },
  {
    id: 'misc',
    label: 'Vrac & Autres',
    extensions: ['.zip', '.rar', '.7z', '.dmg', '.pkg', '.iso'],
    targetFolder: 'Downloads/Installers',
    icon: 'box'
  }
]

export const isUniversalRuleMatch = (extension: string): UniversalRule | undefined => {
  const normalizedExt = extension.toLowerCase().startsWith('.')
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`
  return UNIVERSAL_RULES.find((rule) => rule.extensions.includes(normalizedExt))
}
