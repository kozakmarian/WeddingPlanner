import { Router } from 'express'; import * as controller from './budget.controller.js';
const router = Router();
router.get('/', controller.listBudgetItems); router.post('/', controller.createBudgetItem); router.get('/:id', controller.getBudgetItem); router.put('/:id', controller.updateBudgetItem); router.delete('/:id', controller.deleteBudgetItem);
export default router;

