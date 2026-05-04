import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import config from '../config/index.js';
import { supabase } from '../config/supabase.js';

// ── Store files in memory and push to Supabase Storage ──
const storage = multer.memoryStorage();

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
    const { url, serviceRoleKey, bucket } = config.supabase;
    if (!url || !serviceRoleKey || !bucket) {
      return res.status(500).json({ message: 'Supabase Storage is not configured' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const urls = await Promise.all(
      req.files.map(async (file) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage.from(bucket).upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

        if (error) {
          throw error;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      })
    );

    res.json({ urls });
  } catch (err) {
    next(err);
  }
};

export { upload, uploadImages };
