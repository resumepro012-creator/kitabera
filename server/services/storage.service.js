import { randomUUID } from 'crypto';
import path from 'path';
import { bucket } from '../config/firebase.js';

/**
 * Uploads a buffer to Firebase Storage and makes it publicly readable.
 * @param {Buffer} buffer
 * @param {string} destPath - full object path inside the bucket, e.g. "pdfs/adan/jannat-1/1-abc123.pdf"
 * @param {string} contentType
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadFile(buffer, destPath, contentType) {
  const file = bucket().file(destPath);

  await file.save(buffer, {
    contentType,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });

  await file.makePublic();

  return {
    url: `https://storage.googleapis.com/${bucket().name}/${destPath}`,
    path: destPath
  };
}

export async function deleteFile(destPath) {
  if (!destPath) return;

  try {
    await bucket().file(destPath).delete();
  } catch (error) {
    // 404 just means it's already gone — safe to ignore.
    if (error?.code !== 404) {
      throw error;
    }
  }
}

export async function deleteFolder(prefix) {
  if (!prefix) return;
  await bucket().deleteFiles({ prefix }).catch((error) => {
    if (error?.code !== 404) {
      throw error;
    }
  });
}

export function buildPdfPath({ writerSlug, novelSlug, episodeNumber, originalName }) {
  const extension = path.extname(originalName || '') || '.pdf';
  return `pdfs/${writerSlug}/${novelSlug}/${episodeNumber}-${randomUUID()}${extension}`;
}

export function buildAvatarPath({ writerSlug, originalName }) {
  const extension = path.extname(originalName || '') || '.jpg';
  return `avatars/${writerSlug}-${randomUUID()}${extension}`;
}

export function buildCoverPath({ writerSlug, novelSlug, originalName }) {
  const extension = path.extname(originalName || '') || '.jpg';
  return `covers/${writerSlug}/${novelSlug}-${randomUUID()}${extension}`;
}
