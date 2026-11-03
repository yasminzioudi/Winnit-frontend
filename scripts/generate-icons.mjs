#!/usr/bin/env node
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { createDeflate } from 'zlib';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CRC32 table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU32BE(value) {
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt32BE(value, 0);
  return buf;
}

function writePNG(width, height, pixels) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.concat([
    Buffer.from('IHDR'),
    writeU32BE(width),
    writeU32BE(height),
    Buffer.from([8, 6, 0, 0, 0]) // bit depth 8, color type 6 (RGBA), compression 0, filter 0, interlace 0
  ]);
  const ihdrCrc = crc32(ihdr);
  
  // IDAT chunk - need to add filter byte (0) to each scanline
  const scanlineSize = width * 4 + 1; // RGBA + filter byte
  const rawData = Buffer.allocUnsafe(height * scanlineSize);
  for (let y = 0; y < height; y++) {
    rawData[y * scanlineSize] = 0; // filter byte
    pixels.copy(rawData, y * scanlineSize + 1, y * width * 4, (y + 1) * width * 4);
  }
  
  // Compress with zlib
  const compressed = [];
  return new Promise((resolve) => {
    const deflate = createDeflate({ level: 9 });
    deflate.on('data', (chunk) => compressed.push(chunk));
    deflate.on('end', () => {
      const idatData = Buffer.concat(compressed);
      const idat = Buffer.concat([Buffer.from('IDAT'), idatData]);
      const idatCrc = crc32(idat);
      
      // IEND chunk
      const iend = Buffer.from('IEND');
      const iendCrc = crc32(iend);
      
      // Assemble PNG
      const png = Buffer.concat([
        sig,
        writeU32BE(ihdr.length - 4),
        ihdr,
        writeU32BE(ihdrCrc),
        writeU32BE(idatData.length),
        idat,
        writeU32BE(idatCrc),
        writeU32BE(0),
        iend,
        writeU32BE(iendCrc)
      ]);
      
      resolve(png);
    });
    deflate.write(rawData);
    deflate.end();
  });
}

function createIcon(width, height, maskable = false) {
  const pixels = Buffer.allocUnsafe(width * height * 4);
  
  // Brand colors
  const bgColor = [163, 230, 53, 255]; // #a3e635 lime
  const fgColor = [10, 10, 10, 255]; // #0a0a0a dark
  
  // Fill background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = bgColor[0];
    pixels[i + 1] = bgColor[1];
    pixels[i + 2] = bgColor[2];
    pixels[i + 3] = bgColor[3];
  }
  
  // Draw W letter in center
  const centerX = width / 2;
  const centerY = height / 2;
  const letterSize = maskable ? width * 0.3 : width * 0.5;
  const strokeWidth = Math.max(2, Math.floor(letterSize / 10));
  
  // Simple W shape
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      
      // W consists of two V shapes
      const leftV = Math.abs(dx + letterSize / 3) < strokeWidth && Math.abs(dy) < letterSize / 2;
      const middleV = Math.abs(dx) < strokeWidth && Math.abs(dy) < letterSize / 3;
      const rightV = Math.abs(dx - letterSize / 3) < strokeWidth && Math.abs(dy) < letterSize / 2;
      
      if (leftV || middleV || rightV) {
        const offset = (y * width + x) * 4;
        pixels[offset] = fgColor[0];
        pixels[offset + 1] = fgColor[1];
        pixels[offset + 2] = fgColor[2];
        pixels[offset + 3] = fgColor[3];
      }
    }
  }
  
  return pixels;
}

async function main() {
  const iconsDir = join(__dirname, '..', 'public', 'icons');
  await mkdir(iconsDir, { recursive: true });
  
  const icons = [
    { name: 'icon-192.png', width: 192, height: 192, maskable: false },
    { name: 'icon-512.png', width: 512, height: 512, maskable: false },
    { name: 'maskable-192.png', width: 192, height: 192, maskable: true },
    { name: 'maskable-512.png', width: 512, height: 512, maskable: true },
    { name: 'apple-touch-icon.png', width: 180, height: 180, maskable: false },
  ];
  
  for (const icon of icons) {
    const pixels = createIcon(icon.width, icon.height, icon.maskable);
    const png = await writePNG(icon.width, icon.height, pixels);
    const path = join(iconsDir, icon.name);
    
    await new Promise((resolve, reject) => {
      const stream = createWriteStream(path);
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.write(png);
      stream.end();
    });
    
    // Read IHDR to verify dimensions
    const ihdrOffset = 16; // After signature and chunk length
    const w = png.readUInt32BE(ihdrOffset);
    const h = png.readUInt32BE(ihdrOffset + 4);
    
    console.log(`✓ ${icon.name}: ${w}×${h}px (${(png.length / 1024).toFixed(1)}KB)`);
  }
  
  console.log('\n✅ All icons generated successfully');
}

main().catch(console.error);
