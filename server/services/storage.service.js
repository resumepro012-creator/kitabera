import { randomUUID } from 'crypto';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseBucket) {
  throw new Error(
    'Supabase is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_BUCKET in your .env file.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Uploads a buffer to Supabase Storage and makes it publicly readable.
 * @param {Buffer} buffer
 * @param {string} destPath - full object path inside the bucket, e.g. "pdfs/adan/jannat-1/1-abc123.pdf"
 * @param {string} contentType
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadFile(buffer, destPath, contentType) {
  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(destPath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(destPath);

  return {
    url: publicUrl,
    path: destPath
  };
}

export async function deleteFile(destPath) {
  if (!destPath) return;

  try {
    const { error } = await supabase.storage
      .from(supabaseBucket)
      .remove([destPath]);

    if (error) {
      // Ignore "not found" errors
      if (!error.message.includes('not found')) {
        throw error;
      }
    }
  } catch (error) {
    // Ignore "not found" errors
    if (!error.message?.includes('not found')) {
      throw error;
    }
  }
}

export async function deleteFolder(prefix) {
  if (!prefix) return;

  try {
    // First, list all files with the given prefix
    const { data: files, error: listError } = await supabase.storage
      .from(supabaseBucket)
      .list(prefix);

    if (listError) {
      throw listError;
    }

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${prefix}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(supabaseBucket)
        .remove(filePaths);

      if (deleteError) {
        throw deleteError;
      }
    }
  } catch (error) {
    // Ignore "not found" errors
    if (!error.message?.includes('not found')) {
      throw error;
    }
  }
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
