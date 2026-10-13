import { Router } from 'express'; import * as controller from './guests.controller.js';
const router = Router();
router.get('/', controller.listGuests); router.post('/', controller.createGuest); router.get('/:id', controller.getGuest); router.put('/:id', controller.updateGuest); router.delete('/:id', controller.deleteGuest);
export default router;

