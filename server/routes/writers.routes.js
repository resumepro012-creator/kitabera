import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createWriter,
  deleteWriter,
  getWriterPage,
  listAllWriters,
  updateWriter
} from '../controllers/writers.controller.js';

const router = Router();

// Public
router.get('/writers', asyncHandler(listAllWriters));
router.get('/writers/:slug', asyncHandler(getWriterPage));

// Admin
router.post('/admin/writers', requireAdmin, uploadAvatar.single('avatar'), asyncHandler(createWriter));
router.put('/admin/writers/:id', requireAdmin, uploadAvatar.single('avatar'), asyncHandler(updateWriter));
router.delete('/admin/writers/:id', requireAdmin, asyncHandler(deleteWriter));

export default router;
