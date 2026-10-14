import { Router } from 'express'; import * as controller from './budget.controller.js';
import { requireAuth } from '../../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/', controller.listBudgetItems); router.post('/', controller.createBudgetItem); router.get('/:id', controller.getBudgetItem); router.put('/:id', controller.updateBudgetItem); router.delete('/:id', controller.deleteBudgetItem);
export default router;
