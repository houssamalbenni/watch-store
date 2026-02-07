import { Router } from 'express';
import * as ctrl from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, createOrderSchema, updateOrderStatusSchema } from '../middleware/validate.js';

const router = Router();

// User
router.post('/', authenticate, validate(createOrderSchema), ctrl.createOrder);
router.get('/my', authenticate, ctrl.getMyOrders);
router.get('/stats', authenticate, requireAdmin, ctrl.getStats);

// Admin
router.get('/', authenticate, requireAdmin, ctrl.getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), ctrl.updateOrderStatus);

export default router;
