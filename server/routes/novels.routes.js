import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createNovelOrEpisode,
  deleteNovel,
  getAdminLibrary,
  getLibrary,
  getNovel,
  getPopularNovels,
  updateNovel
} from '../controllers/novels.controller.js';

const router = Router();

// Public
router.get('/library', asyncHandler(getLibrary));
router.get('/novels/:id', asyncHandler(getNovel));
router.get('/popular-novels', asyncHandler(getPopularNovels));

// Admin
router.get('/admin/library', requireAdmin, asyncHandler(getAdminLibrary));
router.post('/admin/novels', requireAdmin, uploadPdf.single('pdf'), asyncHandler(createNovelOrEpisode));
router.put('/admin/novels/:id', requireAdmin, asyncHandler(updateNovel));
router.delete('/admin/novels/:id', requireAdmin, asyncHandler(deleteNovel));

export default router;
