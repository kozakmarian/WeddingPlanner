import { Router } from 'express';
import { getWedding, updateWedding } from './wedding.controller.js';
import { requireAuth } from '../../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/', getWedding); router.put('/', updateWedding);
export default router;
