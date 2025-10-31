/**
 * Update JSON to Use Local Images
 * 
 * This script automatically updates pronunciation_words.json to use local image paths
 * for words that have corresponding image files in public/images/words/
 * 
 * Usage: node scripts/update-json-to-local.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const WORDS_FILE = path.join(__dirname, '../public/pronunciation_words.json');
const WORDS_IMAGES_DIR = path.join(__dirname, '../public/images/words');

// Check for dry-run flag
const isDryRun = process.argv.includes('--dry-run');

// Read the words file
const words = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));

// Get list of available image files
const availableImages = fs.existsSync(WORDS_IMAGES_DIR)
  ? fs.readdirSync(WORDS_IMAGES_DIR).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )
  : [];

console.log('🔄 UPDATING JSON TO USE LOCAL IMAGES\n');
console.log('='.repeat(50));

let updatedCount = 0;
const updates = [];

// Process each word
words.forEach((word, index) => {
  // Try to find matching image file
  const possibleNames = [
    `${word.word.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    `${word.word.toLowerCase().replace(/\s+/g, '-')}.png`,
    `${word.word.toLowerCase().replace(/\s+/g, '_')}.jpg`,
    `${word.word.toLowerCase().replace(/\s+/g, '_')}.png`,
    `${word.word.toLowerCase()}.jpg`,
    `${word.word.toLowerCase()}.png`,
  ];

  let matchedFile = null;
  for (const name of possibleNames) {
    if (availableImages.includes(name)) {
      matchedFile = name;
      break;
    }
  }

  if (matchedFile) {
    const newUrl = `/images/words/${matchedFile}`;
    const oldUrl = word.imageUrl;

    if (oldUrl !== newUrl) {
      updates.push({
        word: word.word,
        oldUrl: oldUrl,
        newUrl: newUrl,
        file: matchedFile
      });

      if (!isDryRun) {
        word.imageUrl = newUrl;
      }
      updatedCount++;
    }
  }
});

// Show what will be updated
if (updates.length > 0) {
  console.log(`Found ${updates.length} word(s) with matching local images:\n`);
  updates.forEach(update => {
    console.log(`✅ ${update.word}`);
    console.log(`   File: ${update.file}`);
    console.log(`   Old:  ${update.oldUrl}`);
    console.log(`   New:  ${update.newUrl}`);
    console.log('');
  });
} else {
  console.log('ℹ️  No matching local images found.');
  console.log('   Make sure your image files are named correctly in public/images/words/');
  console.log('   Example: apple.jpg, banana.jpg, etc.\n');
}

// Save updated JSON
if (!isDryRun && updatedCount > 0) {
  // Sort words by id for consistency
  words.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  
  // Write back to file with nice formatting
  fs.writeFileSync(
    WORDS_FILE,
    JSON.stringify(words, null, 2) + '\n',
    'utf8'
  );
  
  console.log('='.repeat(50));
  console.log(`✅ Updated ${updatedCount} word(s) in pronunciation_words.json`);
  console.log('   File saved successfully!\n');
} else if (isDryRun && updatedCount > 0) {
  console.log('='.repeat(50));
  console.log(`🔍 DRY RUN: Would update ${updatedCount} word(s)`);
  console.log('   Run without --dry-run to apply changes\n');
} else {
  console.log('='.repeat(50));
  console.log('ℹ️  No changes needed.\n');
}

// Show words without local images
const wordsWithoutLocal = words.filter(word => {
  const wordName = word.word.toLowerCase().replace(/\s+/g, '-');
  return !availableImages.some(img => 
    img.toLowerCase().startsWith(wordName)
  );
});

if (wordsWithoutLocal.length > 0) {
  console.log(`📋 Words still using external URLs (${wordsWithoutLocal.length}):`);
  wordsWithoutLocal.slice(0, 10).forEach(word => {
    console.log(`   - ${word.word}`);
  });
  if (wordsWithoutLocal.length > 10) {
    console.log(`   ... and ${wordsWithoutLocal.length - 10} more`);
  }
  console.log('\n💡 Add images for these words to public/images/words/');
  console.log('   Then run this script again to update automatically.\n');
}

