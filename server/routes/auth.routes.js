import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/admin/login', asyncHandler(login));

export default router;
