import { Router, Request } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Storage directory
const STORAGE_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Upload a file to a bucket
router.post('/:bucket/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { bucket } = req.params;
    const { path: filePath } = req.body;

    if (!req.file || !filePath) {
      return res.status(400).json({ error: 'Missing file or path' });
    }

    // Whitelist buckets
    const allowedBuckets = ['reward-images', 'campaign-images'];
    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket' });
    }

    // Create bucket directory if it doesn't exist
    const bucketDir = path.join(STORAGE_DIR, bucket);
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    // Save file
    const fullPath = path.join(bucketDir, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, req.file.buffer);

    res.json({
      path: filePath,
      fullPath,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Storage upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get a public file
router.get('/:bucket/public/*', async (req, res) => {
  try {
    const { bucket } = req.params;
    const filePath = req.params[0];

    // Whitelist buckets
    const allowedBuckets = ['reward-images', 'campaign-images'];
    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket' });
    }

    const fullPath = path.join(STORAGE_DIR, bucket, filePath);

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    const bucketDir = path.normalize(path.join(STORAGE_DIR, bucket));
    if (!normalizedPath.startsWith(bucketDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(fullPath);
  } catch (error) {
    console.error('Storage retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

export default router;
