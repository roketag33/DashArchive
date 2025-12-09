import * as fs from 'fs/promises'
import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfLib = require('pdf-parse')
import mammoth from 'mammoth'

import { createWorker } from 'tesseract.js'

export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase().slice(1)

  try {
    switch (ext) {
      case 'pdf':
        return await extractPdf(filePath)
      case 'docx':
        return await extractDocx(filePath)
      case 'txt':
      case 'md':
      case 'json':
      case 'csv':
        return await extractPlain(filePath)
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
      case 'webp':
        return await extractImage(filePath)
      default:
        // For other files, return empty string or maybe file name?
        // Content-based sorting implies we need content.
        return ''
    }
  } catch (error) {
    // Suppress ENOENT logs (expected if file is moved/deleted during scan)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code !== 'ENOENT') {
      console.error(`Failed to extract text from ${filePath}`, error)
    }
    return ''
  }
}

async function extractPdf(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  // Robust import handling for pdf-parse in Electron environment
  // It might be a default export, or the module itself, or nested.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parse: any = pdfLib
  if (typeof parse !== 'function' && parse.default) {
    parse = parse.default
  }
  
  if (typeof parse !== 'function') {
    console.error('pdf-parse is not a function:', pdfLib)
    return '' // Fail gracefully for now
  }

  const data = await parse(buffer)
  return data.text
}

async function extractDocx(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractPlain(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8')
}

async function extractImage(filePath: string): Promise<string> {
  const worker = await createWorker('eng+fra')
  const { data: { text } } = await worker.recognize(filePath)
  await worker.terminate()
  return text
}
