import { randomUUID } from 'crypto';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

let cachedSupabase = null;

function getSupabaseClient() {
  if (cachedSupabase) {
    return cachedSupabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseBucket = process.env.SUPABASE_BUCKET;

  if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseBucket) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_BUCKET in your .env file.'
    );
  }

  cachedSupabase = {
    client: createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }),
    bucket: supabaseBucket
  };

  return cachedSupabase;
}

/**
 * Uploads a buffer to Supabase Storage and makes it publicly readable.
 * @param {Buffer} buffer
 * @param {string} destPath - full object path inside the bucket, e.g. "pdfs/adan/jannat-1/1-abc123.pdf"
 * @param {string} contentType
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadFile(buffer, destPath, contentType) {
  const { client, bucket: supabaseBucket } = getSupabaseClient();
  const { error } = await client.storage
    .from(supabaseBucket)
    .upload(destPath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = client.storage
    .from(supabaseBucket)
    .getPublicUrl(destPath);

  return {
    url: publicUrl,
    path: destPath
  };
}

export async function deleteFile(destPath) {
  if (!destPath) {
    console.log("deleteFile: no destPath, skipping");
    return;
  }

  console.log("deleteFile: deleting", destPath);
  try {
    const { client, bucket: supabaseBucket } = getSupabaseClient();
    const { error } = await client.storage
      .from(supabaseBucket)
      .remove([destPath]);

    if (error) {
      console.log("deleteFile: error:", error);
      // Ignore "not found" errors
      if (!error.message.includes('not found')) {
        throw error;
      }
    }
    console.log("deleteFile: done");
  } catch (error) {
    console.log("deleteFile: catch error:", error);
    // Ignore "not found" errors
    if (!error.message?.includes('not found')) {
      throw error;
    }
  }
}

export async function deleteFolder(prefix) {
  if (!prefix) {
    console.log("deleteFolder: no prefix, skipping");
    return;
  }

  console.log("deleteFolder: prefix:", prefix);
  try {
    const { client, bucket: supabaseBucket } = getSupabaseClient();
    // First, list all files with the given prefix
    const { data: files, error: listError } = await client.storage
      .from(supabaseBucket)
      .list(prefix);

    if (listError) {
      console.log("deleteFolder: listError:", listError);
      throw listError;
    }
    console.log("deleteFolder: found files:", files);

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${prefix}/${file.name}`);
      console.log("deleteFolder: filePaths to delete:", filePaths);
      const { error: deleteError } = await client.storage
        .from(supabaseBucket)
        .remove(filePaths);

      if (deleteError) {
        console.log("deleteFolder: deleteError:", deleteError);
        throw deleteError;
      }
    }
    console.log("deleteFolder: done");
  } catch (error) {
    console.log("deleteFolder: catch error:", error);
    // Ignore "not found" errors
    if (!error.message?.includes('not found')) {
      throw error;
    }
  }
}

export async function downloadFile(filePath) {
  const { client, bucket: supabaseBucket } = getSupabaseClient();
  const { data, error } = await client.storage
    .from(supabaseBucket)
    .download(filePath);

  if (error) {
    throw error;
  }

  return data;
}

export function buildPdfPath({ writerSlug, novelSlug, episodeNumber, originalName, originalname }) {
  const extension = path.extname(originalName || originalname || '') || '.pdf';
  return `pdfs/${writerSlug}/${novelSlug}/${episodeNumber}-${randomUUID()}${extension}`;
}

export function buildAvatarPath({ writerSlug, originalName, originalname }) {
  const extension = path.extname(originalName || originalname || '') || '.jpg';
  return `avatars/${writerSlug}-${randomUUID()}${extension}`;
}

export function buildCoverPath({ writerSlug, novelSlug, originalName, originalname }) {
  const extension = path.extname(originalName || originalname || '') || '.jpg';
  return `covers/${writerSlug}/${novelSlug}-${randomUUID()}${extension}`;
}
