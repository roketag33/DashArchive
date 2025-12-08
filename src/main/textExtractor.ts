import * as fs from 'fs/promises'
import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse')
import mammoth from 'mammoth'

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
      default:
        // For other files, return empty string or maybe file name?
        // Content-based sorting implies we need content.
        return ''
    }
  } catch (error) {
    console.error(`Failed to extract text from ${filePath}`, error)
    return ''
  }
}

async function extractPdf(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  const data = await pdf(buffer)
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
