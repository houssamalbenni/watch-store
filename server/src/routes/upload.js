import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
	uploadImages,
	uploadVideos,
	uploadImageFiles,
	uploadVideoFiles,
} from '../controllers/uploadController.js';

const router = Router();

router.post('/', authenticate, requireAdmin, uploadImages.array('images', 10), uploadImageFiles);
router.post('/videos', authenticate, requireAdmin, uploadVideos.array('videos', 5), uploadVideoFiles);

export default router;
