import { FileCategory } from './types'

export const CATEGORY_EXTENSIONS: Record<FileCategory, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'],
  audio: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma'],
  document: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'md', 'csv', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'dmg'],
  dev: [
    'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'php', 'rb', 'go', 'rs', 'sh', 'yaml', 'xml', 'sql'
  ],
  executable: ['exe', 'msi', 'bat', 'sh', 'app', 'dmg', 'pkg'],
  other: []
}

export const EXTENSION_CATEGORY_MAP: Record<string, FileCategory> = {
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', webp: 'image', svg: 'image', tiff: 'image', ico: 'image',
  // Video
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', wmv: 'video', flv: 'video', webm: 'video', m4v: 'video',
  // Audio
  mp3: 'audio', wav: 'audio', aac: 'audio', ogg: 'audio', flac: 'audio', m4a: 'audio', wma: 'audio',
  // Documents
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document', md: 'document', csv: 'document', rtf: 'document',
  // Archives
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive', bz2: 'archive',
  // Dev
  js: 'dev', ts: 'dev', jsx: 'dev', tsx: 'dev', html: 'dev', css: 'dev', json: 'dev', py: 'dev', java: 'dev', c: 'dev', cpp: 'dev', php: 'dev', rb: 'dev', go: 'dev', rs: 'dev', yaml: 'dev', xml: 'dev', sql: 'dev',
  // Executables
  exe: 'executable', msi: 'executable', bat: 'executable', sh: 'executable', app: 'executable', dmg: 'executable', pkg: 'executable', iso: 'executable'
}

export const COMMON_CATEGORIES = [
  'Invoice', 'Facture', 'Receipt', 'Ticket', 'Bill',
  'Resume', 'CV', 'Curriculum Vitae',
  'Contract', 'Contrat', 'Agreement',
  'Bank Statement', 'Relevé Bancaire', 'Finance',
  'Tax', 'Impôt',
  'ID', 'Passport', 'Passeport', 'Identity',
  'Course', 'Cours', 'Homework', 'Devoir', 'Slide',
  'Code', 'Source', 'Script',
  'Image', 'Photo', 'Screenshot', 'Picture'
]
