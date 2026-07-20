import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { normalizeDocTimestamps, normalizeTimestamp } from '../utils/helpers.js';

function mapDoc(doc) {
  return normalizeDocTimestamps({ id: doc.id, ...doc.data() });
}

// ============================= WRITERS =============================

export async function listWriters() {
  const snapshot = await db().collection('writers').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapDoc);
}

export async function getWriterById(writerId) {
  const doc = await db().collection('writers').doc(writerId).get();
  return doc.exists ? mapDoc(doc) : null;
}

export async function getWriterBySlug(slug) {
  const snapshot = await db().collection('writers').where('slug', '==', slug).limit(1).get();
  return snapshot.empty ? null : mapDoc(snapshot.docs[0]);
}

export async function createWriter({ name, slug, bio, avatarUrl, avatarPath }) {
  const id = `writer_${randomUUID()}`;
  const data = {
    name,
    slug,
    bio: bio || 'A featured Kitab Era writer.',
    avatarUrl: avatarUrl || '',
    avatarPath: avatarPath || '',
    novelCount: 0,
    totalViews: 0,
    followers: 0,
    createdAt: FieldValue.serverTimestamp()
  };

  await db().collection('writers').doc(id).set(data);
  return { id, ...data, createdAt: new Date().toISOString() };
}

