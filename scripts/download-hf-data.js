/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

const TARGET_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  'Desktop',
  'GhostStressTest'
)
const ZIP_URL = 'https://guillaumejaume.github.io/FUNSD/dataset.zip'
const ZIP_PATH = path.join(TARGET_DIR, 'dataset.zip')
const EXTRACT_DIR = path.join(TARGET_DIR, 'temp_extracted')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    console.log(`Downloading ${url}...`)
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`))
          return
        }
        response.pipe(file)
        file.on('finish', () => {
          file.close(() => resolve(true))
        })
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err)) // Delete temp file
      })
  })
}

function moveFilesAndFlatten(srcDir, destDir) {
  const items = fs.readdirSync(srcDir)
  items.forEach((item) => {
    const fullPath = path.join(srcDir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      moveFilesAndFlatten(fullPath, destDir)
    } else {
      const ext = path.extname(item).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.tif', '.pdf'].includes(ext)) {
        // Renaming to avoid collisions
        const newName = `real_doc_${Math.floor(Math.random() * 10000)}_${item}`
        fs.renameSync(fullPath, path.join(destDir, newName))
      }
    }
  })
}

async function main() {
  try {
    console.log('Preparing Stress Test Data (FUNSD Dataset)...')

    // Clean start
    if (fs.existsSync(TARGET_DIR)) {
      fs.rmSync(TARGET_DIR, { recursive: true, force: true })
    }
    ensureDir(TARGET_DIR)
    ensureDir(EXTRACT_DIR)

    // 1. Download Zip
    await downloadFile(ZIP_URL, ZIP_PATH)
    console.log('Download complete.')

    // 2. Unzip
    console.log('Unzipping...')
    try {
      execSync(`unzip -q "${ZIP_PATH}" -d "${EXTRACT_DIR}"`)
    } catch (e) {
      console.error('Unzip failed. Ensure "unzip" is installed.', e)
      return
    }

    // 3. Flatten images to Target Dir
    console.log('Flattening file structure...')
    moveFilesAndFlatten(EXTRACT_DIR, TARGET_DIR)

    // 4. Cleanup
    fs.rmSync(EXTRACT_DIR, { recursive: true, force: true })
    fs.rmSync(ZIP_PATH)

    const count = fs.readdirSync(TARGET_DIR).length
    console.log('------------------------------------------------')
    console.log(`✅ SUCCESS! Prepared ${count} real document images.`)
    console.log(`📂 Location: ${TARGET_DIR}`)
    console.log('------------------------------------------------')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main()
