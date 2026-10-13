import { Router } from 'express';
import { getWedding, updateWedding } from './wedding.controller.js';
const router = Router();
router.get('/', getWedding); router.put('/', updateWedding);
export default router;

