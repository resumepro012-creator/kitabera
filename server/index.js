import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import fs from 'fs';
import { readDb, writeDb, publicWriter, publicNovel, slugify } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'kitab-era-local-secret';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kitaberaofficial';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ')65&tk$|';

app.use(cors());
app.use(express.json());
// Cache static files for 1 day to speed up mobile loading
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));

// Endpoint to view file in browser (inline)
app.get('/api/view/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'novels', filename);
  
  // Aggressive headers to force inline display in browser
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Use sendFile with explicit headers
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="'+filename+'"'
    }
  }, (err) => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

// Endpoint to download file with original filename
app.get('/api/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  const db = await readDb();
  
  // Find original filename in novels or episodes
  let originalFilename = filename;
  
  // Check novels
  const novel = db.novels.find(n => n.fileUrl?.includes(filename));
  if (novel?.originalFilename) {
    originalFilename = novel.originalFilename;
  } else {
    // Check episodes
    for (const n of db.novels) {
      if (n.episodes) {
        const ep = n.episodes.find(e => e.fileUrl?.includes(filename));
        if (ep?.originalFilename) {
          originalFilename = ep.originalFilename;
          break;
        }
      }
    }
  }
  
  const filePath = path.join(__dirname, 'uploads', 'novels', filename);
  res.download(filePath, originalFilename, (err) => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

app.use(express.static(path.join(__dirname, '..', 'dist'), { maxAge: '1d' }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'novels');
    // Ensure the directory exists recursively
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  }
});

const upload = multer({ storage });

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
}

app.post('/api/admin/login', async (req, res) => {
  console.log('Login attempt:', {
    received: req.body,
    expected: {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    }
  });
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials.' });
  }
});

app.get('/api/admin/writers', authMiddleware, async (req, res) => {
  const db = await readDb();
  res.json({ writers: db.writers });
});

app.post('/api/admin/writers', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { name, bio } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  const db = await readDb();
  const uniqueSlug = slugify(name);
  let finalSlug = uniqueSlug;
  let counter = 1;
  while (db.writers.some(w => w.slug === finalSlug)) {
    finalSlug = `${uniqueSlug}-${counter}`;
    counter++;
  }

  const newWriter = {
    id: `writer_${randomUUID()}`,
    name,
    slug: finalSlug,
    bio: bio || '',
    avatarUrl: req.file ? `/uploads/novels/${req.file.filename}` : '',
    createdAt: new Date().toISOString()
  };

  db.writers.unshift(newWriter);
  await writeDb(db);
  res.status(201).json({ writer: newWriter });
});

app.put('/api/admin/writers/:id', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { name, bio } = req.body;
  const db = await readDb();
  const writerIndex = db.writers.findIndex(w => w.id === req.params.id);
  if (writerIndex === -1) {
    return res.status(404).json({ message: 'Writer not found.' });
  }

  const currentWriter = db.writers[writerIndex];
  const updatedWriter = {
    ...currentWriter,
    name: name || currentWriter.name,
    bio: bio !== undefined ? bio : currentWriter.bio,
    avatarUrl: req.file ? `/uploads/novels/${req.file.filename}` : currentWriter.avatarUrl,
    updatedAt: new Date().toISOString()
  };

  db.writers[writerIndex] = updatedWriter;
  await writeDb(db);
  res.json({ writer: updatedWriter });
});

app.delete('/api/admin/writers/:id', authMiddleware, async (req, res) => {
  const db = await readDb();
  const writerIndex = db.writers.findIndex(w => w.id === req.params.id);
  if (writerIndex === -1) {
    return res.status(404).json({ message: 'Writer not found.' });
  }

  const writerId = db.writers[writerIndex].id;
  const novelIds = db.novels.filter(n => n.writerId === writerId).map(n => n.id);
  db.novels = db.novels.filter(n => n.writerId !== writerId);
  db.reviews = db.reviews.filter(r => !novelIds.includes(r.novelId));
  db.writers.splice(writerIndex, 1);
  await writeDb(db);
  res.json({ ok: true });
});

