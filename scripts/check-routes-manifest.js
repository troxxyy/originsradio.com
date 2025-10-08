const fs = require('fs')
const path = require('path')

const manifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json')

if (!fs.existsSync(manifestPath)) {
  console.error(`Error: missing ${manifestPath}. This usually means the Next.js build failed or the project root is misconfigured.`)
  process.exit(1)
}

console.log('.next/routes-manifest.json found')


