import { createHash } from 'crypto';

export function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function validatePdfBuffer(buffer) {
  if (!buffer || buffer.length < 100) {
    throw new Error('PDF file is too small or empty.');
  }

  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error('The uploaded file is not a valid PDF.');
  }

  const tail = buffer.subarray(Math.max(0, buffer.length - 1024)).toString('latin1');
  if (!tail.includes('%%EOF')) {
    throw new Error('PDF appears truncated (missing %%EOF).');
  }

  const body = buffer.toString('latin1');
  if (!body.includes('xref') && !body.includes('/XRef')) {
    throw new Error('PDF is missing a cross-reference table.');
  }
}

export async function verifySanityUpload(pdfBuffer, assetUrl) {
  validatePdfBuffer(pdfBuffer);

  const uploadHash = hashBuffer(pdfBuffer);
  const res = await fetch(assetUrl);
  if (!res.ok) {
    throw new Error('Uploaded PDF could not be read back from storage.');
  }

  const remoteBuffer = Buffer.from(await res.arrayBuffer());
  validatePdfBuffer(remoteBuffer);

  const remoteHash = hashBuffer(remoteBuffer);
  if (uploadHash !== remoteHash) {
    throw new Error('PDF was changed during upload. Please re-upload the file.');
  }

  return {
    bytes: remoteBuffer.length,
    sha256: remoteHash,
  };
}
