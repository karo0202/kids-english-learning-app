# How to Replace App Icons

## Step 1: Prepare Your New Icon PNG
- Make sure you have the new icon as a PNG file
- Recommended size: At least 1024x1024 pixels for best quality
- The icon should have a transparent background if possible

## Step 2: Replace the Icons

### Option A: Using the Script (Recommended - generates all sizes automatically)

1. Save your new icon PNG file as `logo.png` in the `app/public/` folder
2. Run this command from the `app` directory:
   ```bash
   node scripts/make-app-icons.js
   ```
   This will automatically generate all icon sizes (1024, 512, 256, 192, 128, 64) in `app/public/icons/`

3. Also replace the favicon:
   - Copy your PNG file to `app/public/favicon.png`
   - Make sure it's square (e.g., 512x512 or 1024x1024)

### Option B: Manual Replacement

1. Create multiple sizes of your icon:
   - icon-64.png (64x64)
   - icon-128.png (128x128)
   - icon-192.png (192x192)
   - icon-256.png (256x256)
   - icon-512.png (512x512)
   - icon-1024.png (1024x1024)

2. Replace all files in `app/public/icons/` with your new icons

3. Replace `app/public/favicon.png` with your icon (512x512 recommended)

4. Replace `app/public/logo.png` with your icon (optional, used for the script)

## Step 3: Verify
After replacing, clear your browser cache and check:
- Browser tab favicon
- App icon when added to home screen
- All icon sizes are displaying correctly

## Note
If you need the `sharp` package for the script:
```bash
npm install sharp
```

