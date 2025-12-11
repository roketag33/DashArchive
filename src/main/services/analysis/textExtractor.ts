import * as fs from 'fs/promises'
import * as path from 'path'

// @ts-ignore : pdf-parse lacks proper ESM exports
import * as pdfLib from 'pdf-parse'
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
        return ''
    }
  } catch (error) {
    if ((error as { code?: string }).code !== 'ENOENT') {
      console.error(`Failed to extract text from ${filePath}`, error)
    }
    return ''
  }
}

async function extractPdf(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)

  // @ts-ignore - mismatch between @types/pdf-parse and installed version
  const { PDFParse } = pdfLib

  // @ts-ignore - API v2 usage
  const parser = new PDFParse({ data: buffer })
  const data = await parser.getText()
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
  const {
    data: { text }
  } = await worker.recognize(filePath)
  await worker.terminate()
  return text
}
