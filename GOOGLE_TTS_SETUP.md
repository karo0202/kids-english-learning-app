# Google Cloud Text-to-Speech Setup Guide

This guide will help you set up Google Cloud Text-to-Speech for premium voice quality in the speaking sections.

## Why Google Cloud TTS?

- **Best Quality**: Natural, human-like voices optimized for clarity
- **Child-Friendly**: Specialized voices perfect for kids' English learning
- **Consistent**: Same high quality across all browsers and devices
- **Reliable**: Works everywhere, not dependent on browser/OS voice availability

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Step 2: Enable Text-to-Speech API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Cloud Text-to-Speech API"
3. Click on it and click **Enable**

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Recommended) Click **Restrict Key** and:
   - Under **API restrictions**, select "Restrict key"
   - Choose "Cloud Text-to-Speech API"
   - Save

### Step 4: Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - **Name**: `GOOGLE_TTS_API_KEY` (or `NEXT_PUBLIC_GOOGLE_TTS_API_KEY` for client-side)
   - **Value**: Your API key from Step 3
   - **Environment**: Production, Preview, Development (select all)
   - **Note**: Using `GOOGLE_TTS_API_KEY` (without NEXT_PUBLIC_) is more secure as it's server-side only
4. Click **Save**

### Step 5: Redeploy

After adding the environment variable, redeploy your app:
- Vercel will automatically redeploy, or
- Push a new commit to trigger deployment

## Pricing

Google Cloud Text-to-Speech offers a **free tier**:
- **First 1-4 million characters per month**: FREE
- After that: $4 per 1 million characters

For a kids' learning app, you'll likely stay within the free tier unless you have very high usage.

## Voice Options

The app uses these optimized voices for kids:

- **Child-Friendly** (default): `en-US-Neural2-F` - Natural, friendly female voice
- **Clear**: `en-US-Standard-E` - Very clear pronunciation
- **Friendly**: `en-US-Neural2-D` - Warm and engaging
- **Natural**: `en-US-Neural2-J` - Most natural sounding

## Fallback Behavior

If Google TTS is not configured, the app automatically falls back to:
- **Web Speech API** (browser's built-in TTS)
- Still optimized for kids with best available voices
- Works without any setup

## Testing

After setup, test the speaking module:
1. Go to the Speaking Practice section
2. Click the speaker icon next to any word
3. You should hear high-quality, natural pronunciation

## Troubleshooting

### Voice not working?
- Check that the API key is set correctly in Vercel
- Verify the API is enabled in Google Cloud Console
- Check browser console for errors
- The app will automatically fall back to Web Speech API if Google TTS fails

### API Key errors?
- Make sure the API key is not restricted to specific IPs (for web apps)
- Verify the Text-to-Speech API is enabled
- Check that billing is enabled (free tier still requires billing account)

### Want to use a different voice?
Edit `app/lib/premium-tts.ts` and modify the `getGoogleVoiceName()` function to use different Google Cloud TTS voices.

## Security Note

The API key is exposed in the client-side code (that's why it's `NEXT_PUBLIC_`). This is safe because:
- The key is restricted to only Text-to-Speech API
- Usage is monitored in Google Cloud Console
- You can set usage quotas to prevent abuse
- The free tier limits protect against excessive costs

## Alternative: Use Server-Side TTS

For better security, you can implement server-side TTS:
1. Create an API route that calls Google TTS server-side
2. Store the API key as a server-side environment variable (without `NEXT_PUBLIC_`)
3. The client calls your API route instead of Google directly

This requires more setup but provides better security.
