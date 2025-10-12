const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Kids English Learning Mobile App...');

try {
  // Step 1: Build the Next.js app
  console.log('📦 Building Next.js app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Install Capacitor if not installed
  console.log('📱 Installing Capacitor...');
  try {
    execSync('npx cap --version', { stdio: 'pipe' });
  } catch (error) {
    execSync('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios', { stdio: 'inherit' });
  }

  // Step 3: Initialize Capacitor
  console.log('⚙️ Initializing Capacitor...');
  try {
    execSync('npx cap init "Kids English Learning" "com.kidsenglish.learning" --web-dir=out', { stdio: 'inherit' });
  } catch (error) {
    console.log('Capacitor already initialized');
  }

  // Step 4: Add platforms
  console.log('📱 Adding Android platform...');
  try {
    execSync('npx cap add android', { stdio: 'inherit' });
  } catch (error) {
    console.log('Android platform already added');
  }

  // Step 5: Sync
  console.log('🔄 Syncing with native platforms...');
  execSync('npx cap sync', { stdio: 'inherit' });

  console.log('✅ Mobile app build complete!');
  console.log('📱 To open Android Studio: npx cap open android');
  console.log('🍎 To open Xcode: npx cap open ios');
  console.log('📦 To build APK: npx cap run android');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
