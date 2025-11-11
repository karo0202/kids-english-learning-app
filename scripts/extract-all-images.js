/**
 * Script to extract and list all images from coloringlover.com alphabet page
 * This helps identify the correct image URLs for each letter
 */

const axios = require('axios');
const { load } = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.coloringlover.com/alphabet-coloring-pages/';

async function extractAllImages() {
  try {
    console.log('🌐 Fetching page...\n');
    
    const response = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    const $ = load(response.data);
    const images = [];

    // Find all images
    $('img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
      const alt = $(elem).attr('alt') || '';
      const title = $(elem).attr('title') || '';
      const width = $(elem).attr('width') || '';
      const height = $(elem).attr('height') || '';
      
      if (src && (src.includes('.jpg') || src.includes('.png') || src.includes('.jpeg'))) {
        // Skip small icons
        if (src.includes('logo') || src.includes('icon') || src.includes('avatar')) {
          return;
        }

        // Convert to absolute URL
        let fullUrl = src;
        if (src.startsWith('//')) {
          fullUrl = 'https:' + src;
        } else if (src.startsWith('/')) {
          fullUrl = 'https://www.coloringlover.com' + src;
        } else if (!src.startsWith('http')) {
          fullUrl = BASE_URL + src;
        }

        images.push({
          url: fullUrl,
          alt: alt,
          title: title,
          width: width,
          height: height,
          src: src
        });
      }
    });

    // Also check links
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text();
      
      if (href && (href.includes('.jpg') || href.includes('.png') || href.includes('.jpeg'))) {
        let fullUrl = href;
        if (href.startsWith('//')) {
          fullUrl = 'https:' + href;
        } else if (href.startsWith('/')) {
          fullUrl = 'https://www.coloringlover.com' + href;
        } else if (!href.startsWith('http')) {
          fullUrl = BASE_URL + href;
        }

        images.push({
          url: fullUrl,
          alt: text,
          title: text,
          width: '',
          height: '',
          src: href
        });
      }
    });

    // Remove duplicates
    const uniqueImages = [];
    const seenUrls = new Set();
    
    images.forEach(img => {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push(img);
      }
    });

    console.log(`Found ${uniqueImages.length} unique images:\n`);
    uniqueImages.forEach((img, i) => {
      console.log(`${i + 1}. ${img.alt || img.title || 'No alt/title'}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Size: ${img.width}x${img.height || '?'}`);
      console.log('');
    });

    // Save to JSON file for reference
    const outputPath = path.join(__dirname, '../alphabet-images-list.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueImages, null, 2));
    console.log(`\n✅ Saved image list to: ${outputPath}`);

    return uniqueImages;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

extractAllImages();

