# 🎨 Alphabet Coloring Images Setup

## Quick Start

To use the actual JPG images from coloringlover.com instead of canvas-drawn outlines:

### Step 1: Download Images

1. Visit: **https://www.coloringlover.com/alphabet-coloring-pages/**
2. For each letter (A-Z), right-click on the coloring page image
3. Select "Save Image As..." or "Save Picture As..."
4. Save each image to: `app/public/images/alphabet-coloring/`

### Step 2: Name the Files

Name each file exactly as shown below (lowercase, with hyphens):

| Letter | Word | Filename |
|--------|------|----------|
| A | Apple | `a-apple.jpg` |
| B | Bear | `b-bear.jpg` |
| C | Cat | `c-cat.jpg` |
| D | Dog | `d-dog.jpg` |
| E | Elephant | `e-elephant.jpg` |
| F | Fish | `f-fish.jpg` |
| G | Goat | `g-goat.jpg` |
| H | Horse | `h-horse.jpg` |
| I | Iguana | `i-iguana.jpg` |
| J | Jaguar | `j-jaguar.jpg` |
| K | Kangaroo | `k-kangaroo.jpg` |
| L | Lion | `l-lion.jpg` |
| M | Monkey | `m-monkey.jpg` |
| N | Notebook | `n-notebook.jpg` |
| O | Owl | `o-owl.jpg` |
| P | Penguin | `p-penguin.jpg` |
| Q | Queen | `q-queen.jpg` |
| R | Rabbit | `r-rabbit.jpg` |
| S | Sun | `s-sun.jpg` |
| T | Turtle | `t-turtle.jpg` |
| U | Umbrella | `u-umbrella.jpg` |
| V | Vase | `v-vase.jpg` |
| W | Whale | `w-whale.jpg` |
| X | Xylophone | `x-xylophone.jpg` |
| Y | Yak | `y-yak.jpg` |
| Z | Zebra | `z-zebra.jpg` |

### Step 3: Verify Images

Run the check script to see which images are present:

```bash
cd app
node scripts/download-alphabet-images.js
```

This will show you which images are found and which are missing.

### Step 4: Test the App

Once images are added, the app will automatically:
- ✅ Use the JPG images when available
- ✅ Fall back to canvas drawing if images are missing
- ✅ Allow kids to color on top of the images

## How It Works

The `ColoringCard` component now:
1. **First tries to load** the image from `/images/alphabet-coloring/[letter]-[word].jpg`
2. **If image exists**: Displays it on the canvas for coloring
3. **If image missing**: Falls back to the canvas-drawn outline (current behavior)

## Image Requirements

- **Format**: JPG (preferred) or PNG
- **Type**: Black and white outline coloring pages (like from coloringlover.com)
- **Size**: Any size (will be scaled to fit)
- **Quality**: Clear, simple outlines suitable for coloring

## Troubleshooting

### Images not showing?
1. Check file names match exactly (case-sensitive)
2. Verify files are in `app/public/images/alphabet-coloring/`
3. Clear browser cache and reload
4. Check browser console for 404 errors

### Want to use different images?
- Replace any image file with a new one (keep the same filename)
- The app will automatically use the new image

### Need to go back to canvas drawing?
- Simply remove or rename the image files
- The app will automatically fall back to canvas drawing

## Notes

- Images are loaded from the `public` folder, so they're accessible at `/images/alphabet-coloring/...`
- The canvas drawing code remains as a fallback
- All existing coloring functionality (save, clear, eraser) works with both images and canvas drawings


