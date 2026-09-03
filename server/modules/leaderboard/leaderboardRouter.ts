import express, { Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { AuthenticatedRequest } from '../../auth/authMiddleware.js';

export function createLeaderboardRouter(db: IRepository) {
  const router = express.Router();

  /**
   * GET /api/ioe/leaderboard
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const round = req.query.round ? parseInt(req.query.round as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const competitionLevel = (req.query.competitionLevel || req.query.level) as string | undefined;

      const entries = await db.getLeaderboard({ grade, round, limit, competitionLevel });
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: 'LEADERBOARD_FAILED', message: err.message });
    }
  });

  return router;
}
