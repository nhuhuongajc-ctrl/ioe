import express, { Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { requireRole, AuthenticatedRequest } from '../../auth/authMiddleware.js';
import { IOESkill, QualityStatus } from '../../../src/shared/types/ioe.js';
import { AuditLogger } from '../../security/auditLogger.js';

export function createQuestionBankRouter(db: IRepository) {
  const router = express.Router();
  const auditLogger = new AuditLogger(db);

  /**
   * GET /api/ioe/questions
   * Query and filter questions
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const skill = req.query.skill as IOESkill | undefined;
      const topic = req.query.topic as string | undefined;
      const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string, 10) : undefined;
      const qualityStatus = req.query.qualityStatus as QualityStatus | undefined;
      const interactionFamily = req.query.interactionFamily as string | undefined;
      const interactionSubtype = req.query.interactionSubtype as string | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const isStaff = req.user && ['teacher', 'super_admin', 'admin'].includes(req.user.role);

      // If student or guest, only return approved questions
      const effectiveQualityStatus = isStaff ? qualityStatus : 'approved';

      const result = await db.queryQuestions({
        grade,
        skill,
        topic,
        difficulty,
        qualityStatus: effectiveQualityStatus,
        interactionFamily,
        interactionSubtype,
        search,
        limit,
        offset
      });

      // Strip answers if not staff
      if (!isStaff) {
        const sanitizedItems = result.items.map(q => {
          const { answer, ...rest } = q;
          return rest;
        });
        return res.json({ items: sanitizedItems, total: result.total });
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'QUERY_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/questions/stats
   */
  router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items } = await db.queryQuestions({ limit: 10000 });
      const stats = {
        totalQuestions: items.length,
        byGrade: {} as Record<number, number>,
        bySkill: {} as Record<string, number>,
        byQualityStatus: {} as Record<string, number>,
        byFamily: {} as Record<string, number>
      };

      for (const q of items) {
        stats.byGrade[q.grade] = (stats.byGrade[q.grade] || 0) + 1;
        stats.bySkill[q.skill] = (stats.bySkill[q.skill] || 0) + 1;
        stats.byQualityStatus[q.qualityStatus] = (stats.byQualityStatus[q.qualityStatus] || 0) + 1;
        stats.byFamily[q.interaction.family] = (stats.byFamily[q.interaction.family] || 0) + 1;
      }

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'STATS_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/questions/:id
   */
  router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const question = await db.getQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy câu hỏi.' });
      }

      const isStaff = req.user && ['teacher', 'super_admin', 'admin'].includes(req.user.role);
      if (!isStaff) {
        const { answer, ...sanitized } = question;
        return res.json(sanitized);
      }

      res.json(question);
    } catch (err: any) {
      res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/questions (Staff only)
   */
  router.post('/', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body;
      const question = {
        ...body,
        id: body.id || `ioe-q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        version: 1,
        qualityStatus: body.qualityStatus || 'approved',
        statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedBy: req.user?.displayName || 'Teacher'
      };

      const saved = await db.saveQuestion(question);

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'CREATE_QUESTION',
        resourceType: 'question',
        resourceId: saved.id,
        details: { grade: saved.grade, skill: saved.skill }
      });

      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: 'CREATE_FAILED', message: err.message });
    }
  });

  /**
   * PUT /api/ioe/questions/:id (Staff only)
   */
  router.put('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = await db.updateQuestion(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy câu hỏi để cập nhật.' });
      }

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'UPDATE_QUESTION',
        resourceType: 'question',
        resourceId: updated.id,
        details: { grade: updated.grade, skill: updated.skill }
      });

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: 'UPDATE_FAILED', message: err.message });
    }
  });

  /**
   * DELETE /api/ioe/questions/:id (Staff only)
   */
  router.delete('/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const success = await db.deleteQuestion(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy câu hỏi để xóa.' });
      }

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'DELETE_QUESTION',
        resourceType: 'question',
        resourceId: req.params.id
      });

      res.json({ success: true, message: 'Đã xóa câu hỏi thành công.' });
    } catch (err: any) {
      res.status(500).json({ error: 'DELETE_FAILED', message: err.message });
    }
  });

  return router;
}
