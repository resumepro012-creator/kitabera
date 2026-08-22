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

  // Diagnostic logs to pinpoint missing vars on Render
  console.log('🔍 Supabase Credentials Check:');
  console.log('   SUPABASE_URL:', supabaseUrl ? `✅ SET (${supabaseUrl})` : '❌ MISSING');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? `✅ SET (length: ${supabaseServiceRoleKey.length})` : '❌ MISSING');
  console.log('   SUPABASE_BUCKET:', supabaseBucket ? `✅ SET (${supabaseBucket})` : '❌ MISSING');

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
  console.log(`[Storage] uploadFile START: bucket="${supabaseBucket}", path="${destPath}", contentType="${contentType}", buffer length=${Buffer.isBuffer(buffer) ? buffer.length : typeof buffer}`);

  // Ensure we have a proper Buffer
  if (!Buffer.isBuffer(buffer)) {
    console.warn(`[Storage] uploadFile input is NOT a Buffer (${typeof buffer}), attempting conversion...`);
    buffer = Buffer.from(buffer);
  }

  if (buffer.length === 0) {
    console.error(`[Storage] uploadFile ERROR: Empty buffer provided for "${destPath}"`);
    throw new Error('Empty file provided. Please upload a valid file.');
  }

  const finalContentType = contentType || (destPath?.toLowerCase()?.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
  console.log(`[Storage] Supabase upload attempt: bucket="${supabaseBucket}", path="${destPath}", contentType="${finalContentType}", size=${buffer.length} bytes`);

  const { error } = await client.storage
    .from(supabaseBucket)
    .upload(destPath, buffer, {
      contentType: finalContentType,
      upsert: true
    });

  if (error) {
    console.error(`[Storage] Supabase upload FAILED for "${destPath}":`, error);
    throw error;
  }

  const { data: { publicUrl } } = client.storage
    .from(supabaseBucket)
    .getPublicUrl(destPath);

  console.log(`[Storage] uploadFile SUCCESS: publicUrl="${publicUrl}", path="${destPath}"`);

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
  console.log(`[Storage] downloadFile requested for path: "${filePath}"`);

  // Handle old Railway/legacy paths (e.g. "/uploads/novels/123-uuid.pdf")
  // These files don't exist in Supabase since they were local filesystem only
  const isLegacyUploadsPath = filePath && (
    filePath.startsWith('/uploads/') || 
    filePath.startsWith('uploads/')
  );
  if (isLegacyUploadsPath) {
    console.warn(`[Storage] Legacy Railway local path detected: "${filePath}". File not in Supabase (migrated from Railway local storage).`);
    const err = new Error('File not found. This file was uploaded on the old system and is no longer available. Please re-upload.');
    err.status = 404;
    throw err;
  }

  // If path is actually a public URL (https://...), extract object path inside bucket
  let finalPath = filePath;
  if (typeof filePath === 'string' && filePath.startsWith('http')) {
    try {
      const url = new URL(filePath);
      // Typical Supabase public URL: /storage/v1/object/public/{bucket}/{path}
      const match = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
      if (match) {
        finalPath = decodeURIComponent(match[1]);
        console.log(`[Storage] Extracted bucket path from public URL: "${finalPath}"`);
      } else {
        finalPath = url.pathname.split('/').pop(); // fallback to filename
        console.log(`[Storage] Could not parse Supabase URL, using filename fallback: "${finalPath}"`);
      }
    } catch {
      // ignore, keep filePath as-is
    }
  }

  console.log(`[Storage] Supabase download attempt: bucket="${supabaseBucket}", path="${finalPath}"`);
  const { data, error } = await client.storage
    .from(supabaseBucket)
    .download(finalPath);

  if (error) {
    console.error(`[Storage] Supabase download FAILED for "${finalPath}":`, error);
    // If file not found, set status to 404
    if (error.statusCode === 404 || (error.message && (error.message.includes('not found') || error.message.includes('does not exist')))) {
      const notFoundErr = new Error(`File not found in storage: "${finalPath}"`);
      notFoundErr.status = 404;
      throw notFoundErr;
    }
    throw error;
  }

  // Supabase download returns either Node Buffer (server-side) or Blob (browser)
  // Node Buffer has .buffer (ArrayBuffer) + length, Blob has .arrayBuffer() method
  console.log(`[Storage] Download OK for "${finalPath}". Raw data type: ${data?.constructor?.name}, has .arrayBuffer: ${typeof data?.arrayBuffer === 'function'}, is Buffer: ${Buffer.isBuffer(data)}`);

  let buffer;
  if (Buffer.isBuffer(data)) {
    buffer = data;
    console.log(`[Storage] Received Node.js Buffer, length=${buffer.length}`);
  } else if (data && typeof data.arrayBuffer === 'function') {
    // Blob / File (browser-style)
    const arrayBuffer = await data.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    console.log(`[Storage] Received Blob, converted to Buffer length=${buffer.length}`);
  } else if (data && data instanceof ArrayBuffer) {
    buffer = Buffer.from(data);
  } else if (data) {
    // Last-ditch attempt
    buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  } else {
    throw new Error('No data returned from storage download');
  }

  // Attach buffer (for old API consumers) + also expose length via new property
  buffer._storageBuffer = true;
  return buffer;
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
