# 🖼️ Local Images Setup Guide

## Quick Start: Setting Up Local Images for Words

### Step 1: Create the Images Folder (if not exists)

The folder `public/images/words/` should already be created. If not, create it:
```
app/public/images/words/
```

### Step 2: Add Your Images

1. **Download or prepare images** for each word (JPG or PNG format)
2. **Name them exactly as shown below** (lowercase, use hyphens for spaces)
3. **Place them in**: `app/public/images/words/`

### Step 3: Image File Names Needed

Here are all 26 words and their required file names:

| # | Word | File Name | Status |
|---|------|-----------|--------|
| 1 | apple | `apple.jpg` | ⬜ To add |
| 2 | banana | `banana.jpg` | ⬜ To add |
| 3 | cat | `cat.jpg` | ⬜ To add |
| 4 | dog | `dog.jpg` | ⬜ To add |
| 5 | elephant | `elephant.jpg` | ⬜ To add |
| 6 | frog | `frog.jpg` | ⬜ To add |
| 7 | giraffe | `giraffe.jpg` | ⬜ To add |
| 8 | house | `house.jpg` | ⬜ To add |
| 9 | island | `island.jpg` | ⬜ To add |
| 10 | jungle | `jungle.jpg` | ⬜ To add |
| 11 | kite | `kite.jpg` | ⬜ To add |
| 12 | lemon | `lemon.jpg` | ⬜ To add |
| 13 | monkey | `monkey.jpg` | ⬜ To add |
| 14 | notebook | `notebook.jpg` | ⬜ To add |
| 15 | orange | `orange.jpg` | ⬜ To add |
| 16 | piano | `piano.jpg` | ⬜ To add |
| 17 | queen | `queen.jpg` | ⬜ To add |
| 18 | rainbow | `rainbow.jpg` | ⬜ To add |
| 19 | sunshine | `sunshine.jpg` | ⬜ To add |
| 20 | turtle | `turtle.jpg` | ⬜ To add |
| 21 | umbrella | `umbrella.jpg` | ⬜ To add |
| 22 | violin | `violin.jpg` | ⬜ To add |
| 23 | watermelon | `watermelon.jpg` | ⬜ To add |
| 24 | xylophone | `xylophone.jpg` | ⬜ To add |
| 25 | yogurt | `yogurt.jpg` | ⬜ To add |
| 26 | zebra | `zebra.jpg` | ⬜ To add |

### Step 4: Update JSON File

After adding images, you have two options:

#### Option A: Automatic Update (Recommended)
Run this command from the `app` folder:
```bash
node scripts/update-json-to-local.js
```

This will automatically update `pronunciation_words.json` to use local images for any word that has a matching file.

#### Option B: Manual Update
Edit `app/public/pronunciation_words.json` and change each `imageUrl` from:
```json
"imageUrl": "https://images.unsplash.com/photo-..."
```

To:
```json
"imageUrl": "/images/words/apple.jpg"
```

### Step 5: Verify

After adding images and updating JSON:
1. Check that images display correctly in the app
2. Verify all words show the correct images
3. Test on mobile devices to ensure images load properly

---

## 📋 Example: Setting Up 3 Words

Let's say you want to set up local images for **apple**, **banana**, and **cat**:

1. **Add these 3 files** to `app/public/images/words/`:
   - `apple.jpg`
   - `banana.jpg`
   - `cat.jpg`

2. **Update JSON** - Either:
   - Run: `node scripts/update-json-to-local.js` (automatic)
   - Or manually edit `pronunciation_words.json`:
     ```json
     {
       "id": "1",
       "word": "apple",
       "imageUrl": "/images/words/apple.jpg"
     },
     {
       "id": "2",
       "word": "banana",
       "imageUrl": "/images/words/banana.jpg"
     },
     {
       "id": "3",
       "word": "cat",
       "imageUrl": "/images/words/cat.jpg"
     }
     ```

3. **Done!** Those 3 words will now use local images.

---

## 🎨 Image Requirements

- **Format**: JPG or PNG
- **Size**: 400x400px minimum (800x800px recommended)
- **Aspect Ratio**: Square (1:1) works best
- **File Size**: Keep under 200KB for fast loading
- **Quality**: Clear, colorful images that kids can easily recognize

---

## 🔍 Check Your Setup

To see which images are ready and which still need to be added, you can:

1. **Manually check** the `app/public/images/words/` folder
2. **Run the setup script** (if Node.js path issues are resolved):
   ```bash
   node scripts/setup-local-images.js
   ```

---

## 💡 Tips

- **Start small**: Add images for 5-10 words first, test them, then add more
- **Verify images**: Make sure each image clearly shows the word it represents
- **Use consistent format**: Stick with either all JPG or all PNG
- **Optimize images**: Compress images before adding to reduce file size
- **Keep backups**: Save your images in a separate folder as backup

---

## ✅ After Setup

Once all images are added and JSON is updated:
1. Images will load from your server (much faster!)
2. No dependency on external services
3. Full control over image quality and accuracy
4. Better user experience for kids

Good luck! 🚀

