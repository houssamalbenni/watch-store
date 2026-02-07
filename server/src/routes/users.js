import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as ctrl from '../controllers/userController.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', ctrl.getUsers);
router.patch('/:id/role', ctrl.updateUserRole);
router.delete('/:id', ctrl.deleteUser);

export default router;
