import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import writersRoutes from './routes/writers.routes.js';
import novelsRoutes from './routes/novels.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';

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

// Serve static files from dist
app.use(express.static(path.join(__dirname, '..', 'dist'), { maxAge: '1d' }));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({ message: error.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Both frontend and backend are running from this single server!`);
});
