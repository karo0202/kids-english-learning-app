const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createLogo() {
  // Create canvas
  const width = 400;
  const height = 240;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Red Book
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(120, 140, 160, 80);
  
  // Book pages (white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(130, 150, 140, 60);
  
  // Text lines on book
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(140, 160 + i * 15);
    ctx.lineTo(260, 160 + i * 15);
    ctx.stroke();
  }

  // Boy Character
  // Head (yellow)
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(200, 100, 40, 0, 2 * Math.PI);
  ctx.fill();

  // Hair (brown)
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.arc(200, 100, 40, Math.PI, 0);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(185, 90, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(215, 90, 4, 0, 2 * Math.PI);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.arc(170, 100, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(230, 100, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Open mouth with tooth
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.ellipse(200, 115, 16, 12, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // White tooth
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(196, 110, 8, 10);

  // Blue Shirt
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(170, 140, 60, 50);

  // Left arm (waving)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(150, 144, 16, 40);
  ctx.beginPath();
  ctx.arc(158, 148, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Right arm
  ctx.fillRect(234, 144, 16, 40);

  // Floating Letters
  // Letter A (Orange)
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(260, 50);
  ctx.lineTo(280, 50);
  ctx.lineTo(285, 60);
  ctx.lineTo(275, 60);
  ctx.lineTo(270, 55);
  ctx.lineTo(265, 55);
  ctx.lineTo(260, 60);
  ctx.lineTo(255, 60);
  ctx.closePath();
  ctx.fill();

  // Letter B (Light Blue)
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(290, 50, 12, 32);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(292, 52, 8, 6);
  ctx.fillRect(292, 60, 8, 6);
  ctx.fillRect(292, 68, 8, 6);

  // Letter C (Green)
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(320, 66, 12, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(312, 58, 8, 16);

  // Text: KIDS ENGLISH
  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('KIDS', 200, 220);

  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('ENGLISH', 200, 250);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), buffer);
  
  // Create favicon (smaller version)
  const faviconCanvas = createCanvas(64, 64);
  const faviconCtx = faviconCanvas.getContext('2d');
  
  // Black background
  faviconCtx.fillStyle = '#000000';
  faviconCtx.fillRect(0, 0, 64, 64);
  
  // Red Book
  faviconCtx.fillStyle = '#dc2626';
  faviconCtx.fillRect(20, 40, 24, 16);
  
  // Book pages
  faviconCtx.fillStyle = '#ffffff';
  faviconCtx.fillRect(22, 42, 20, 12);
  
  // Boy head
  faviconCtx.fillStyle = '#fbbf24';
  faviconCtx.beginPath();
  faviconCtx.arc(32, 20, 8, 0, 2 * Math.PI);
  faviconCtx.fill();
  
  // Eyes
  faviconCtx.fillStyle = '#1f2937';
  faviconCtx.beginPath();
  faviconCtx.arc(29, 18, 1, 0, 2 * Math.PI);
  faviconCtx.fill();
  faviconCtx.beginPath();
  faviconCtx.arc(35, 18, 1, 0, 2 * Math.PI);
  faviconCtx.fill();
  
  // Blue shirt
  faviconCtx.fillStyle = '#3b82f6';
  faviconCtx.fillRect(28, 28, 8, 10);
  
  const faviconBuffer = faviconCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), faviconBuffer);
  
  console.log('✅ PNG logo created successfully!');
  console.log('📁 Output: logo.png and favicon.png');
}

createLogo();
