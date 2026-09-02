import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { SqliteAdapter } from './server/database/sqliteAdapter.js';
import { createAuthMiddleware, rateLimiter } from './server/auth/authMiddleware.js';
import { LocalFileSystemMediaStorage } from './server/media/mediaStorage.js';
import { createMediaRouter } from './server/media/mediaRouter.js';
import { createUserRouter } from './server/modules/users/userRouter.js';
import { createQuestionBankRouter } from './server/modules/question-bank/questionRouter.js';
import { createQuestionFactoryRouter } from './server/modules/question-factory/questionFactoryRouter.js';
import { createBlueprintRouter } from './server/modules/exam-blueprints/blueprintRouter.js';
import { createAttemptRouter } from './server/modules/attempts/attemptRouter.js';
import { createLeaderboardRouter } from './server/modules/leaderboard/leaderboardRouter.js';
import { createPostRouter } from './server/modules/cms/postRouter.js';
import { createDocumentRouter } from './server/modules/cms/documentRouter.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite Database Repository & Local Media Storage
  const db = new SqliteAdapter();
  const mediaStorage = new LocalFileSystemMediaStorage();

  // Basic security, parsing & rate limiting
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimiter(300, 60 * 1000));
  app.use(createAuthMiddleware(db));

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'IOE Master Exam Engine',
      storage: 'sqlite-wal',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Domain Module APIs
  const postRouter = createPostRouter(db);
  const docRouter = createDocumentRouter(db);

  app.use('/api/media', createMediaRouter(mediaStorage));
  app.use('/api/users', createUserRouter(db));
  app.use('/api/content/posts', postRouter);
  app.use('/api/content/documents', docRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/documents', docRouter);
  app.use('/api/ioe/questions', createQuestionBankRouter(db));
  app.use('/api/ioe/factory', createQuestionFactoryRouter(db));
  app.use('/api/ioe/blueprints', createBlueprintRouter(db));
  app.use('/api/ioe/attempts', createAttemptRouter(db));
  app.use('/api/ioe/leaderboard', createLeaderboardRouter(db));

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production: look for dist/client first, then dist
    let clientDistPath = path.join(process.cwd(), 'dist', 'client');
    if (!require('fs').existsSync(clientDistPath)) {
      clientDistPath = path.join(process.cwd(), 'dist');
    }
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IOE Master Engine] Server running at http://localhost:${PORT}`);
  });
}

startServer();