app.get('/api/admin/library', authMiddleware, async (req, res) => {
  const db = await readDb();
  const writersWithNovels = db.writers.map(writer => {
    const writerNovels = db.novels.filter(novel => novel.writerId === writer.id).map(novel => {
      const reviews = db.reviews.filter(r => r.novelId === novel.id);
      let averageRating = 0;
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        averageRating = total / reviews.length;
      }
      return {
        ...novel,
        reviews,
        averageRating
      };
    });
    return {
      ...writer,
      novels: writerNovels
    };
  });
  res.json({ writers: writersWithNovels });
});

app.post('/api/admin/novels', authMiddleware, upload.single('pdf'), async (req, res) => {
  console.log('Novel upload request received');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  const { writerId, title, summary, category, subcategory, novelId, episodeTitle } = req.body;
  if (!writerId) {
    return res.status(400).json({ message: 'Writer is required.' });
  }

  const db = await readDb();
  const writer = db.writers.find(w => w.id === writerId);
  if (!writer) {
    return res.status(404).json({ message: 'Writer not found.' });
  }

  // If we're uploading an episode to an existing episodic novel
  if (novelId && subcategory === 'episodic-novel') {
    const novelIndex = db.novels.findIndex(n => n.id === novelId);
    if (novelIndex === -1) {
      return res.status(404).json({ message: 'Novel not found.' });
    }

    const existingNovel = db.novels[novelIndex];
    if (!existingNovel.episodes) {
      existingNovel.episodes = [];
    }

    const newEpisode = {
      id: `episode_${randomUUID()}`,
      title: episodeTitle || `Episode ${existingNovel.episodes.length + 1}`,
      file: req.file.filename,
      fileUrl: `/uploads/novels/${req.file.filename}`,
      originalFilename: req.file.originalname,
      createdAt: new Date().toISOString()
    };

    existingNovel.episodes.push(newEpisode);
    existingNovel.updatedAt = new Date().toISOString();
    db.novels[novelIndex] = existingNovel;
    await writeDb(db);

    return res.status(201).json({ novel: existingNovel, episode: newEpisode });
  }

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  // For non-episodic novels, PDF is required
  if (subcategory !== 'episodic-novel' && !req.file) {
    return res.status(400).json({ message: 'PDF file is required.' });
  }

  const newNovel = {
    id: `novel_${randomUUID()}`,
    writerId,
    writerSlug: writer.slug,
    title,
    slug: slugify(title),
    summary: summary || '',
    category: category || 'islamic',
    subcategory: subcategory || '',
    fileUrl: req.file ? `/uploads/novels/${req.file.filename}` : '',
    originalFilename: req.file ? req.file.originalname : '',
    episodes: subcategory === 'episodic-novel' ? [] : undefined,
    createdAt: new Date().toISOString()
  };

  db.novels.unshift(newNovel);
  await writeDb(db);
  res.status(201).json({ novel: newNovel });
});

app.put('/api/admin/novels/:id', authMiddleware, async (req, res) => {
  const { title, summary, category, subcategory, featured } = req.body;
  const db = await readDb();
  const novelIndex = db.novels.findIndex(n => n.id === req.params.id);
  if (novelIndex === -1) {
    return res.status(404).json({ message: 'Novel not found.' });
  }

  const currentNovel = db.novels[novelIndex];
  const updatedNovel = {
    ...currentNovel,
    title: title || currentNovel.title,
    summary: summary !== undefined ? summary : currentNovel.summary,
    category: category !== undefined ? category : currentNovel.category,
    subcategory: subcategory !== undefined ? subcategory : currentNovel.subcategory,
    featured: featured !== undefined ? featured : currentNovel.featured,
    updatedAt: new Date().toISOString()
  };

  db.novels[novelIndex] = updatedNovel;
  await writeDb(db);
  res.json({ novel: updatedNovel });
});

