import { Rule } from '../shared/types'

export const defaultRules: Rule[] = [
  {
    id: 'img',
    name: 'Images',
    type: 'extension',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
    destination: 'dossier/Images',
    isActive: true,
    priority: 10
  },
  {
    id: 'vid',
    name: 'Videos',
    type: 'extension',
    extensions: ['mp4', 'mkv', 'mov', 'avi'],
    destination: 'dossier/Videos/{year}',
    isActive: true,
    priority: 10
  },
  {
    id: 'doc',
    name: 'Documents',
    type: 'extension',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'],
    destination: 'dossier/Documents',
    isActive: true,
    priority: 10
  },
  {
    id: 'music',
    name: 'Music',
    type: 'extension',
    extensions: ['mp3', 'wav', 'flac'],
    destination: 'dossier/Music',
    isActive: true,
    priority: 10
  },
  {
    id: 'dev',
    name: 'Developer',
    type: 'extension',
    extensions: ['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'java', 'c', 'cpp'],
    destination: 'dossier/Dev/{ext}',
    isActive: true,
    priority: 5
  },
  {
    id: 'app',
    name: 'Applications',
    type: 'extension',
    extensions: ['dmg', 'pkg', 'exe', 'msi', 'app'],
    destination: 'dossier/Apps',
    isActive: true,
    priority: 10
  },
  {
    id: 'archive',
    name: 'Archives',
    type: 'extension',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
    destination: 'dossier/Archives',
    isActive: true,
    priority: 10
  }
]
