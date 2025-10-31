/**
 * Setup Local Images Script
 * 
 * This script helps you set up local images for pronunciation words.
 * It creates a checklist and helps organize your images.
 * 
 * Usage: node scripts/setup-local-images.js
 */

const fs = require('fs');
const path = require('path');

const WORDS_FILE = path.join(__dirname, '../public/pronunciation_words.json');
const WORDS_IMAGES_DIR = path.join(__dirname, '../public/images/words');

// Read the words file
const words = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));

// Create images directory if it doesn't exist
if (!fs.existsSync(WORDS_IMAGES_DIR)) {
  fs.mkdirSync(WORDS_IMAGES_DIR, { recursive: true });
  console.log('✅ Created directory: public/images/words\n');
}

// Generate checklist
console.log('📋 IMAGE SETUP CHECKLIST');
console.log('='.repeat(50));
console.log(`Total words: ${words.length}\n`);

const checklist = words.map((word, index) => {
  const fileName = `${word.word.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  const filePath = path.join(WORDS_IMAGES_DIR, fileName);
  const exists = fs.existsSync(filePath);
  const isLocal = word.imageUrl && word.imageUrl.startsWith('/images/');
  
  return {
    number: index + 1,
    word: word.word,
    fileName: fileName,
    exists: exists,
    isLocal: isLocal,
    currentUrl: word.imageUrl
  };
});

// Show checklist
console.log('📝 WORD IMAGES CHECKLIST:\n');
checklist.forEach(item => {
  const status = item.exists ? '✅' : '❌';
  const location = item.isLocal ? '[LOCAL]' : '[EXTERNAL]';
  console.log(`${status} ${item.number.toString().padStart(2, ' ')}. ${item.word.padEnd(15)} → ${item.fileName} ${location}`);
});

// Statistics
const localCount = checklist.filter(item => item.isLocal).length;
const existingCount = checklist.filter(item => item.exists).length;
const neededCount = words.length - existingCount;

console.log('\n' + '='.repeat(50));
console.log('📊 STATISTICS:');
console.log(`   ✅ Local images configured: ${localCount}/${words.length}`);
console.log(`   📁 Files in folder: ${existingCount}/${words.length}`);
console.log(`   📥 Images needed: ${neededCount}`);
console.log('='.repeat(50));

// Generate migration guide
if (neededCount > 0) {
  console.log('\n📋 STEP-BY-STEP SETUP GUIDE:\n');
  console.log('1. ADD YOUR IMAGES:');
  console.log(`   Place your image files in: ${WORDS_IMAGES_DIR}`);
  console.log('   Format: word-name.jpg (e.g., apple.jpg, banana.jpg)\n');
  
  console.log('2. IMAGES NEEDED:');
  checklist
    .filter(item => !item.exists)
    .forEach(item => {
      console.log(`   - ${item.fileName} (for word: "${item.word}")`);
    });
  
  console.log('\n3. AFTER ADDING IMAGES:');
  console.log('   Run this script again to verify all images are in place.');
  console.log('   Then update pronunciation_words.json with local paths.\n');
}

// Generate JSON update file
const wordsNeedingLocal = checklist.filter(item => !item.isLocal || !item.exists);
if (wordsNeedingLocal.length > 0) {
  console.log('\n🔄 TO UPDATE JSON FILE:');
  console.log('   Update these entries in pronunciation_words.json:\n');
  
  wordsNeedingLocal.forEach(item => {
    const word = words.find(w => w.word === item.word);
    const newUrl = `/images/words/${item.fileName}`;
    console.log(`   "${item.word}": "${newUrl}"`);
    console.log(`   (Currently: "${item.currentUrl || 'NO URL'}")`);
    console.log('');
  });
}

// Create a sample README for the images folder
const readmePath = path.join(WORDS_IMAGES_DIR, 'README.md');
const readmeContent = `# Word Images

This folder contains images for pronunciation practice words.

## Image Requirements:
- **Format**: JPG or PNG
- **Size**: 400x400px minimum (800x800px recommended for high-DPI)
- **File Size**: Under 200KB (optimize before adding)
- **Naming**: Use lowercase with hyphens (e.g., \`apple.jpg\`, \`ice-cream.jpg\`)

## Current Words:
${words.map(w => `- ${w.word}`).join('\n')}

## How to Add Images:
1. Name your image file exactly as shown above (lowercase, hyphens)
2. Place it in this folder
3. Update \`pronunciation_words.json\` to use: \`/images/words/[filename]\`

## Verification:
Run \`node scripts/setup-local-images.js\` to check which images are ready.
`;

if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Created README.md in images/words folder\n');
}

// Generate a helper script for batch JSON update
console.log('\n💡 TIP: Run this script again after adding images to see progress!\n');

