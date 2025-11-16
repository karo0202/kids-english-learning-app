# App Icon Setup Guide

## Quick Setup

You already have a logo image at `app/public/logo.jpg`. To generate all app icons from it:

### Step 1: Install Required Package (if not already installed)
```bash
cd app
npm install sharp
```

### Step 2: Generate Icons
Run this command from the `app` directory:
```bash
node scripts/make-app-icons.js
```

This will automatically:
- Use your existing `logo.jpg` from `app/public/`
- Generate all required icon sizes (1024, 512, 256, 192, 128, 64)
- Save them to `app/public/icons/`
- Create a proper favicon

### Step 3: Verify
After running the script, check that these files exist:
- `app/public/icons/icon-64.png`
- `app/public/icons/icon-128.png`
- `app/public/icons/icon-192.png`
- `app/public/icons/icon-256.png`
- `app/public/icons/icon-512.png`
- `app/public/icons/icon-1024.png`
- `app/public/favicon.png` (will be created from your logo)

## Alternative: Use Your Own Icon Image

If you have a different icon image you want to use:

1. **Save your icon image** as one of these:
   - `app/public/logo.png` (recommended)
   - `app/public/logo.jpg`
   - `app/public/icons/logo.jpg`

2. **Run the script:**
   ```bash
   node scripts/make-app-icons.js
   ```

   Or specify a custom path:
   ```bash
   node scripts/make-app-icons.js path/to/your/icon.png
   ```

## Icon Requirements

- **Format**: PNG or JPG
- **Recommended size**: At least 1024x1024 pixels
- **Background**: Transparent background works best, but the script will handle any background
- **Shape**: Square images work best (the script will center and pad if needed)

## What the Icons Are Used For

- **Browser tab favicon**: `favicon.png` (32x32 to 512x512)
- **Mobile home screen**: `icon-192.png` and `icon-512.png`
- **PWA manifest**: All sizes in `site.webmanifest`
- **Apple devices**: `icon-192.png` and `icon-512.png`

## Troubleshooting

### "Source image not found"
- Make sure your logo file is in `app/public/logo.png` or `app/public/logo.jpg`
- Or pass the full path: `node scripts/make-app-icons.js /path/to/your/icon.png`

### "sharp module not found"
- Install it: `npm install sharp`

### Icons look blurry
- Use a higher resolution source image (at least 1024x1024)
- Make sure your source image is high quality

## After Setup

Once icons are generated, they will automatically be used by:
- Browser tabs (favicon)
- Mobile home screen when users "Add to Home Screen"
- PWA installation prompts
- App metadata

No code changes needed - the app is already configured to use these icons!

