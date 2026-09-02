import { Router, Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { AuthenticatedRequest, requireRole, optionalAuth } from '../../auth/authMiddleware.js';
import { Post, PostCategory, ContentStatus } from '../../../src/shared/types/content.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createPostRouter(db: IRepository): Router {
  const router = Router();

  // ================= PUBLIC ROUTES =================

  // GET /api/content/posts - Public list of published posts
  router.get('/', async (req, res) => {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const category = req.query.category as PostCategory | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : 20;
      const page = req.query.page ? Math.max(parseInt(req.query.page as string, 10), 1) : 1;
      const offset = (page - 1) * limit;

      const result = await db.queryPosts({
        grade,
        category,
        status: 'published',
        search,
        limit,
        offset
      });

      // Exclude full markdown content on public list to optimize payload
      const sanitizedItems = result.items.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        summary: p.summary || p.excerpt || '',
        coverMediaId: p.coverMediaId,
        authorUid: p.authorUid,
        authorName: p.authorName,
        authorRole: p.authorRole,
        grade: p.grade,
        category: p.category,
        tags: p.tags,
        status: p.status,
        publishedAt: p.publishedAt,
        viewCount: p.viewCount || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

      return res.json({
        success: true,
        items: sanitizedItems,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err: any) {
      console.error('[PostRouter] Public list error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // GET /api/content/posts/:slug - Public single post by slug (or ID)
  router.get('/:slug', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { slug } = req.params;
      let post = await db.getPostBySlug(slug);
      if (!post) {
        post = await db.getPostById(slug);
      }

      if (!post) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }

      // If not published, only author or admin can view
      if (post.status !== 'published') {
        const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
        const isAuthor = req.user?.id && (post.authorUid === req.user.id || post.authorId === req.user.id);
        if (!isSuperAdmin && !isAuthor) {
          return res.status(403).json({ error: 'FORBIDDEN', message: 'Bài viết này chưa được xuất bản hoặc đã được lưu trữ' });
        }
      }

      // Increment view asynchronously
      db.incrementPostViews(post.id).catch(e => console.warn('[PostRouter] Inc views error:', e));

      return res.json({
        success: true,
        post
      });
    } catch (err: any) {
      console.error('[PostRouter] Get single error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // ================= ADMIN / TEACHER PROTECTED ROUTES =================

  // GET /api/content/admin/posts - Teacher / SuperAdmin management list
  router.get('/admin/list', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const status = req.query.status as ContentStatus | undefined;
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const category = req.query.category as PostCategory | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : 50;
      const page = req.query.page ? Math.max(parseInt(req.query.page as string, 10), 1) : 1;
      const offset = (page - 1) * limit;

      // Teacher can only see their own posts
      const authorUid = isSuperAdmin ? undefined : req.user?.id;

      const result = await db.queryPosts({
        authorUid,
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
      console.error('[PostRouter] Admin list error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // POST /api/content/posts - Create new post (Teacher / SuperAdmin)
  router.post('/', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body;
      if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Tiêu đề bài viết không được để trống' });
      }
      if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nội dung bài viết không được để trống' });
      }

      let generatedSlug = body.slug ? slugify(body.slug) : slugify(body.title);
      if (!generatedSlug) {
        generatedSlug = `post-${Date.now()}`;
      }

      // Ensure slug uniqueness
      const existingSlug = await db.getPostBySlug(generatedSlug);
      if (existingSlug) {
        generatedSlug = `${generatedSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const status: ContentStatus = body.status === 'published' ? 'published' : 'draft';
      const now = new Date().toISOString();
      const summary = body.summary?.trim() || body.excerpt?.trim() || body.content.substring(0, 180).replace(/[#*`_\[\]]/g, '').trim() + '...';

      const newPost: Post = {
        id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: body.title.trim(),
        slug: generatedSlug,
        summary,
        excerpt: summary,
        content: body.content,
        coverMediaId: body.coverMediaId || null,
        authorUid: req.user?.id || 'unknown',
        authorId: req.user?.id || 'unknown',
        authorName: req.user?.displayName || 'Giáo viên IOE',
        authorRole: req.user?.role || 'teacher',
        grade: body.grade !== undefined ? parseInt(body.grade, 10) : 0,
        category: body.category || 'guide',
        tags: Array.isArray(body.tags) ? body.tags : [],
        status,
        isPublished: status === 'published',
        publishedAt: status === 'published' ? (body.publishedAt || now) : null,
        viewCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const saved = await db.savePost(newPost);

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'CREATE_POST',
        resourceType: 'post',
        resourceId: saved.id,
        details: { title: saved.title, slug: saved.slug, status: saved.status },
        createdAt: now
      });

      return res.status(201).json({
        success: true,
        post: saved,
        message: status === 'published' ? 'Đã xuất bản bài viết thành công' : 'Đã lưu bản nháp bài viết'
      });
    } catch (err: any) {
      console.error('[PostRouter] Create post error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // PUT /api/content/posts/:id - Edit post (Teacher own only / SuperAdmin all)
  router.put('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await db.getPostById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.authorUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn chỉ có quyền chỉnh sửa bài viết do chính mình tạo' });
      }

      const body = req.body;
      const now = new Date().toISOString();

      let targetSlug = existing.slug;
      if (body.slug && body.slug !== existing.slug) {
        const checkSlug = slugify(body.slug);
        const duplicate = await db.getPostBySlug(checkSlug);
        if (duplicate && duplicate.id !== id) {
          return res.status(400).json({ error: 'SLUG_EXISTS', message: 'Đường dẫn tĩnh (slug) này đã tồn tại, vui lòng chọn đường dẫn khác' });
        }
        targetSlug = checkSlug;
      }

      const status: ContentStatus = body.status || existing.status || 'draft';
      const publishedAt = status === 'published' ? (existing.publishedAt || now) : (status === 'draft' ? null : existing.publishedAt);
      const summary = body.summary || body.excerpt || existing.summary;

      const updated = await db.updatePost(id, {
        title: body.title !== undefined ? body.title.trim() : existing.title,
        slug: targetSlug,
        summary,
        excerpt: summary,
        content: body.content !== undefined ? body.content : existing.content,
        coverMediaId: body.coverMediaId !== undefined ? body.coverMediaId : existing.coverMediaId,
        grade: body.grade !== undefined ? parseInt(body.grade, 10) : existing.grade,
        category: body.category !== undefined ? body.category : existing.category,
        tags: Array.isArray(body.tags) ? body.tags : existing.tags,
        status,
        isPublished: status === 'published',
        publishedAt: publishedAt || undefined,
        updatedAt: now
      });

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'UPDATE_POST',
        resourceType: 'post',
        resourceId: id,
        details: { title: updated?.title, status: updated?.status },
        createdAt: now
      });

      return res.json({
        success: true,
        post: updated,
        message: 'Cập nhật bài viết thành công'
      });
    } catch (err: any) {
      console.error('[PostRouter] Update post error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // PATCH /api/content/posts/:id/status - Change status (draft, published, archived)
  router.patch('/:id/status', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Trạng thái không hợp lệ (cho phép: draft, published, archived)' });
      }

      const existing = await db.getPostById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.authorUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn không có quyền thay đổi trạng thái bài viết này' });
      }

      const updated = await db.setPostStatus(id, status as ContentStatus);

      // Audit Log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: status === 'published' ? 'PUBLISH_POST' : (status === 'archived' ? 'ARCHIVE_POST' : 'UPDATE_POST'),
        resourceType: 'post',
        resourceId: id,
        details: { fromStatus: existing.status, toStatus: status },
        createdAt: new Date().toISOString()
      });

      const messageMap: Record<string, string> = {
        published: 'Đã xuất bản bài viết công khai',
        draft: 'Đã chuyển bài viết về bản nháp',
        archived: 'Đã lưu trữ bài viết'
      };

      return res.json({
        success: true,
        post: updated,
        message: messageMap[status] || 'Cập nhật trạng thái thành công'
      });
    } catch (err: any) {
      console.error('[PostRouter] Status change error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  // DELETE /api/content/posts/:id - Archive or delete post
  router.delete('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await db.getPostById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }

      const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
      const isOwner = (existing.authorUid || existing.authorId) === req.user?.id;

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Bạn chỉ có thể xóa bài viết do chính mình tạo' });
      }

      // As per policy "Archive thay cho delete"
      const hardDelete = req.query.hard === 'true' && isSuperAdmin;
      if (hardDelete) {
        await db.deletePost(id);
      } else {
        await db.setPostStatus(id, 'archived');
      }

      // Audit log
      await db.recordAuditLog({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || 'unknown',
        userEmail: req.user?.email,
        action: 'DELETE_POST',
        resourceType: 'post',
        resourceId: id,
        details: { title: existing.title, mode: hardDelete ? 'hard_delete' : 'archived' },
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: hardDelete ? 'Đã xóa vĩnh viễn bài viết' : 'Đã chuyển bài viết vào kho lưu trữ (Archive)'
      });
    } catch (err: any) {
      console.error('[PostRouter] Delete post error:', err);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  });

  return router;
}
