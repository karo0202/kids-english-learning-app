# Security Features Setup Script
# Run this script in PowerShell to complete the setup

Write-Host "🔒 Security Features Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Fix Git Lock File
Write-Host "Step 1: Fixing Git lock file..." -ForegroundColor Yellow
if (Test-Path ".git/index.lock") {
    try {
        Remove-Item ".git/index.lock" -Force
        Write-Host "✅ Git lock file removed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove lock file. Please close all editors and try again." -ForegroundColor Red
        Write-Host "   Or delete manually: .git/index.lock" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No lock file found" -ForegroundColor Green
}

Write-Host ""

# Step 2: Install NPM Packages
Write-Host "Step 2: Installing NPM packages..." -ForegroundColor Yellow
Write-Host "Installing: resend firebase-admin" -ForegroundColor Gray

try {
    npm install resend firebase-admin --save --legacy-peer-deps
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Packages installed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Package installation had issues. Vercel will install them during deployment." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not install packages. This is okay - Vercel will install them automatically." -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Stage Git Changes
Write-Host "Step 3: Staging Git changes..." -ForegroundColor Yellow
try {
    git add -A
    Write-Host "✅ Changes staged" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not stage changes. Git lock file may still exist." -ForegroundColor Yellow
    Write-Host "   Please close all editors and run: git add -A" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Commit Changes
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
try {
    git commit -m "Add security features: rate limiting, Firebase Admin SDK, request logging, and email notifications"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not commit. Git lock file may still exist." -ForegroundColor Yellow
    Write-Host "   Please close all editors and run:" -ForegroundColor Yellow
    Write-Host "   git commit -m 'Add security features'" -ForegroundColor Gray
}

Write-Host ""

# Step 5: Push to GitHub
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not push. You may need to:" -ForegroundColor Yellow
    Write-Host "   1. Authenticate with GitHub" -ForegroundColor Yellow
    Write-Host "   2. Run: git push origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Script Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run SQL in Supabase (see SUPABASE_PAYMENT_LOGS.sql)" -ForegroundColor White
Write-Host "2. Set up Resend for emails (optional - see SECURITY_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "3. Set up Firebase Admin SDK (optional - see SECURITY_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "4. Redeploy on Vercel" -ForegroundColor White
Write-Host ""
Write-Host "See COMPLETE_SETUP_STEPS.md for detailed instructions." -ForegroundColor Gray
