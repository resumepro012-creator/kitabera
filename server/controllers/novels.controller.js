import * as firestoreService from '../services/firestore.service.js';
import {
  isValidCategory,
  isValidSubcategory,
  mapReviewForApi,
  NOVEL_CATEGORY_RULES,
  normalizeKey,
  novelSlugFromTitle
} from '../utils/helpers.js';
import * as uploadController from './upload.controller.js';
import { addEpisodeToNovel, createNovelWithUpload } from './episodes.controller.js';

function publicNovel(novel, _episodes) {
  return {
    id: novel.id,
    title: novel.title,
    summary: novel.summary,
    novelSlug: novel.novelSlug,
    writerId: novel.writerId,
    writerSlug: novel.writerSlug,
    category: novel.category || '',
    subcategory: novel.subcategory || '',
    status: novel.status || 'ongoing',
    views: novel.views || 0,
    likes: novel.likes || 0,
    bookmarks: novel.bookmarks || 0,
    averageRating: novel.averageRating || 0,
    reviewCount: novel.reviewCount || 0,
    episodeCount: novel.episodeCount || 0,
    fileUrl: novel.fileUrl || '',
    coverUrl: novel.coverUrl || '',
    coverPath: novel.coverPath || '',
    createdAt: novel.createdAt,
    updatedAt: novel.updatedAt
  };
}

export async function getLibrary(req, res, next) {
  try {
    const [writers, novels] = await Promise.all([
      firestoreService.getAllWriters(),
      firestoreService.getAllNovels()
    ]);

    const writerMap = new Map(writers.map((writer) => [writer.id, writer]));
    const payload = [];

    for (const novel of novels) {
      const writer = writerMap.get(novel.writerId);

      if (!writer) {
        continue;
      }

      payload.push({
        ...publicNovel(novel),
        writer: {
          id: writer.id,
          name: writer.name,
          slug: writer.slug
        }
      });
    }

    payload.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    res.json({ novels: payload });
  } catch (error) {
    next(error);
  }
}

