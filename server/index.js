import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import writersRoutes from './routes/writers.routes.js';
import novelsRoutes from './routes/novels.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';

import * as firestoreService from './services/firestore.service.js';
import * as storageService from './services/storage.service.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

// ===============================
// Middleware
// ===============================

// Allow requests from frontend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===============================
// Health Check
// ===============================

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KitabEra backend is running!',
  });
});

// ===============================
// Debug Env Vars (Temporary - for Render diagnosis)
// ===============================
app.get('/debug-env', (_req, res) => {
  function mask(value, showLength = true) {
    if (!value) return '❌ MISSING';
    if (showLength) return `✅ SET (length=${value.length})`;
    return `✅ SET (length=${value.length})`;
  }
  const hasFirebasePrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  // Check if private key has valid format markers
  let privateKeyFormat = 'OK';
  if (hasFirebasePrivateKey) {
    if (!process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      privateKeyFormat = '❌ Missing BEGIN marker';
    } else if (!process.env.FIREBASE_PRIVATE_KEY.includes('END PRIVATE KEY')) {
      privateKeyFormat = '❌ Missing END marker';
    } else if (!process.env.FIREBASE_PRIVATE_KEY.includes('\\n') && !process.env.FIREBASE_PRIVATE_KEY.includes('\n')) {
      privateKeyFormat = '⚠️ No newlines detected - may be malformed';
    }
  }
  res.status(200).json({
    success: true,
    env: {
      PORT: process.env.PORT || '❌ MISSING',
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? `✅ SET (${process.env.ADMIN_USERNAME})` : '❌ MISSING',
      ADMIN_PASSWORD: mask(process.env.ADMIN_PASSWORD),
      JWT_SECRET: mask(process.env.JWT_SECRET),
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? `✅ SET (${process.env.FIREBASE_PROJECT_ID})` : '❌ MISSING',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? `✅ SET (${process.env.FIREBASE_CLIENT_EMAIL})` : '❌ MISSING',
      FIREBASE_PRIVATE_KEY: hasFirebasePrivateKey ? `✅ SET (length=${process.env.FIREBASE_PRIVATE_KEY.length}, format=${privateKeyFormat})` : '❌ MISSING',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ? `✅ SET (${process.env.FIREBASE_STORAGE_BUCKET})` : '❌ MISSING',
      SUPABASE_URL: process.env.SUPABASE_URL ? `✅ SET (${process.env.SUPABASE_URL})` : '❌ MISSING',
      SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
      SUPABASE_BUCKET: process.env.SUPABASE_BUCKET ? `✅ SET (${process.env.SUPABASE_BUCKET})` : '❌ MISSING',
    },
  });
});

// ===============================
// API Routes
// ===============================

app.use('/api', authRoutes);
app.use('/api', writersRoutes);
app.use('/api', novelsRoutes);
app.use('/api', reviewsRoutes);

// ===============================
// Download PDF
// ===============================

app.get('/api/download/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;

    console.log('Download request for filename:', filename);

    const fileInfo =
      await firestoreService.findFileByFilename(filename);

    console.log('findFileByFilename result:', fileInfo);

    if (!fileInfo?.path) {
      console.error('File path not found:', fileInfo);

      return res.status(404).json({
        message: 'File not found.',
      });
    }

    const fileData =
      await storageService.downloadFile(fileInfo.path);

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let downloadFilename = fileInfo.originalFilename;

    if (!downloadFilename) {
      if (fileInfo.title) {
        downloadFilename = fileInfo.title.trim();

        if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
          downloadFilename += '.pdf';
        }
      } else {
        downloadFilename = filename;
      }
    }

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadFilename}"`
    );

    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    next(error);
  }
});

// ===============================
// View PDF
// ===============================

app.get('/api/view/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;

    console.log('View request for filename:', filename);

    const fileInfo =
      await firestoreService.findFileByFilename(filename);

    console.log(
      'findFileByFilename result for view:',
      fileInfo
    );

    if (!fileInfo?.path) {
      console.error(
        'File path not found in fileInfo for view:',
        fileInfo
      );

      return res.status(404).json({
        message: 'File not found.',
      });
    }

    const fileData =
      await storageService.downloadFile(fileInfo.path);

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const downloadFilename =
      fileInfo.originalFilename || filename;

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${downloadFilename}"`
    );

    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error('View PDF error:', error);
    next(error);
  }
});

// ===============================
// 404 API Handler
// ===============================

app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((error, _req, res, _next) => {
  console.error('=================================');
  console.error('SERVER ERROR');
  console.error(error);
  console.error('=================================');

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message || 'Internal server error.',
  });
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('KitabEra Backend Started');
  console.log(`Port: ${PORT}`);
  console.log(`Health: /health`);
  console.log('=================================');
});