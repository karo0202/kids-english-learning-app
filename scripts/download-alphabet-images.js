/**
 * Script to help download alphabet coloring images from coloringlover.com
 * 
 * Usage:
 * 1. Visit https://www.coloringlover.com/alphabet-coloring-pages/
 * 2. Right-click on each image and "Save Image As..."
 * 3. Save them to: app/public/images/alphabet-coloring/
 * 4. Name them as: a-apple.jpg, b-bear.jpg, c-cat.jpg, etc.
 * 
 * OR use this script with image URLs (if you have them):
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ALPHABET_IMAGES = [
  { letter: 'A', word: 'apple', filename: 'a-apple.jpg' },
  { letter: 'B', word: 'bear', filename: 'b-bear.jpg' },
  { letter: 'C', word: 'cat', filename: 'c-cat.jpg' },
  { letter: 'D', word: 'dog', filename: 'd-dog.jpg' },
  { letter: 'E', word: 'elephant', filename: 'e-elephant.jpg' },
  { letter: 'F', word: 'fish', filename: 'f-fish.jpg' },
  { letter: 'G', word: 'goat', filename: 'g-goat.jpg' },
  { letter: 'H', word: 'horse', filename: 'h-horse.jpg' },
  { letter: 'I', word: 'iguana', filename: 'i-iguana.jpg' },
  { letter: 'J', word: 'jaguar', filename: 'j-jaguar.jpg' },
  { letter: 'K', word: 'kangaroo', filename: 'k-kangaroo.jpg' },
  { letter: 'L', word: 'lion', filename: 'l-lion.jpg' },
  { letter: 'M', word: 'monkey', filename: 'm-monkey.jpg' },
  { letter: 'N', word: 'notebook', filename: 'n-notebook.jpg' },
  { letter: 'O', word: 'owl', filename: 'o-owl.jpg' },
  { letter: 'P', word: 'penguin', filename: 'p-penguin.jpg' },
  { letter: 'Q', word: 'queen', filename: 'q-queen.jpg' },
  { letter: 'R', word: 'rabbit', filename: 'r-rabbit.jpg' },
  { letter: 'S', word: 'sun', filename: 's-sun.jpg' },
  { letter: 'T', word: 'turtle', filename: 't-turtle.jpg' },
  { letter: 'U', word: 'umbrella', filename: 'u-umbrella.jpg' },
  { letter: 'V', word: 'vase', filename: 'v-vase.jpg' },
  { letter: 'W', word: 'whale', filename: 'w-whale.jpg' },
  { letter: 'X', word: 'xylophone', filename: 'x-xylophone.jpg' },
  { letter: 'Y', word: 'yak', filename: 'y-yak.jpg' },
  { letter: 'Z', word: 'zebra', filename: 'z-zebra.jpg' },
];

const IMAGE_DIR = path.join(__dirname, '../public/images/alphabet-coloring');

// Create directory if it doesn't exist
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  console.log(`✅ Created directory: ${IMAGE_DIR}`);
}

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Check if image file exists
 */
function checkImages() {
  console.log('\n📋 Checking alphabet coloring images...\n');
  
  let missing = 0;
  let found = 0;

  ALPHABET_IMAGES.forEach(({ letter, word, filename }) => {
    const filepath = path.join(IMAGE_DIR, filename);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      console.log(`✅ ${letter} - ${word}: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
      found++;
    } else {
      console.log(`❌ ${letter} - ${word}: ${filename} - MISSING`);
      missing++;
    }
  });

  console.log(`\n📊 Summary: ${found}/26 images found, ${missing} missing\n`);

  if (missing > 0) {
    console.log('📥 To download images:');
    console.log('1. Visit: https://www.coloringlover.com/alphabet-coloring-pages/');
    console.log('2. Right-click each image and "Save Image As..."');
    console.log(`3. Save to: ${IMAGE_DIR}`);
    console.log('4. Use the filenames listed above\n');
  }
}

// If URLs are provided as command line arguments, download them
if (process.argv.length > 2) {
  const urls = process.argv.slice(2);
  console.log('⚠️  Note: Direct downloading from coloringlover.com may not work due to CORS/security.');
  console.log('💡 Recommended: Manually download images from the website.\n');
} else {
  // Just check existing images
  checkImages();
}

module.exports = { ALPHABET_IMAGES, IMAGE_DIR, checkImages };