export async function updateWriter(writerId, fields) {
  await db().collection('writers').doc(writerId).set(
    { ...fields, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return getWriterById(writerId);
}

export async function deleteWriter(writerId) {
  await db().collection('writers').doc(writerId).delete();
}

export async function incrementWriterNovelCount(writerId, increment = 1) {
  const writerRef = db().collection('writers').doc(writerId);
  await db().runTransaction(async (transaction) => {
    const writerDoc = await transaction.get(writerRef);
    if (writerDoc.exists) {
      transaction.update(writerRef, {
        novelCount: FieldValue.increment(increment),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  });
}

// ============================== NOVELS ==============================
// Novels carry denormalized episodeCount / fileUrl / averageRating / reviewCount
// so that listing endpoints (library, popular novels, admin dashboard) never
// need to query the episodes/reviews collections — only a single novel's own
// detail page does that, keeping reads O(1) per novel regardless of scale.

export async function listNovels() {
  const snapshot = await db().collection('novels').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapDoc);
}

export async function listNovelsByWriter(writerId) {
  const snapshot = await db()
    .collection('novels')
    .where('writerId', '==', writerId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(mapDoc);
}

export async function getNovelById(novelId) {
  const doc = await db().collection('novels').doc(novelId).get();
  return doc.exists ? mapDoc(doc) : null;
}

export async function createNovel({ writerId, writerSlug, title, novelSlug, summary, category, subcategory, status = 'ongoing', coverUrl = '', coverPath = '', originalFilename = '' }) {
  const id = `novel_${randomUUID()}`;
  const data = {
    writerId,
    writerSlug,
    title,
    novelSlug,
    summary,
    category,
    subcategory,
    status,
    views: 0,
    likes: 0,
    bookmarks: 0,
    episodeCount: 0,
    fileUrl: '',
    averageRating: 0,
    reviewCount: 0,
    coverUrl,
    coverPath,
    originalFilename,
    createdAt: FieldValue.serverTimestamp()
  };

  await db().runTransaction(async (transaction) => {
    transaction.set(db().collection('novels').doc(id), data);
    const writerRef = db().collection('writers').doc(writerId);
    transaction.update(writerRef, {
      novelCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
  });
  
  return { id, ...data, createdAt: new Date().toISOString() };
}

export async function updateNovel(novelId, fields) {
  await db().collection('novels').doc(novelId).set(
    { ...fields, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return getNovelById(novelId);
}

export async function deleteNovel(novelId) {
  const novelDoc = await db().collection('novels').doc(novelId).get();
  if (novelDoc.exists) {
    const novelData = novelDoc.data();
    await db().runTransaction(async (transaction) => {
      transaction.delete(db().collection('novels').doc(novelId));
      const writerRef = db().collection('writers').doc(novelData.writerId);
      transaction.update(writerRef, {
        novelCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp()
      });
    });
  }
}

export async function incrementNovelViews(novelId) {
  const novelRef = db().collection('novels').doc(novelId);
  await novelRef.update({
    views: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp()
  });
}

// ============================= EPISODES =============================

export async function listEpisodesByNovel(novelId) {
  const snapshot = await db()
    .collection('episodes')
    .where('novelId', '==', novelId)
    .orderBy('episodeNumber', 'asc')
    .get();
  return snapshot.docs.map(doc => {
    const data = mapDoc(doc);
    return {
      ...data,
      fileUrl: data.pdfUrl, // For frontend compatibility
      filePath: data.pdfPath
    };
  });
}

/**
 * Creates an episode and atomically keeps the parent novel's denormalized
 * episodeCount / fileUrl in sync — safe even if two uploads happen at once.
 */
export async function createEpisode({ novelId, title, episodeNumber, pdfUrl, pdfPath, originalFilename = '' }) {
  const id = `episode_${randomUUID()}`;
  const episode = {
    novelId,
    title,
    episodeNumber,
    pdfUrl,
    pdfPath,
    originalFilename,
    createdAt: FieldValue.serverTimestamp()
  };

  const novelRef = db().collection('novels').doc(novelId);
  const episodeRef = db().collection('episodes').doc(id);

  await db().runTransaction(async (transaction) => {
    const novelDoc = await transaction.get(novelRef);
    if (!novelDoc.exists) {
      throw new Error('Novel not found.');
    }

    transaction.set(episodeRef, episode);

    const currentCount = novelDoc.data().episodeCount || 0;
    const updates = { episodeCount: currentCount + 1, updatedAt: FieldValue.serverTimestamp() };
    // Keep a quick-open URL and path on the novel pointing at its first episode.
    if (currentCount === 0) {
      updates.fileUrl = pdfUrl;
      updates.filePath = pdfPath;
    }
    transaction.update(novelRef, updates);
  });

  return { id, ...episode, createdAt: new Date().toISOString() };
}

export async function deleteEpisodesByNovel(novelId) {
  const snapshot = await db().collection('episodes').where('novelId', '==', novelId).get();
  const batch = db().batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.docs.map(mapDoc);
}

// ============================== REVIEWS ==============================

export async function listReviewsByNovel(novelId) {
  const snapshot = await db()
    .collection('reviews')
    .where('novelId', '==', novelId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(mapDoc);
}

/**
 * Creates a review and atomically recomputes the parent novel's
 * averageRating/reviewCount inside a transaction (safe under concurrent votes).
 */
export async function createReview(novelId, { rating, reviewerName, reviewText }) {
  const id = `review_${randomUUID()}`;
  const review = {
    novelId,
    rating: Number(rating),
    reviewerName: reviewerName || 'Anonymous',
    reviewText: reviewText || '',
    createdAt: FieldValue.serverTimestamp()
  };

  const novelRef = db().collection('novels').doc(novelId);
  const reviewRef = db().collection('reviews').doc(id);

  await db().runTransaction(async (transaction) => {
    const novelDoc = await transaction.get(novelRef);
    if (!novelDoc.exists) {
      throw new Error('Novel not found.');
    }

    const data = novelDoc.data();
    const previousCount = data.reviewCount || 0;
    const previousAverage = data.averageRating || 0;
    const nextCount = previousCount + 1;
    const nextAverage = (previousAverage * previousCount + review.rating) / nextCount;

    transaction.set(reviewRef, review);
    transaction.update(novelRef, { reviewCount: nextCount, averageRating: nextAverage });
  });

  return { id, ...review, createdAt: new Date().toISOString() };
}

export async function deleteReviewsByNovel(novelId) {
  const snapshot = await db().collection('reviews').where('novelId', '==', novelId).get();
  const batch = db().batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

// Helper function to extract the filename from a path or URL
function extractFilename(pathOrUrl) {
  if (!pathOrUrl) return '';
  try {
    // First, try to parse as URL to handle Supabase public URLs
    const url = new URL(pathOrUrl);
    const pathname = url.pathname;
    return pathname.split('/').pop() || '';
  } catch {
    // If not a valid URL, treat as a path
    return pathOrUrl.split('/').pop() || '';
  }
}

export async function findFileByFilename(filename) {
  // Search novels
  const novels = await listNovels();
  for (const novel of novels) {
    const filePath = novel.filePath || '';
    const fileUrl = novel.fileUrl || '';
    const fileNameFromPath = extractFilename(filePath);
    const fileNameFromUrl = extractFilename(fileUrl);
    if (fileNameFromPath === filename || fileNameFromUrl === filename) {
      return { 
        type: 'novel', 
        path: filePath || '', 
        url: fileUrl || '', 
        originalFilename: novel.originalFilename,
        title: novel.title
      };
    }
  }
  // Search episodes
  const allNovels = await listNovels();
  for (const novel of allNovels) {
    const episodes = await listEpisodesByNovel(novel.id);
    for (const episode of episodes) {
      const pdfPath = episode.pdfPath || episode.filePath || '';
      const pdfUrl = episode.pdfUrl || episode.fileUrl || '';
      const fileNameFromPath = extractFilename(pdfPath);
      const fileNameFromUrl = extractFilename(pdfUrl);
      if (fileNameFromPath === filename || fileNameFromUrl === filename) {
        return { 
          type: 'episode', 
          path: pdfPath, 
          url: pdfUrl, 
          originalFilename: episode.originalFilename,
          title: episode.title
        };
      }
    }
  }
  return null;
}

export { normalizeTimestamp };

// ALIASES for backward compatibility with existing controllers:
export function getAllWriters() { return listWriters(); }
export function getAllNovels() { return listNovels(); }
export function getWriter(writerId) { return getWriterById(writerId); }
export function getNovel(novelId) { return getNovelById(novelId); }
export function getEpisodesByNovelId(novelId) { return listEpisodesByNovel(novelId); }
export function getReviewsByNovelId(novelId) { return listReviewsByNovel(novelId); }
export function deleteReviewsByNovelId(novelId) { return deleteReviewsByNovel(novelId); }
export function deleteEpisodesByNovelId(novelId) { return deleteEpisodesByNovel(novelId); }
