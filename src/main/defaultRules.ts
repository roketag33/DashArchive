import { app } from 'electron'
import { join } from 'path'
import { Rule } from '../shared/types'

export const getDefaultRules = (): Rule[] => {
  const baseDir = join(app.getPath('downloads'), 'FileOrganizer')

  return [
    {
      id: 'img',
      name: 'Images',
      type: 'extension',
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
      destination: join(baseDir, 'Images'),
      isActive: true,
      priority: 10
    },
    {
      id: 'vid',
      name: 'Videos',
      type: 'extension',
      extensions: ['mp4', 'mkv', 'mov', 'avi'],
      destination: join(baseDir, 'Videos', '{year}'),
      isActive: true,
      priority: 10
    },
    {
      id: 'doc',
      name: 'Documents',
      type: 'extension',
      extensions: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'],
      destination: join(baseDir, 'Documents'),
      isActive: true,
      priority: 10
    },
    {
      id: 'music',
      name: 'Music',
      type: 'extension',
      extensions: ['mp3', 'wav', 'flac'],
      destination: join(baseDir, 'Music'),
      isActive: true,
      priority: 10
    },
    {
      id: 'dev',
      name: 'Developer',
      type: 'extension',
      extensions: ['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'java', 'c', 'cpp'],
      destination: join(baseDir, 'Dev', '{ext}'),
      isActive: true,
      priority: 5
    },
    {
      id: 'app',
      name: 'Applications',
      type: 'extension',
      extensions: ['dmg', 'pkg', 'exe', 'msi', 'app'],
      destination: join(baseDir, 'Apps'),
      isActive: true,
      priority: 10
    },
    {
      id: 'archive',
      name: 'Archives',
      type: 'extension',
      extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
      destination: join(baseDir, 'Archives'),
      isActive: true,
      priority: 10
    }
  ]
}
