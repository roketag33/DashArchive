import { FileCategory } from './types'

export const CATEGORY_EXTENSIONS: Record<FileCategory, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'],
  audio: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma'],
  document: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'md', 'csv', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'dmg'],
  dev: [
    'js',
    'ts',
    'jsx',
    'tsx',
    'html',
    'css',
    'json',
    'py',
    'java',
    'c',
    'cpp',
    'php',
    'rb',
    'go',
    'rs',
    'sh',
    'yaml',
    'xml',
    'sql'
  ],
  executable: ['exe', 'msi', 'bat', 'sh', 'app', 'dmg', 'pkg'],
  other: []
}

export const EXTENSION_CATEGORY_MAP: Record<string, FileCategory> = Object.entries(
  CATEGORY_EXTENSIONS
).reduce(
  (acc, [category, extensions]) => {
    extensions.forEach((ext) => {
      acc[ext] = category as FileCategory
    })
    return acc
  },
  {} as Record<string, FileCategory>
)

export const COMMON_CATEGORIES = [
  'Invoice',
  'Facture',
  'Receipt',
  'Ticket',
  'Bill',
  'Resume',
  'CV',
  'Curriculum Vitae',
  'Contract',
  'Contrat',
  'Agreement',
  'Bank Statement',
  'Relevé Bancaire',
  'Finance',
  'Tax',
  'Impôt',
  'ID',
  'Passport',
  'Passeport',
  'Identity',
  'Course',
  'Cours',
  'Homework',
  'Devoir',
  'Slide',
  'Code',
  'Source',
  'Script',
  'Image',
  'Photo',
  'Screenshot',
  'Picture'
]
