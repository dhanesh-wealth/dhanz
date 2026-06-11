import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, '../src/assets/images');

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 82;

async function optimizeHeroImages() {
  const files = await readdir(imagesDir);
  const heroFiles = files.filter((f) => /^hero/i.test(f) && /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of heroFiles) {
    const input = join(imagesDir, file);
    const { size: before } = await stat(input);
    const base = basename(file, extname(file));
    const webpOut = join(imagesDir, `${base}.webp`);
    const jpgOut = join(imagesDir, file);

    const pipeline = sharp(input)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .rotate();

    await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpOut);

    await pipeline
      .clone()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(jpgOut + '.tmp');

    const { rename, unlink } = await import('fs/promises');
    await unlink(jpgOut);
    await rename(jpgOut + '.tmp', jpgOut);

    const { size: after } = await stat(jpgOut);
    const { size: webpSize } = await stat(webpOut);

    console.log(
      `${file}: ${(before / 1024 / 1024).toFixed(1)}MB → JPG ${(after / 1024).toFixed(0)}KB, WebP ${(webpSize / 1024).toFixed(0)}KB`,
    );
  }

  console.log('Hero images optimized.');
}

optimizeHeroImages().catch(console.error);
