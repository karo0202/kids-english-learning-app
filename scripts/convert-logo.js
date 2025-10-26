const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToJpeg() {
  try {
    const svgPath = path.join(__dirname, '../public/logo.svg');
    const jpegPath = path.join(__dirname, '../public/logo.jpg');
    
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert SVG to JPEG with high quality
    await sharp(svgBuffer)
      .jpeg({ 
        quality: 95,
        progressive: true,
        mozjpeg: true
      })
      .resize(400, 240, {
        fit: 'contain',
        background: { r: 254, g: 247, b: 237, alpha: 1 }
      })
      .toFile(jpegPath);
    
    console.log('✅ Logo converted to JPEG successfully!');
    console.log(`📁 Output: ${jpegPath}`);
    
    // Also create a smaller version for favicon
    const faviconJpegPath = path.join(__dirname, '../public/favicon.jpg');
    await sharp(svgBuffer)
      .jpeg({ 
        quality: 95,
        progressive: true,
        mozjpeg: true
      })
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 254, g: 247, b: 237, alpha: 1 }
      })
      .toFile(faviconJpegPath);
    
    console.log('✅ Favicon converted to JPEG successfully!');
    console.log(`📁 Output: ${faviconJpegPath}`);
    
  } catch (error) {
    console.error('❌ Error converting logo:', error);
  }
}

convertSvgToJpeg();
