import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, productSchema, productUpdateSchema } from '../middleware/validate.js';

const router = Router();

// Public
router.get('/filters/available', ctrl.getAvailableFilters);
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProduct);

// Admin only
router.post('/', authenticate, requireAdmin, validate(productSchema), ctrl.createProduct);
router.post('/:id/duplicate', authenticate, requireAdmin, ctrl.duplicateProduct);
router.put('/:id', authenticate, requireAdmin, validate(productUpdateSchema), ctrl.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

export default router;
