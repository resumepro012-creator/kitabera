import * as firestoreService from '../services/firestore.service.js';
import * as storageService from '../services/storage.service.js';
import { slugify } from '../utils/slugify.js';

export function publicWriter(writer) {
  const { avatarPath, ...rest } = writer;
  return { ...rest, novelCount: writer.novelCount || 0 };
}

export async function listAllWriters(req, res) {
  const writers = await firestoreService.listWriters();
  const withCounts = writers.map((writer) => publicWriter(writer));
  res.json({ writers: withCounts });
}

export async function getWriterPage(req, res) {
  const writer = await firestoreService.getWriterBySlug(req.params.slug);

  if (!writer) {
    res.status(404).json({ message: 'Writer not found.' });
    return;
  }

  const novels = await firestoreService.listNovelsByWriter(writer.id);

  const withEpisodesAndReviews = await Promise.all(
    novels.map(async (novel) => {
      const [episodes, reviews] = await Promise.all([
        firestoreService.listEpisodesByNovel(novel.id),
        firestoreService.listReviewsByNovel(novel.id)
      ]);
      return {
        ...novel,
        episodes,
        episodeCount: novel.episodeCount || episodes.length,
        reviews
      };
    })
  );

  res.json({
    writer: publicWriter(writer),
    novels: withEpisodesAndReviews
  });
}

export async function createWriter(req, res) {
  const name = String(req.body?.name || '').trim();
  const bio = String(req.body?.bio || '').trim();

  if (!name) {
    res.status(400).json({ message: 'Writer name is required.' });
    return;
  }

  const slug = slugify(name);
  const existing = await firestoreService.getWriterBySlug(slug);

  if (existing) {
    res.status(409).json({ message: 'A writer with this name already exists.' });
    return;
  }

  let avatarUrl = '';
  let avatarPath = '';

  if (req.file) {
    const destPath = storageService.buildAvatarPath({ writerSlug: slug, originalName: req.file.originalname });
    const saved = await storageService.uploadFile(req.file.buffer, destPath, req.file.mimetype);
    avatarUrl = saved.url;
    avatarPath = saved.path;
  }

  const writer = await firestoreService.createWriter({
    name,
    slug,
    bio: bio || 'A featured Kitab Era writer.',
    avatarUrl,
    avatarPath
  });

  res.status(201).json({ writer: publicWriter(writer, 0) });
}

export async function updateWriter(req, res) {
  const writer = await firestoreService.getWriterById(req.params.id);

  if (!writer) {
    res.status(404).json({ message: 'Writer not found.' });
    return;
  }

  const name = String(req.body?.name ?? writer.name).trim();
  const bio = String(req.body?.bio ?? writer.bio).trim();

  if (!name) {
    res.status(400).json({ message: 'Writer name is required.' });
    return;
  }

  const nextSlug = slugify(name);

  if (nextSlug !== writer.slug) {
    const existing = await firestoreService.getWriterBySlug(nextSlug);
    if (existing && existing.id !== writer.id) {
      res.status(409).json({ message: 'A writer with this name already exists.' });
      return;
    }
  }

  const fields = { name, slug: nextSlug, bio: bio || writer.bio };

  if (req.file) {
    if (writer.avatarPath) {
      await storageService.deleteFile(writer.avatarPath);
    }
    const destPath = storageService.buildAvatarPath({ writerSlug: nextSlug, originalName: req.file.originalname });
    const saved = await storageService.uploadFile(req.file.buffer, destPath, req.file.mimetype);
    fields.avatarUrl = saved.url;
    fields.avatarPath = saved.path;
  }

  const updated = await firestoreService.updateWriter(writer.id, fields);
  const novels = await firestoreService.listNovelsByWriter(writer.id);
  res.json({ writer: publicWriter(updated, novels.length) });
}

export async function deleteWriter(req, res) {
  const writer = await firestoreService.getWriterById(req.params.id);

  if (!writer) {
    res.status(404).json({ message: 'Writer not found.' });
    return;
  }

  const novels = await firestoreService.listNovelsByWriter(writer.id);

  for (const novel of novels) {
    const episodes = await firestoreService.listEpisodesByNovel(novel.id);
    for (const episode of episodes) {
      await storageService.deleteFile(episode.pdfPath);
    }
    await firestoreService.deleteEpisodesByNovel(novel.id);
    await firestoreService.deleteReviewsByNovel(novel.id);
    await firestoreService.deleteNovel(novel.id);
  }

  if (writer.avatarPath) {
    await storageService.deleteFile(writer.avatarPath);
  }

  await firestoreService.deleteWriter(writer.id);
  res.json({ message: 'Writer deleted successfully.' });
}
