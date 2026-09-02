import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IRepository } from '../../database/repositoryInterface.js';
import { AuthenticatedRequest, requireRole, optionalAuth } from '../../auth/authMiddleware.js';
import { DocumentItem, DocumentCategory, ContentStatus } from '../../../src/shared/types/content.js';
import { LocalFileSystemMediaStorage } from '../../media/mediaStorage.js';

// Multer in-memory storage so we validate magic bytes & size before disk write
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

const mediaStorage = new LocalFileSystemMediaStorage();

export function createDocumentRouter(db: IRepository): Router {
  const router = Router();

  // ================= PUBLIC ROUTES =================

  // GET /api/content/documents - Public list of published documents
  router.get('/', async (req, res) => {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const category = req.query.category as DocumentCategory | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : 20;
      const page = req.query.page ? Math.max(parseInt(req.query.page as string, 10), 1) : 1;
      const offset = (page - 1) * limit;

      const result = await db.queryDocuments({
        status: 'published',
        grade,
        category,
        search,
        limit,
        offset
      });

      return res.json({
        success: true,
        items: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Public list error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // GET /api/content/documents/:id/download - Stream download by document ID
  router.get('/:id/download', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await db.getDocumentById(id);
      if (!doc) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' });
      }

      // Check publish status
      if (doc.status !== 'published') {
        const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
        const isOwner = req.user?.id && (doc.uploaderUid === req.user.id || doc.authorId === req.user.id);
        if (!isSuperAdmin && !isOwner) {
          return res.status(403).json({ error: 'FORBIDDEN', message: 'Tài liệu này chưa được xuất bản hoặc đã lưu trữ' });
        }
      }

      // Increment downloads asynchronously
      db.incrementDocumentDownloads(id).catch(e => console.warn('[DocRouter] Inc download error:', e));

      // Resolve file path
      let filePath: string | null = doc.storagePath && fs.existsSync(doc.storagePath) ? doc.storagePath : null;
      if (!filePath && doc.storedName) {
        filePath = mediaStorage.getFilePath('documents', doc.storedName);
      }

      if (filePath && fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`);
        res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
        res.setHeader('Content-Length', stat.size);
        const stream = fs.createReadStream(filePath);
        return stream.pipe(res);
      }

      // If stored on external demo URL, redirect or return fileUrl
      if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
        return res.redirect(doc.fileUrl);
      }

      return res.status(404).json({ error: 'FILE_NOT_FOUND', message: 'Tệp tin không tồn tại trên hệ thống lưu trữ' });
    } catch (err: any) {
      console.error('[DocumentRouter] Download error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // GET /api/content/documents/download/:storedName - Direct download by safe storedName
  router.get('/download/:storedName', async (req, res) => {
    try {
      const { storedName } = req.params;
      const filePath = mediaStorage.getFilePath('documents', storedName);

      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tệp tin' });
      }

      const stat = fs.statSync(filePath);
      const ext = path.extname(storedName).toLowerCase();
      const mimeType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(storedName)}"`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stat.size);

      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    } catch (err: any) {
      console.error('[DocumentRouter] Direct download error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // ================= PROTECTED ADMIN / TEACHER ROUTES =================

  // GET /api/content/documents/admin/list - Teacher & SuperAdmin list
  router.get('/admin/list', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const status = req.query.status as ContentStatus | undefined;
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const category = req.query.category as DocumentCategory | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : 50;
      const page = req.query.page ? Math.max(parseInt(req.query.page as string, 10), 1) : 1;
      const offset = (page - 1) * limit;

      // Teacher only gets their own documents
      const uploaderUid = isSuperAdmin ? undefined : req.user?.id;

      const result = await db.queryDocuments({
        uploaderUid,
        status,
        grade,
        category,
        search,
        limit,
        offset
      });

      return res.json({
        success: true,
        items: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Admin list error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // POST /api/content/documents/upload - Multipart File Upload (Teacher / SuperAdmin)
  router.post('/upload', requireRole(['teacher', 'super_admin', 'admin']), upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      const body = req.body;

      if (!file) {
        return res.status(400).json({ error: 'FILE_MISSING', message: 'Vui lòng chọn tệp tài liệu để tải lên' });
      }
      if (!body.title || !body.title.trim()) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Tiêu đề tài liệu không được để trống' });
      }

      // Save file through secure Media Storage (checks magic bytes, extensions, path traversal, size limit)
      const savedMedia = await mediaStorage.saveDocument(file.buffer, file.originalname, file.mimetype);

      const status: ContentStatus = body.status === 'published' ? 'published' : 'published'; // default published on upload or specified
      const now = new Date().toISOString();

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: body.title.trim(),
        description: body.description?.trim() || undefined,
        fileName: savedMedia.fileName,
        storedName: savedMedia.storedName,
        mimeType: savedMedia.mimeType,
        fileSize: savedMedia.fileSize,
        storagePath: savedMedia.storagePath,
        fileUrl: `/api/content/documents/${savedMedia.id}/download`,
        uploaderUid: req.user?.id || 'unknown',
        uploaderName: req.user?.displayName || 'Giáo viên IOE',
        authorId: req.user?.id || 'unknown',
        authorName: req.user?.displayName || 'Giáo viên IOE',
        grade: body.grade !== undefined ? parseInt(body.grade, 10) : 0,
        category: (body.category as DocumentCategory) || 'exam_paper',
        skill: body.skill || 'general',
        status: (body.status as ContentStatus) || 'published',
        downloadCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const savedDoc = await db.saveDocument(newDoc);

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'UPLOAD_DOCUMENT',
        resourceType: 'document',
        resourceId: savedDoc.id,
        details: { title: savedDoc.title, fileName: savedDoc.fileName, fileSize: savedDoc.fileSize, status: savedDoc.status },
        createdAt: now
      });

      return res.status(201).json({
        success: true,
        document: savedDoc,
        message: 'Tải lên tài liệu thành công'
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Upload error:', err);
      return res.status(400).json({ error: 'UPLOAD_ERROR', message: err.message || 'Lỗi khi tải lên tài liệu' });
    }
  });

  // PUT /api/content/documents/:id - Update document info (Teacher own only / SuperAdmin all)
  router.put('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await db.getDocumentById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.uploaderUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn chỉ có thể chỉnh sửa tài liệu do chính mình tải lên' });
      }

      const body = req.body;
      const updated = await db.updateDocument(id, {
        title: body.title !== undefined ? body.title.trim() : existing.title,
        description: body.description !== undefined ? body.description.trim() : existing.description,
        grade: body.grade !== undefined ? parseInt(body.grade, 10) : existing.grade,
        category: body.category !== undefined ? body.category : existing.category,
        skill: body.skill !== undefined ? body.skill : existing.skill,
        status: body.status !== undefined ? body.status : existing.status,
        updatedAt: new Date().toISOString()
      });

      // Audit log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'UPDATE_DOCUMENT',
        resourceType: 'document',
        resourceId: id,
        details: { title: updated?.title, status: updated?.status },
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        document: updated,
        message: 'Cập nhật tài liệu thành công'
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Update doc error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // PATCH /api/content/documents/:id/status - Change status (draft, published, archived)
  router.patch('/:id/status', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Trạng thái không hợp lệ (cho phép: draft, published, archived)' });
      }

      const existing = await db.getDocumentById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.uploaderUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn không có quyền thay đổi trạng thái tài liệu này' });
      }

      const updated = await db.setDocumentStatus(id, status as ContentStatus);

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: status === 'archived' ? 'ARCHIVE_DOCUMENT' : 'UPDATE_DOCUMENT',
        resourceType: 'document',
        resourceId: id,
        details: { fromStatus: existing.status, toStatus: status },
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        document: updated,
        message: status === 'archived' ? 'Đã lưu trữ tài liệu' : (status === 'published' ? 'Đã xuất bản tài liệu' : 'Đã chuyển về bản nháp')
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Status error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // DELETE /api/content/documents/:id - Archive or delete document
  router.delete('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await db.getDocumentById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.uploaderUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn chỉ có thể xóa tài liệu do chính mình tải lên' });
      }

      const hardDelete = req.query.hard === 'true' && isSuperAdmin;
      if (hardDelete) {
        await db.deleteDocument(id);
        if (existing.storedName) {
          await mediaStorage.deleteFile('documents', existing.storedName);
        }
      } else {
        await db.setDocumentStatus(id, 'archived');
      }

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'DELETE_DOCUMENT',
        resourceType: 'document',
        resourceId: id,
        details: { title: existing.title, mode: hardDelete ? 'hard_delete' : 'archived' },
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: hardDelete ? 'Đã xóa vĩnh viễn tài liệu' : 'Đã chuyển tài liệu vào kho lưu trữ (Archive)'
      });
    } catch (err: any) {
      console.error('[DocumentRouter] Delete error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  return router;
}
