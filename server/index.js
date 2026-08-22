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

function sanitizeFilename(name) {
  if (!name) return '';
  let clean = String(name).trim();
  clean = clean.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  clean = clean.replace(/\s+/g, ' ');
  clean = clean.replace(/^\.+|\.+$/g, '');
  return clean || 'unnamed';
}

function buildContentDisposition(dispositionType, filename) {
  const safeName = sanitizeFilename(filename);
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, '_');
  const encodedUtf8 = encodeURIComponent(safeName)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `${dispositionType}; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`;
}

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
        success: false,
        message: 'File not found.',
      });
    }

    // downloadFile now returns a Node Buffer directly
    const buffer = await storageService.downloadFile(fileInfo.path);

    let downloadFilename;
    if (fileInfo.title) {
      downloadFilename = fileInfo.title.trim();
      if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
        downloadFilename += '.pdf';
      }
    } else if (fileInfo.originalFilename) {
      downloadFilename = fileInfo.originalFilename;
    } else {
      downloadFilename = filename;
    }

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      buildContentDisposition('attachment', downloadFilename)
    );

    res.setHeader('Content-Length', buffer.length);

    console.log(`Download sending ${buffer.length} bytes for "${downloadFilename}"`);
    return res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    // If storage layer set status (like 404), honor it
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to download file',
    });
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
        success: false,
        message: 'File not found.',
      });
    }

    // downloadFile now returns a Node Buffer directly
    const buffer = await storageService.downloadFile(fileInfo.path);

    let viewFilename;
    if (fileInfo.title) {
      viewFilename = fileInfo.title.trim();
      if (!viewFilename.toLowerCase().endsWith('.pdf')) {
        viewFilename += '.pdf';
      }
    } else if (fileInfo.originalFilename) {
      viewFilename = fileInfo.originalFilename;
    } else {
      viewFilename = filename;
    }

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      buildContentDisposition('inline', viewFilename)
    );

    res.setHeader('Content-Length', buffer.length);

    console.log(`View sending ${buffer.length} bytes for "${viewFilename}"`);
    return res.send(buffer);
  } catch (error) {
    console.error('View PDF error:', error);
    // If storage layer set status (like 404), honor it
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to load file',
    });
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
// Non-API 404 (silent - frontend routes like /admin are on Vercel)
// ===============================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'KitabEra Backend API — Frontend is hosted on Vercel.',
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