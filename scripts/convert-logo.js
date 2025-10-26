const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createPngLogo() {
  try {
    // Create the logo directly as PNG without SVG
    const logoPngPath = path.join(__dirname, '../public/logo.png');
    const faviconPngPath = path.join(__dirname, '../public/favicon.png');
    
    // Create a canvas for the logo
    const logoWidth = 400;
    const logoHeight = 240;
    
    // Create the logo as PNG directly
    await sharp({
      create: {
        width: logoWidth,
        height: logoHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
      }
    })
    .png({
      quality: 95,
      compressionLevel: 9
    })
    .toFile(logoPngPath);
    
    console.log('✅ Logo created as PNG successfully!');
    console.log(`📁 Output: ${logoPngPath}`);
    
    // Create favicon
    await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
      }
    })
    .png({
      quality: 95,
      compressionLevel: 9
    })
    .toFile(faviconPngPath);
    
    console.log('✅ Favicon created as PNG successfully!');
    console.log(`📁 Output: ${faviconPngPath}`);
    
  } catch (error) {
    console.error('❌ Error creating PNG logo:', error);
  }
}

createPngLogo();