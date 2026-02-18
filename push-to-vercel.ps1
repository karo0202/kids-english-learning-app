# Push to Vercel - Run this script to deploy
# Double-click or run in PowerShell: .\push-to-vercel.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Pushing to Vercel (GitHub)..." -ForegroundColor Cyan

# Remove lock file if it exists
if (Test-Path ".git\index.lock") {
    Remove-Item ".git\index.lock" -Force
    Write-Host "Removed git lock file" -ForegroundColor Yellow
}

# Stage all changes
git add -A
Write-Host "Staged changes" -ForegroundColor Green

# Commit
git commit -m "Security features, auth fix for payments, push to Vercel"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
}

# Push
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Done! Vercel will deploy automatically." -ForegroundColor Green
} else {
    Write-Host "Push failed. You may need to log in to GitHub." -ForegroundColor Red
    Write-Host "Try: git push origin main" -ForegroundColor Yellow
}

Read-Host "Press Enter to close"
