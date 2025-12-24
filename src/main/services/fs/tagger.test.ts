import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  exec: vi.fn((_cmd, cb) => cb(null, 'stdout', 'stderr'))
}))

vi.mock('child_process', () => ({
  exec: mocks.exec
}))

import { taggerService } from './tagger'

describe('TaggerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set Red label (index 2)', async () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    await taggerService.setLabel('/tmp/file.txt', 'Red')

    expect(mocks.exec).toHaveBeenCalled()
    const cmd = mocks.exec.mock.calls[0][0]
    expect(cmd).toContain('osascript')
    expect(cmd).toContain('set label index')
    expect(cmd).toContain('to 2')
    expect(cmd).toContain('/tmp/file.txt')
  })

  it('should ignore if not mac', async () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })
    await taggerService.setLabel('/tmp/file.txt', 'Red')
    expect(mocks.exec).not.toHaveBeenCalled()
  })

  it('should ignore none', async () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    await taggerService.setLabel('/tmp/file.txt', 'none')
    expect(mocks.exec).not.toHaveBeenCalled()
  })
})
