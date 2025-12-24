// @vitest-environment jsdom
// import React from 'react'
import '@testing-library/jest-dom'
import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DropZone } from './DropZone'

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// Mock window.api
const mockProcessFile = vi.fn()
Object.defineProperty(window, 'api', {
  value: {
    processDroppedFiles: mockProcessFile
    // Add other methods if DropZone uses them
  },
  writable: true
})

describe('DropZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<DropZone />)
    expect(screen.getByText('dropZone.idle')).toBeInTheDocument()
  })

  it('changes state on drag enter/leave', () => {
    render(<DropZone />)
    const dropZone = screen.getByTestId('drop-zone')

    // Initial state
    expect(dropZone).toHaveClass('scale-100') // Assuming standard scale

    // Drag Enter
    fireEvent.dragEnter(dropZone)
    // Should scale up or show active state
    expect(dropZone).toHaveClass('scale-110') // Assuming we use this class for hover

    // Drag Leave
    fireEvent.dragLeave(dropZone)
    expect(dropZone).toHaveClass('scale-100')
  })

  it('handles drop event', () => {
    render(<DropZone />)
    const dropZone = screen.getByTestId('drop-zone')

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })

    // Create a data transfer object
    // Note: creating DataTransfer in jsdom might be limited,
    // but fireEvent.drop allows passing dataTransfer.

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    })

    // Expect api to be called
    // Note: The actual implementation will likely read file paths.
    // In Electron renderer, File object usually has 'path' property
    // but in JSDOM/Browser env standard File doesn't.
    // We might need to mock the file object property 'path' if our component relies on it.
  })
})
