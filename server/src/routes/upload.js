import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload, uploadImages } from '../controllers/uploadController.js';

const router = Router();

router.post('/', authenticate, requireAdmin, upload.array('images', 10), uploadImages);

export default router;
