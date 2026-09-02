import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IMediaStorage } from './mediaStorage.js';
import { AuthenticatedRequest, requireRole } from '../auth/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images/audio
  }
});

export function createMediaRouter(mediaStorage: IMediaStorage): Router {
  const router = Router();

  // Serve media file (images / audio / documents)
  router.get('/:category/:filename', (req, res: Response) => {
    const { category, filename } = req.params;
    if (category !== 'images' && category !== 'audio' && category !== 'documents') {
      return res.status(400).json({ error: 'INVALID_CATEGORY', message: 'Category must be images, audio or documents' });
    }

    const filePath = mediaStorage.getFilePath(category as 'images' | 'audio' | 'documents', filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'FILE_NOT_FOUND', message: 'Tập tin media không tồn tại' });
    }

    res.sendFile(filePath);
  });

  // Multipart File Upload (Requires Teacher or SuperAdmin)
  router.post('/upload', requireRole(['teacher', 'super_admin', 'admin']), upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.file) {
        const category = (req.body.category as 'images' | 'audio' | 'documents') || 'images';
        const saved = await mediaStorage.saveFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          category
        );
        return res.json({
          success: true,
          media: saved,
          url: saved.url,
          id: saved.id
        });
      }

      // JSON / Base64 fallback upload
      const { category, fileName, base64Data, mimeType } = req.body;
      if (!category || !base64Data) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'Thiếu dữ liệu tệp tải lên' });
      }

      const buffer = Buffer.from(base64Data.replace(/^data:[^;]+;base64,/, ''), 'base64');
      const saved = await mediaStorage.saveFile(
        buffer,
        fileName || 'upload.bin',
        mimeType || 'application/octet-stream',
        category
      );

      return res.json({
        success: true,
        media: saved,
        url: saved.url,
        id: saved.id
      });
    } catch (err: any) {
      console.error('[MediaRouter] Upload error:', err);
      return res.status(400).json({ error: 'UPLOAD_FAILED', message: err.message || 'Lỗi khi tải lên hình ảnh' });
    }
  });

  return router;
}
