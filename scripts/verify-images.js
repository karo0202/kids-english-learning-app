/**
 * Image Verification Script
 * 
 * This script helps verify that all images in pronunciation_words.json
 * are loading correctly and match their words.
 * 
 * Usage: node scripts/verify-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const WORDS_FILE = path.join(__dirname, '../public/pronunciation_words.json');

// Read the words file
const words = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));

// Helper to check if URL is valid
function checkImageUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        resolve({ valid: true, status: response.statusCode });
      } else {
        resolve({ valid: false, status: response.statusCode });
      }
    });

    request.on('error', () => {
      resolve({ valid: false, status: 'ERROR' });
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve({ valid: false, status: 'TIMEOUT' });
    });
  });
}

// Main verification function
async function verifyImages() {
  console.log('🔍 Verifying images...\n');
  console.log(`Total words to check: ${words.length}\n`);

  const results = {
    valid: [],
    invalid: [],
    local: []
  };

  for (const word of words) {
    const url = word.imageUrl;
    
    if (!url) {
      results.invalid.push({ word: word.word, reason: 'No imageUrl' });
      continue;
    }

    // Check if it's a local image
    if (url.startsWith('/images/')) {
      const localPath = path.join(__dirname, '../public', url);
      if (fs.existsSync(localPath)) {
        results.local.push({ word: word.word, url, status: 'EXISTS' });
      } else {
        results.invalid.push({ word: word.word, url, reason: 'Local file not found' });
      }
      continue;
    }

    // Check external URL
    const result = await checkImageUrl(url);
    if (result.valid) {
      results.valid.push({ word: word.word, url });
      console.log(`✅ ${word.word}: Valid`);
    } else {
      results.invalid.push({ word: word.word, url, reason: `Status: ${result.status}` });
      console.log(`❌ ${word.word}: Invalid (${result.status})`);
    }

    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Valid external URLs: ${results.valid.length}`);
  console.log(`📁 Local images found: ${results.local.length}`);
  console.log(`❌ Invalid/missing: ${results.invalid.length}`);
  
  if (results.invalid.length > 0) {
    console.log('\n❌ Issues found:');
    results.invalid.forEach(item => {
      console.log(`   - ${item.word}: ${item.reason || item.status}`);
      if (item.url) console.log(`     URL: ${item.url}`);
    });
  }

  if (results.local.length > 0) {
    console.log('\n📁 Local images:');
    results.local.forEach(item => {
      console.log(`   ✅ ${item.word}: ${item.url}`);
    });
  }

  console.log('\n' + '='.repeat(50));
  
  return results;
}

// Run verification
if (require.main === module) {
  verifyImages().then((results) => {
    const exitCode = results.invalid.length > 0 ? 1 : 0;
    process.exit(exitCode);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { verifyImages };

