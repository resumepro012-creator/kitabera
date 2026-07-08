import { Router } from 'express';
import { createReview, listReviews } from '../controllers/reviews.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/novels/:id/reviews', asyncHandler(listReviews));
router.post('/novels/:id/reviews', asyncHandler(createReview));

export default router;
