/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const TARGET_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  'Desktop',
  'GhostStressTest'
)
const FILE_COUNT = 1000

const EXTENSIONS = [
  'pdf',
  'docx',
  'txt',
  'jpg',
  'png',
  'mp4',
  'mp3',
  'zip',
  'iso',
  'exe',
  'dmg',
  'js',
  'json',
  'py',
  'unknown'
]

const CATEGORIES = {
  admin: ['facture', 'invoice', 'impots', 'contrat', 'rib'],
  perso: ['vacances', 'famille', 'photo', 'anniversaire'],
  work: ['projet', 'meeting', 'rapport', 'presentation']
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateName() {
  const category = getRandomElement(Object.keys(CATEGORIES))
  const prefix = getRandomElement(CATEGORIES[category])
  const date = new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
  return `${prefix}_${date}_${uuidv4().substring(0, 8)}`
}

async function generate() {
  console.log(`Generating ${FILE_COUNT} files in ${TARGET_DIR}...`)
  ensureDir(TARGET_DIR)

  for (let i = 0; i < FILE_COUNT; i++) {
    const ext = getRandomElement(EXTENSIONS)
    const name = generateName()
    const filePath = path.join(TARGET_DIR, `${name}.${ext}`)

    // Write dummy content
    fs.writeFileSync(filePath, `Dummy content for stress test file ${i}`)

    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${FILE_COUNT}`)
    }
  }
  console.log('Done!')
}

generate().catch(console.error)
