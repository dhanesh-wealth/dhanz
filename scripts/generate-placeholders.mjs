import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, '../src/assets/images');

const images = [
  { name: 'logo.svg', w: 200, h: 60, color: '#0A4DA2', label: 'Dhanz Wealth' },
  { name: 'hero1.jpg', w: 1920, h: 1080, color: '#0A4DA2', label: 'Hero 1' },
  { name: 'hero2.jpg', w: 1920, h: 1080, color: '#1a5fbf', label: 'Hero 2' },
  { name: 'hero3.jpg', w: 1920, h: 1080, color: '#083d82', label: 'Hero 3' },
  { name: 'investment-management.jpg', w: 800, h: 500, color: '#0A4DA2', label: 'Investment' },
  { name: 'treasury.jpg', w: 800, h: 500, color: '#1a6b3c', label: 'Treasury' },
  { name: 'retirement.jpg', w: 800, h: 500, color: '#2d6a9f', label: 'Retirement' },
  { name: 'goal-based.jpg', w: 800, h: 500, color: '#5DBB63', label: 'Goal Based' },
  { name: 'tax-planning.jpg', w: 800, h: 500, color: '#0A4DA2', label: 'Tax Planning' },
  { name: 'mutualfund.jpg', w: 800, h: 500, color: '#0A4DA2', label: 'Mutual Funds' },
  { name: 'pms.jpg', w: 800, h: 500, color: '#1a5fbf', label: 'PMS' },
  { name: 'aif.jpg', w: 800, h: 500, color: '#083d82', label: 'AIF' },
  { name: 'shares.jpg', w: 800, h: 500, color: '#2d6a9f', label: 'Shares' },
  { name: 'bonds.jpg', w: 800, h: 500, color: '#5DBB63', label: 'Bonds' },
  { name: 'familyoffice.jpg', w: 800, h: 500, color: '#0A4DA2', label: 'Family Office' },
  { name: 'placeholder.svg', w: 800, h: 500, color: '#ccc', label: 'Placeholder' },
];

function createSvg({ w, h, color, label }) {
  const fontSize = Math.min(w, h) * 0.06;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.6"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    fill="white" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" opacity="0.9">${label}</text>
</svg>`;
}

mkdirSync(imagesDir, { recursive: true });

for (const img of images) {
  const content = createSvg(img);
  writeFileSync(join(imagesDir, img.name), content, 'utf8');
}

console.log(`Generated ${images.length} placeholder images in ${imagesDir}`);
