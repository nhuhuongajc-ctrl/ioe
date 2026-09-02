import express, { Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { requireRole, AuthenticatedRequest } from '../../auth/authMiddleware.js';
import { ExamBlueprint } from '../../../src/shared/types/ioe.js';
import { AuditLogger } from '../../security/auditLogger.js';

export function createBlueprintRouter(db: IRepository) {
  const router = express.Router();
  const auditLogger = new AuditLogger(db);

  /**
   * GET /api/ioe/blueprints
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const list = await db.listBlueprints(grade);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/blueprints/:id
   */
  router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const blueprint = await db.getBlueprintById(req.params.id);
      if (!blueprint) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy ma trận đề thi.' });
      }
      res.json(blueprint);
    } catch (err: any) {
      res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/blueprints (Staff only)
   */
  router.post('/', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body;
      const bp: ExamBlueprint = {
        id: body.id || `bp-custom-${Date.now()}`,
        title: body.title || 'Đề thi tùy chỉnh',
        description: body.description || '',
        grade: Number(body.grade) || 5,
        competitionLevel: body.competitionLevel || 'school',
        isOfficialMock: Boolean(body.isOfficialMock),
        durationMinutes: Number(body.durationMinutes) || 30,
        totalQuestions: Number(body.totalQuestions) || (body.grade <= 2 ? 100 : 200),
        skillDistribution: body.skillDistribution || {
          vocabulary: 50,
          grammar: 50,
          reading: 50,
          listening: 50
        },
        difficultyDistribution: body.difficultyDistribution || { 1: 50, 2: 90, 3: 50, 4: 10 },
        topicConstraints: body.topicConstraints,
        createdAt: new Date().toISOString()
      };

      const saved = await db.saveBlueprint(bp);

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'CREATE_BLUEPRINT',
        resourceType: 'blueprint',
        resourceId: saved.id,
        details: { title: saved.title, grade: saved.grade }
      });

      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: 'CREATE_FAILED', message: err.message });
    }
  });

  return router;
}