export async function getNovel(req, res, next) {
  try {
    const novelId = req.params.id;
    await firestoreService.incrementNovelViews(novelId);
    const novel = await firestoreService.getNovel(novelId);

    if (!novel) {
      res.status(404).json({ message: 'Novel not found.' });
      return;
    }

    const [writer, episodes, reviews] = await Promise.all([
      firestoreService.getWriter(novel.writerId),
      firestoreService.getEpisodesByNovelId(novel.id),
      firestoreService.getReviewsByNovelId(novel.id)
    ]);

    res.json({
      novel: {
        ...publicNovel(novel),
        episodes,
        reviews: reviews.map(mapReviewForApi),
        writer: writer ? { id: writer.id, name: writer.name, slug: writer.slug } : null
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getPopularNovels(req, res, next) {
  try {
    const novels = await firestoreService.getAllNovels();
    const popularNovels = novels
      .filter((novel) => (novel.averageRating || 0) >= 3)
      .map((novel) => publicNovel(novel))
      .sort((left, right) => (right.averageRating || 0) - (left.averageRating || 0));

    res.json({ novels: popularNovels });
  } catch (error) {
    next(error);
  }
}

export async function getAdminLibrary(req, res, next) {
  try {
    const writers = await firestoreService.getAllWriters();
    const writersWithNovels = await Promise.all(
      writers.map(async (writer) => {
        const novels = await firestoreService.listNovelsByWriter(writer.id);
        const novelsWithDetails = await Promise.all(
          novels.map(async (novel) => {
            const [reviews, episodes] = await Promise.all([
              firestoreService.listReviewsByNovel(novel.id),
              firestoreService.listEpisodesByNovel(novel.id)
            ]);
            return {
              ...publicNovel(novel),
              reviews,
              episodes,
              averageRating: novel.averageRating || 0
            };
          })
        );
        return {
          ...writer,
          novels: novelsWithDetails
        };
      })
    );
    res.json({ writers: writersWithNovels });
  } catch (error) {
    next(error);
  }
}

export async function createNovel(req, res, next) {
  try {
    const writerId = String(req.body?.writerId || '').trim();
    const novelId = String(req.body?.novelId || '').trim();
    const title = String(req.body?.title || '').trim();
    const summary = String(req.body?.summary || '').trim();
    const category = normalizeKey(req.body?.category);
    const subcategory = normalizeKey(req.body?.subcategory);
    const episodeTitle = String(req.body?.episodeTitle || '').trim();

    if (!writerId) {
      res.status(400).json({ message: 'Writer is required.' });
      return;
    }

    if (!title) {
      res.status(400).json({ message: 'Novel title is required.' });
      return;
    }

    if (!isValidCategory(category)) {
      res.status(400).json({ message: 'A valid category is required.' });
      return;
    }

    if (!isValidSubcategory(category, subcategory)) {
      if ((NOVEL_CATEGORY_RULES[category] || []).length === 0) {
        res.status(400).json({ message: 'Selected category does not use a subcategory.' });
        return;
      }

      res.status(400).json({ message: 'A valid subcategory is required for this category.' });
      return;
    }

    if (!req.file && !(subcategory === 'episodic-novel' && !novelId)) {
      res.status(400).json({ message: 'PDF file is required.' });
      return;
    }

    const writer = await firestoreService.getWriter(writerId);

    if (!writer) {
      res.status(404).json({ message: 'Selected writer does not exist.' });
      return;
    }

    if (novelId) {
      const novel = await addEpisodeToNovel({
        novelId,
        writerId,
        writerSlug: writer.slug,
        file: req.file,
        episodeTitle
      });

      res.status(201).json({ novel });
      return;
    }

    const novel = await createNovelWithUpload({
      writerId,
      writerSlug: writer.slug,
      title,
      summary,
      category,
      subcategory,
      file: req.file,
      episodeTitle
    });

    res.status(201).json({ novel });
  } catch (error) {
    next(error);
  }
}

// Alias for the route
export const createNovelOrEpisode = createNovel;

export async function updateNovel(req, res, next) {
  try {
    const novel = await firestoreService.getNovel(req.params.id);

    if (!novel) {
      res.status(404).json({ message: 'Novel not found.' });
      return;
    }

    const title = String(req.body?.title ?? novel.title).trim();
    const summary = String(req.body?.summary ?? novel.summary).trim();
    const category = normalizeKey(req.body?.category ?? novel.category);
    const subcategory = normalizeKey(req.body?.subcategory ?? novel.subcategory);

    if (!title) {
      res.status(400).json({ message: 'Novel title is required.' });
      return;
    }

    if (!isValidCategory(category)) {
      res.status(400).json({ message: 'A valid category is required.' });
      return;
    }

    if (!isValidSubcategory(category, subcategory)) {
      if ((NOVEL_CATEGORY_RULES[category] || []).length === 0) {
        res.status(400).json({ message: 'Selected category does not use a subcategory.' });
        return;
      }

      res.status(400).json({ message: 'A valid subcategory is required for this category.' });
      return;
    }

    const writer = await firestoreService.getWriter(novel.writerId);
    const oldSlug = novel.novelSlug || novelSlugFromTitle(novel.title);
    const newSlug = novelSlugFromTitle(title);

    if (writer && oldSlug !== newSlug && novel.subcategory === 'episodic-novel' && subcategory === 'episodic-novel') {
      const episodes = await firestoreService.getEpisodesByNovelId(novel.id);

      for (const episode of episodes) {
        if (!episode.pdfUrl || !req.file) {
          continue;
        }
      }
    }

    const updatedNovel = await firestoreService.updateNovel(novel.id, {
      title,
      novelSlug: newSlug,
      summary: summary || novel.summary,
      category,
      subcategory
    });

    const episodes = await firestoreService.getEpisodesByNovelId(novel.id);
    res.json({ novel: publicNovel(updatedNovel, episodes) });
  } catch (error) {
    next(error);
  }
}

export async function deleteNovel(req, res, next) {
  try {
    console.log("deleteNovel: starting, novelId:", req.params.id);
    const novel = await firestoreService.getNovel(req.params.id);
    console.log("deleteNovel: got novel:", novel);

    if (!novel) {
      res.status(404).json({ message: 'Novel not found.' });
      return;
    }

    const writer = await firestoreService.getWriter(novel.writerId);
    console.log("deleteNovel: got writer:", writer);
    const episodes = await firestoreService.getEpisodesByNovelId(novel.id);
    console.log("deleteNovel: got episodes:", episodes);
    const novelSlug = novel.novelSlug || novelSlugFromTitle(novel.title);
    console.log("deleteNovel: novelSlug:", novelSlug);

    if (writer) {
      console.log("deleteNovel: removing files");
      await uploadController.removeNovelFiles(writer.slug, novelSlug, episodes);
      console.log("deleteNovel: files removed");
    }

    console.log("deleteNovel: deleting reviews");
    await firestoreService.deleteReviewsByNovelId(novel.id);
    console.log("deleteNovel: deleting episodes");
    await firestoreService.deleteEpisodesByNovelId(novel.id);
    console.log("deleteNovel: deleting novel");
    await firestoreService.deleteNovel(novel.id);
    console.log("deleteNovel: done");

    res.json({ message: 'Novel deleted successfully.' });
  } catch (error) {
    console.error("deleteNovel: error:", error);
    next(error);
  }
}