app.delete('/api/admin/novels/:id', authMiddleware, async (req, res) => {
  const db = await readDb();
  const novelIndex = db.novels.findIndex(n => n.id === req.params.id);
  if (novelIndex === -1) {
    return res.status(404).json({ message: 'Novel not found.' });
  }

  db.reviews = db.reviews.filter(r => r.novelId !== db.novels[novelIndex].id);
  db.novels.splice(novelIndex, 1);
  await writeDb(db);
  res.json({ ok: true });
});

app.get('/api/writers', async (req, res) => {
  const db = await readDb();
  res.json({ writers: db.writers.map(publicWriter) });
});

app.get('/api/writers/:slug', async (req, res) => {
  const db = await readDb();
  const writer = db.writers.find(w => w.slug === req.params.slug);
  if (!writer) {
    return res.status(404).json({ message: 'Writer not found.' });
  }

  const novels = db.novels
    .filter(novel => novel.writerId === writer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(novel => {
      const reviews = db.reviews.filter(r => r.novelId === novel.id);
      let averageRating = 0;
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        averageRating = total / reviews.length;
      }
      return {
        ...publicNovel(novel),
        reviews,
        averageRating
      };
    });

  res.json({ writer: publicWriter(writer), novels });
});

app.get('/api/library', async (req, res) => {
  const db = await readDb();
  const novels = db.novels.map(novel => {
    const reviews = db.reviews.filter(r => r.novelId === novel.id);
    let averageRating = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = total / reviews.length;
    }
    const writer = db.writers.find(w => w.id === novel.writerId);
    return {
      ...publicNovel(novel),
      reviews,
      averageRating,
      writer: writer ? publicWriter(writer) : undefined
    };
  });
  res.json({ writers: db.writers.map(publicWriter), novels });
});

app.get('/api/novels/:id', async (req, res) => {
  const db = await readDb();
  const novel = db.novels.find(n => n.id === req.params.id);
  if (!novel) {
    return res.status(404).json({ message: 'Novel not found.' });
  }

  const reviews = db.reviews.filter(r => r.novelId === novel.id);
  let averageRating = 0;
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = total / reviews.length;
  }
  const writer = db.writers.find(w => w.id === novel.writerId);

  res.json({ 
    novel: publicNovel(novel), 
    reviews, 
    averageRating,
    writer: writer ? publicWriter(writer) : undefined
  });
});

app.get('/api/novels/:id/reviews', async (req, res) => {
  const db = await readDb();
  const reviews = db.reviews.filter(r => r.novelId === req.params.id);
  res.json({ reviews });
});

app.post('/api/novels/:id/reviews', async (req, res) => {
  const { rating, reviewText, reviewerName } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  const db = await readDb();
  const novel = db.novels.find(n => n.id === req.params.id);
  if (!novel) {
    return res.status(404).json({ message: 'Novel not found.' });
  }

  const newReview = {
    id: `review_${randomUUID()}`,
    novelId: req.params.id,
    rating: Number(rating),
    reviewText: reviewText || '',
    reviewerName: reviewerName || 'Anonymous',
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);
  await writeDb(db);
  res.status(201).json({ review: newReview });
});

app.get('/api/popular-novels', async (req, res) => {
  const db = await readDb();
  const novelsWithRatings = db.novels.map(novel => {
    const novelReviews = db.reviews.filter(r => r.novelId === novel.id);
    let averageRating = 0;
    if (novelReviews.length > 0) {
      const total = novelReviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = total / novelReviews.length;
    }
    const writer = db.writers.find(w => w.id === novel.writerId);
    return {
      ...publicNovel(novel),
      reviews: novelReviews,
      averageRating,
      writer: writer ? publicWriter(writer) : undefined
    };
  });

  const popularNovels = novelsWithRatings
    .filter(novel => novel.averageRating >= 3)
    .sort((a, b) => b.averageRating - a.averageRating);

  res.json({ novels: popularNovels });
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`To access on your mobile, find your computer's local IP and use http://[YOUR-IP]:${PORT}`);
  console.log(`Both frontend and backend are running from this single server!`);
});
