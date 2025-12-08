import { describe, it, expect } from 'vitest'
import { classifyFile } from './classification'

describe('classification', () => {
  it('should classify images correctly', () => {
    expect(classifyFile('test.jpg')).toBe('image')
    expect(classifyFile('test.PNG')).toBe('image')
    expect(classifyFile('test.gif')).toBe('image')
  })

  it('should classify documents correctly', () => {
    expect(classifyFile('doc.pdf')).toBe('document')
    expect(classifyFile('notes.txt')).toBe('document')
    expect(classifyFile('sheet.xlsx')).toBe('document')
  })

  it('should classify archives correctly', () => {
    expect(classifyFile('data.zip')).toBe('archive')
    expect(classifyFile('backup.tar.gz')).toBe('archive')
  })

  it('should classify videos correctly', () => {
    expect(classifyFile('movie.mp4')).toBe('video')
    expect(classifyFile('clip.mov')).toBe('video')
  })

  it('should classify developers files correctly', () => {
    expect(classifyFile('script.js')).toBe('dev')
    expect(classifyFile('main.ts')).toBe('dev')
    expect(classifyFile('style.css')).toBe('dev')
    expect(classifyFile('component.tsx')).toBe('dev')
  })

  it('should classify executables correctly', () => {
    expect(classifyFile('app.exe')).toBe('executable')
    expect(classifyFile('installer.dmg')).toBe('executable')
  })

  it('should return other for unknown extensions', () => {
    expect(classifyFile('unknown.xyz')).toBe('other')
    expect(classifyFile('file_without_extension')).toBe('other')
  })
})
