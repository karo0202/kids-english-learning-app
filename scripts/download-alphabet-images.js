/**
 * Script to download alphabet coloring images from coloringlover.com
 * Uses the exact image URLs found on the page
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ALPHABET_IMAGES = [
  { letter: 'A', word: 'apple', filename: 'a-apple.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-A-Apple-Coloring-Page-791x1024.jpg' },
  { letter: 'B', word: 'bear', filename: 'b-bear.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-B-Bear-Coloring-Page.jpg' },
  { letter: 'C', word: 'cat', filename: 'c-cat.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-C-Cat-Coloring-Page.jpg' },
  { letter: 'D', word: 'dog', filename: 'd-dog.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-D-Dog-Coloring-Page.jpg' },
  { letter: 'E', word: 'elephant', filename: 'e-elephant.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-E-Elephant-Coloring-Page.jpg' },
  { letter: 'F', word: 'fish', filename: 'f-fish.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-F-Fish-Coloring-Page.jpg' },
  { letter: 'G', word: 'goat', filename: 'g-goat.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-G-Goat-Coloring-Page.jpg' },
  { letter: 'H', word: 'horse', filename: 'h-horse.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-H-Horse-Coloring-Page.jpg' },
  { letter: 'I', word: 'iguana', filename: 'i-iguana.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-I-Iguana-Coloring-Page.jpg' },
  { letter: 'J', word: 'jaguar', filename: 'j-jaguar.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-J-Jaguar-Coloring-Page.jpg' },
  { letter: 'K', word: 'kangaroo', filename: 'k-kangaroo.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-K-Kangaroo-Coloring-Page.jpg' },
  { letter: 'L', word: 'lion', filename: 'l-lion.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-L-Lion-Coloring-Page.jpg' },
  { letter: 'M', word: 'monkey', filename: 'm-monkey.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-M-Monkey-Coloring-Page.jpg' },
  { letter: 'N', word: 'notebook', filename: 'n-notebook.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-N-Notebook-Coloring-Page.jpg' },
  { letter: 'O', word: 'owl', filename: 'o-owl.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-O-Owl-Coloring-Page.jpg' },
  { letter: 'P', word: 'penguin', filename: 'p-penguin.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-P-Penguin-Coloring-Page.jpg' },
  { letter: 'Q', word: 'queen', filename: 'q-queen.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-Q-Queen-Coloring-Page.jpg' },
  { letter: 'R', word: 'rabbit', filename: 'r-rabbit.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-R-Rabbit-Coloring-Page.jpg' },
  { letter: 'S', word: 'sun', filename: 's-sun.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-S-Sun-Coloring-Page.jpg' },
  { letter: 'T', word: 'turtle', filename: 't-turtle.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-T-Turtle-Coloring-Page.jpg' },
  { letter: 'U', word: 'umbrella', filename: 'u-umbrella.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-U-Umbrella-Coloring-Page.jpg' },
  { letter: 'V', word: 'vase', filename: 'v-vase.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-V-Vase-Coloring-Page.jpg' },
  { letter: 'W', word: 'whale', filename: 'w-whale.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-W-Whale-Coloring-Page.jpg' },
  { letter: 'X', word: 'xylophone', filename: 'x-xylophone.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-X-Xylophone-Cream-Coloring-Page-For-Preschoolers.jpg' },
  { letter: 'Y', word: 'yak', filename: 'y-yak.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-Y-Yak-Coloring-Page.jpg' },
  { letter: 'Z', word: 'zebra', filename: 'z-zebra.jpg', url: 'https://www.coloringlover.com/wp-content/uploads/2024/10/Letter-Z-Zebra-Coloring-Page.jpg' },
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
async function downloadImage(url, filepath) {
  try {
    console.log(`📥 Downloading: ${path.basename(filepath)}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(filepath);
        console.log(`✅ Saved: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`❌ Failed to download ${path.basename(filepath)}:`, error.message);
    throw error;
  }
}

/**
 * Main download function
 */
async function downloadAllImages() {
  console.log('🎨 Starting alphabet coloring images download...\n');

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const { letter, word, filename, url } of ALPHABET_IMAGES) {
    const filepath = path.join(IMAGE_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      console.log(`⏭️  Skipping ${filename} (already exists, ${(stats.size / 1024).toFixed(1)} KB)`);
      skipped++;
      continue;
    }

    try {
      await downloadImage(url, filepath);
      downloaded++;
    } catch (error) {
      console.error(`❌ Could not download ${filename}`);
      failed++;
    }

    // Small delay to be respectful to the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n💡 All images saved to: ${IMAGE_DIR}\n`);
}

// Run the download
if (require.main === module) {
  downloadAllImages().catch(console.error);
}

module.exports = { ALPHABET_IMAGES, IMAGE_DIR, downloadAllImages };
