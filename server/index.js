import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import writersRoutes from './routes/writers.routes.js';
import novelsRoutes from './routes/novels.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import * as firestoreService from './services/firestore.service.js';
import * as storageService from './services/storage.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api', writersRoutes);
app.use('/api', novelsRoutes);
app.use('/api', reviewsRoutes);

// Download & View Routes
app.get('/api/download/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    console.log('Download request for filename:', filename);
    const fileInfo = await firestoreService.findFileByFilename(filename);
    console.log('findFileByFilename result:', fileInfo);
    if (!fileInfo?.path) {
      console.error('File path not found in fileInfo:', fileInfo);
      res.status(404).json({ message: 'File not found.' });
      return;
    }
    
    const fileData = await storageService.downloadFile(fileInfo.path);
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let downloadFilename = fileInfo.originalFilename;
    if (!downloadFilename) {
      if (fileInfo.title) {
        // Use the title and add .pdf extension if missing
        downloadFilename = fileInfo.title.trim();
        if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
          downloadFilename += '.pdf';
        }
      } else {
        downloadFilename = filename;
      }
    }
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

app.get('/api/view/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    console.log('View request for filename:', filename);
    const fileInfo = await firestoreService.findFileByFilename(filename);
    console.log('findFileByFilename result for view:', fileInfo);
    if (!fileInfo?.path) {
      console.error('File path not found in fileInfo for view:', fileInfo);
      res.status(404).json({ message: 'File not found.' });
      return;
    }
    
    const fileData = await storageService.downloadFile(fileInfo.path);
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const downloadFilename = fileInfo.originalFilename || filename;
    
    // Set headers for viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, '..', 'dist'), { maxAge: '1d' }));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error('Server error:', error);
  console.error('Error stack:', error.stack);
  res.status(500).json({ message: error.message || 'Internal server error', stack: error.stack });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Both frontend and backend are running from this single server!`);
});
