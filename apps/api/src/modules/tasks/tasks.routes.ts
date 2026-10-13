import { Router } from 'express'; import * as controller from './tasks.controller.js';
const router = Router();
router.get('/', controller.listTasks); router.post('/', controller.createTask); router.get('/:id', controller.getTask); router.put('/:id', controller.updateTask); router.delete('/:id', controller.deleteTask);
export default router;

