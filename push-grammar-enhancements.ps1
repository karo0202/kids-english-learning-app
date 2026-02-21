# PowerShell script to push grammar module enhancements to Vercel
# Run this script from the app directory

Write-Host "Pushing grammar module enhancements to Vercel..." -ForegroundColor Cyan

# Navigate to app directory
Set-Location -Path $PSScriptRoot

# Remove git lock file if it exists
if (Test-Path ".git\index.lock") {
    Write-Host "Removing git lock file..." -ForegroundColor Yellow
    Remove-Item -Path ".git\index.lock" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Check git status
Write-Host "`nChecking git status..." -ForegroundColor Cyan
git status

# Stage the grammar module file
Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add components/learning/grammar-module.tsx

# Commit changes
Write-Host "`nCommitting changes..." -ForegroundColor Cyan
git commit -m "Enhance grammar sections with premium design and educational engagement

- Add premium gradient backgrounds and decorative elements
- Enhance topic cards with animations and hover effects
- Improve lesson content with better visual hierarchy
- Add interactive examples grid with staggered animations
- Enhance header with icon badges and gradient text
- Improve filter buttons with color-coded gradients
- Add smooth transitions and micro-interactions throughout"

# Push to repository
Write-Host "`nPushing to repository..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Successfully pushed to repository! Vercel will automatically deploy." -ForegroundColor Green
Write-Host "Check your Vercel dashboard for deployment status." -ForegroundColor Yellow
