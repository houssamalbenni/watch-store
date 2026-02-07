import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Ensure uploads directory exists ──
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Try Cloudinary, fall back to local disk ──
let storage;
let useCloudinary = false;

try {
  if (
    config.cloudinary.cloudName &&
    config.cloudinary.cloudName !== 'your_cloud_name' &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiKey !== 'your_api_key'
  ) {
    const { default: cloudinary } = await import('../config/cloudinary.js');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'sa3ati',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
    });
    useCloudinary = true;
    console.log('📷 Upload: using Cloudinary');
  } else {
    throw new Error('Cloudinary not configured');
  }
} catch {
  // Local disk storage fallback
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });
  console.log('📷 Upload: using local disk storage (uploads/)');
}

// File filter — only images
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/** POST /api/upload  (admin) — upload multiple images */
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let urls;
    if (useCloudinary) {
      urls = req.files.map((f) => f.path);
    } else {
      // Build full URL for local files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      urls = req.files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    }

    res.json({ urls });
  } catch (err) {
    next(err);
  }
};

export { upload, uploadImages };
