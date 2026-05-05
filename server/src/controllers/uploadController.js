import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import config from '../config/index.js';
import { supabase } from '../config/supabase.js';

// ── Store files in memory and push to Supabase Storage ──
const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

const videoFileFilter = (_req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, WebM, and MOV videos are allowed'), false);
  }
};

const uploadImages = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVideos = multer({ storage, fileFilter: videoFileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

/** POST /api/upload  (admin) — upload multiple images */
const uploadImageFiles = async (req, res, next) => {
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
        const filePath = `products/images/${fileName}`;

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

/** POST /api/upload/videos  (admin) — upload multiple videos */
const uploadVideoFiles = async (req, res, next) => {
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
        const filePath = `products/videos/${fileName}`;

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
export { uploadImages, uploadVideos, uploadImageFiles, uploadVideoFiles };
