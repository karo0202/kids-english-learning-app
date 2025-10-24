const fs = require('fs')
const path = require('path')

// Simple bundle analyzer for development
function analyzeBundle() {
  const buildDir = path.join(__dirname, '../out')
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run "npm run build" first.')
    return
  }

  console.log('📊 Bundle Analysis Report')
  console.log('========================')

  // Analyze static files
  const staticFiles = []
  const imageFiles = []
  const jsFiles = []
  const cssFiles = []

  function analyzeDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(basePath, item)
      const stats = fs.statSync(fullPath)
      
      if (stats.isDirectory()) {
        analyzeDirectory(fullPath, relativePath)
      } else {
        const size = stats.size
        const ext = path.extname(item).toLowerCase()
        
        staticFiles.push({
          path: relativePath,
          size,
          ext
        })
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          imageFiles.push({ path: relativePath, size })
        } else if (ext === '.js') {
          jsFiles.push({ path: relativePath, size })
        } else if (ext === '.css') {
          cssFiles.push({ path: relativePath, size })
        }
      }
    })
  }

  analyzeDirectory(buildDir)

  // Calculate totals
  const totalSize = staticFiles.reduce((sum, file) => sum + file.size, 0)
  const imageSize = imageFiles.reduce((sum, file) => sum + file.size, 0)
  const jsSize = jsFiles.reduce((sum, file) => sum + file.size, 0)
  const cssSize = cssFiles.reduce((sum, file) => sum + file.size, 0)

  console.log(`\n📁 Total Bundle Size: ${formatBytes(totalSize)}`)
  console.log(`🖼️  Images: ${formatBytes(imageSize)} (${((imageSize/totalSize)*100).toFixed(1)}%)`)
  console.log(`📜 JavaScript: ${formatBytes(jsSize)} (${((jsSize/totalSize)*100).toFixed(1)}%)`)
  console.log(`🎨 CSS: ${formatBytes(cssSize)} (${((cssSize/totalSize)*100).toFixed(1)}%)`)

  // Largest files
  console.log('\n🔍 Largest Files:')
  staticFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((file, index) => {
      console.log(`${index + 1}. ${file.path} - ${formatBytes(file.size)}`)
    })

  // Image optimization suggestions
  if (imageSize > totalSize * 0.5) {
    console.log('\n⚠️  Image Optimization Suggestions:')
    console.log('- Consider using WebP format for better compression')
    console.log('- Implement responsive images with different sizes')
    console.log('- Use lazy loading for images below the fold')
  }

  // JavaScript optimization suggestions
  if (jsSize > totalSize * 0.3) {
    console.log('\n⚠️  JavaScript Optimization Suggestions:')
    console.log('- Consider code splitting for large components')
    console.log('- Remove unused dependencies')
    console.log('- Use dynamic imports for heavy libraries')
  }

  console.log('\n✅ Analysis complete!')
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Run analysis
analyzeBundle()

