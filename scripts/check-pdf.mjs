import '../server/loadEnv.js';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { readClient } from '../server/sanity.js';

const slug = process.argv[2] || 'fg';
const localFile = process.argv[3];

function hash(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function inspect(label, buffer) {
  const sig = buffer.subarray(0, 8).toString();
  const tail = buffer.subarray(Math.max(0, buffer.length - 32)).toString();
  const hasEof = tail.includes('%%EOF');
  const hasXref = buffer.includes('xref') || buffer.includes('/XRef');
  return {
    label,
    bytes: buffer.length,
    sha256: hash(buffer),
    signature: sig,
    hasEof,
    hasXref,
    validHeader: sig.startsWith('%PDF'),
  };
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  return { res, buffer };
}

const doc = await readClient.fetch(
  `*[_type == "article" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    "sanityUrl": pdf.asset->url,
    "pdfFile": pdf.asset->originalFilename,
    "assetSize": pdf.asset->size,
    "mimeType": pdf.asset->mimeType
  }`,
  { slug }
);

if (!doc) {
  console.error(`Article not found: ${slug}`);
  process.exit(1);
}

console.log('Article:', {
  title: doc.title,
  slug: doc.slug,
  pdfFile: doc.pdfFile,
  assetSize: doc.assetSize,
  mimeType: doc.mimeType,
  sanityUrl: doc.sanityUrl,
});

const results = [];

if (localFile) {
  const local = readFileSync(localFile);
  results.push(inspect('local-original', local));
}

if (doc.sanityUrl) {
  const { res, buffer } = await fetchBuffer(doc.sanityUrl);
  results.push({
    ...inspect('sanity-cdn', buffer),
    httpStatus: res.status,
    contentType: res.headers.get('content-type'),
  });
  writeFileSync(`tmp-${slug}-sanity.pdf`, buffer);
}

const proxyUrl = `http://localhost:3001/api/articles/${slug}/pdf`;
try {
  const { res, buffer } = await fetchBuffer(proxyUrl);
  results.push({
    ...inspect('api-proxy', buffer),
    httpStatus: res.status,
    contentType: res.headers.get('content-type'),
  });
  writeFileSync(`tmp-${slug}-proxy.pdf`, buffer);
} catch (err) {
  results.push({ label: 'api-proxy', error: err.message });
}

console.log('\nComparison:');
console.table(results);

if (results.length >= 2) {
  const hashes = results.filter((r) => r.sha256).map((r) => r.sha256);
  const unique = new Set(hashes);
  console.log('\nAll copies identical:', unique.size === 1);
  if (unique.size > 1) {
    console.log('=> Upload or proxy is changing the file.');
  } else {
    console.log('=> File is identical everywhere. Issue is likely PDF format/browser compatibility, not upload corruption.');
  }
}

console.log(`\nSaved files: tmp-${slug}-sanity.pdf, tmp-${slug}-proxy.pdf (if fetched)`);
console.log('Open those files directly in Adobe Reader or Edge to compare with browser viewer.');
