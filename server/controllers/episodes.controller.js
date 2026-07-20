import * as firestoreService from '../services/firestore.service.js';
import * as storageService from '../services/storage.service.js';
import { novelSlugFromTitle } from '../utils/helpers.js';

/**
 * Creates a new novel and optionally uploads an initial file/episode
 */
export async function createNovelWithUpload({ writerId, writerSlug, title, summary, category, subcategory, file, episodeTitle }) {
  const novelSlug = novelSlugFromTitle(title);
  const originalFilename = file ? file.originalname : '';

  // Create novel in Firestore
  const novel = await firestoreService.createNovel({
    writerId,
    writerSlug,
    title,
    novelSlug,
    summary,
    category,
    subcategory,
    status: 'ongoing',
    originalFilename
  });

  // If we have a file, upload it as either single file or first episode
  if (file) {
    if (subcategory === 'episodic-novel') {
      // Upload as first episode
      const episodeNumber = 1;
      const destPath = storageService.buildPdfPath({
        writerSlug,
        novelSlug,
        episodeNumber,
        originalName: file.originalname // multer uses lowercase 'n'
      });
      const saved = await storageService.uploadFile(file.buffer, destPath, 'application/pdf');

      await firestoreService.createEpisode({
        novelId: novel.id,
        title: episodeTitle || 'Episode 1',
        episodeNumber,
        pdfUrl: saved.url,
        pdfPath: saved.path,
        originalFilename
      });
    } else {
      // Upload as single file (e.g., complete novel, poetry, etc.)
      const destPath = storageService.buildPdfPath({
        writerSlug,
        novelSlug,
        episodeNumber: 1,
        originalName: file.originalname // multer uses lowercase 'n'
      });
      const saved = await storageService.uploadFile(file.buffer, destPath, 'application/pdf');

      // Update novel with file URL and count
      await firestoreService.updateNovel(novel.id, {
        fileUrl: saved.url,
        filePath: saved.path,
        episodeCount: 1
      });
    }
  }

  // Return updated novel with episodes if needed
  const updatedNovel = await firestoreService.getNovelById(novel.id);
  let episodes = [];
  if (subcategory === 'episodic-novel') {
    episodes = await firestoreService.listEpisodesByNovel(novel.id);
  }
  return { ...updatedNovel, episodes, episodeCount: updatedNovel.episodeCount };
}

/**
 * Adds an episode to an existing episodic novel
 */
export async function addEpisodeToNovel({ novelId, writerId, writerSlug, file, episodeTitle }) {
  const novel = await firestoreService.getNovelById(novelId);

  if (!novel) {
    throw new Error('Selected novel does not exist.');
  }

  if (novel.writerId !== writerId) {
    throw new Error('Selected novel does not belong to the chosen writer.');
  }

  if (novel.subcategory !== 'episodic-novel') {
    throw new Error('Episodes can only be uploaded to episodic novels.');
  }

  if (!file) {
    throw new Error('PDF file is required when uploading an episode.');
  }

  const episodeNumber = (novel.episodeCount || 0) + 1;
  const originalFilename = file.originalname;
  const destPath = storageService.buildPdfPath({
    writerSlug: novel.writerSlug,
    novelSlug: novel.novelSlug,
    episodeNumber,
    originalName: file.originalname // multer uses lowercase 'n'
  });
  const saved = await storageService.uploadFile(file.buffer, destPath, 'application/pdf');

  await firestoreService.createEpisode({
    novelId: novel.id,
    title: episodeTitle || `Episode ${episodeNumber}`,
    episodeNumber,
    pdfUrl: saved.url,
    pdfPath: saved.path,
    originalFilename
  });

  const updatedNovel = await firestoreService.getNovelById(novelId);
  const episodes = await firestoreService.listEpisodesByNovel(novel.id);

  return { ...updatedNovel, episodes, episodeCount: episodes.length };
}

/**
 * Adds an episode/file to an existing episodic-novel folder.
 * Called from novels.controller when POST /api/admin/novels arrives with a novelId.
 */
export async function addEpisode(req, res) {
  const novelId = String(req.body?.novelId || '').trim();
  const writerId = String(req.body?.writerId || '').trim();
  const episodeTitle = String(req.body?.episodeTitle || '').trim();

  const novel = await firestoreService.getNovelById(novelId);

  if (!novel) {
    res.status(404).json({ message: 'Selected novel does not exist.' });
    return;
  }

  if (novel.writerId !== writerId) {
    res.status(400).json({ message: 'Selected novel does not belong to the chosen writer.' });
    return;
  }

  if (novel.subcategory !== 'episodic-novel') {
    res.status(400).json({ message: 'Episodes can only be uploaded to episodic novels.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: 'PDF file is required when uploading an episode.' });
    return;
  }

  try {
    const result = await addEpisodeToNovel({
      novelId,
      writerId,
      writerSlug: novel.writerSlug,
      file: req.file,
      episodeTitle
    });
    res.status(201).json({ novel: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
