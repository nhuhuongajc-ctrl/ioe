import express, { Response } from 'express';
import crypto from 'crypto';
import { IRepository } from '../../database/repositoryInterface.js';
import { AuthenticatedRequest } from '../../auth/authMiddleware.js';
import { gradingService } from '../grading/gradingService.js';
import { generateExamTicket, verifyExamTicket } from '../../security/signedTicket.js';
import { 
  AttemptSnapshot, 
  SanitizedQuestion, 
  IOEQuestion, 
  ExamMode, 
  GameSkinType,
  LeaderboardEntry
} from '../../../src/shared/types/ioe.js';

export function createAttemptRouter(db: IRepository) {
  const router = express.Router();

  /**
   * Helper to sanitize question for student payload (NEVER LEAK ANSWER KEYS)
   */
  function sanitizeQuestion(q: IOEQuestion): SanitizedQuestion {
    return {
      id: q.id,
      version: q.version,
      grade: q.grade,
      skill: q.skill,
      topic: q.topic,
      difficulty: q.difficulty,
      interaction: q.interaction,
      prompt: q.prompt,
      passage: q.passage,
      options: q.options?.map(opt => ({
        id: opt.id,
        label: opt.label,
        text: opt.text,
        imageUrl: opt.imageUrl,
        audioUrl: opt.audioUrl
      })),
      tokens: q.tokens ? [...q.tokens].sort(() => Math.random() - 0.5) : undefined,
      matchingPairs: q.matchingPairs ? q.matchingPairs.map(p => ({
        id: p.id,
        leftId: p.leftId,
        leftText: p.leftText,
        leftImage: p.leftImage,
        rightId: p.rightId,
        rightText: p.rightText,
        rightImage: p.rightImage
      })) : undefined,
      hotspotData: q.hotspotData,
      missingLetterPattern: q.missingLetterPattern,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl
    };
  }

  /**
   * POST /api/ioe/attempts/prepare
   * Prepares attempt, snapshots questions, issues ticket token
   */
  router.post('/prepare', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { 
        blueprintId, 
        grade = 5, 
        mode = 'mock_exam', 
        gameSkin = 'standard',
        skill,
        topic,
        interactionFamily,
        count
      } = req.body;

      const numGrade = Number(grade) || 5;
      const isMockExam = mode === 'mock_exam';

      // Rules: Grade 1-2: 100 questions. Grade 3-9: 200 questions. 30 minutes duration.
      const defaultMockQuestionCount = numGrade <= 2 ? 100 : 200;
      const effectiveCount = count ? Number(count) : (isMockExam ? defaultMockQuestionCount : 20);
      let durationMinutes = isMockExam ? 30 : Math.max(5, Math.round(effectiveCount * 0.5));
      let bpTitle = isMockExam 
        ? `Thi Thử IOE Chuẩn Quốc Gia - Khối ${numGrade} (${defaultMockQuestionCount} câu)` 
        : `Luyện tập IOE Khối ${numGrade}`;

      let targetQuestions: IOEQuestion[] = [];

      if (blueprintId) {
        const bp = await db.getBlueprintById(blueprintId);
        if (bp) {
          durationMinutes = bp.durationMinutes || 30;
          bpTitle = bp.title;
          const targetTotal = bp.totalQuestions || (numGrade <= 2 ? 100 : 200);
          targetQuestions = await db.getRandomQuestionsForExam({
            grade: bp.grade,
            count: targetTotal,
            skillDistribution: bp.skillDistribution,
            difficultyDistribution: bp.difficultyDistribution,
            topicConstraints: bp.topicConstraints
          });
        }
      }

      if (targetQuestions.length === 0) {
        if (isMockExam) {
          targetQuestions = await db.getRandomQuestionsForExam({
            grade: numGrade,
            count: defaultMockQuestionCount
          });
        } else {
          const { items } = await db.queryQuestions({
            grade: numGrade,
            skill: skill || undefined,
            topic: topic || undefined,
            interactionFamily: interactionFamily || undefined,
            qualityStatus: 'approved',
            limit: effectiveCount
          });

          targetQuestions = items;
          if (targetQuestions.length < effectiveCount) {
            targetQuestions = await db.getRandomQuestionsForExam({
              grade: numGrade,
              count: effectiveCount
            });
          }
        }
      }

      const clientRunId = `run-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const ticketToken = generateExamTicket({
        attemptId: clientRunId,
        userId: req.user?.id || 'guest',
        grade: numGrade,
        mode,
        blueprintId
      }, durationMinutes);

      const sanitizedList = targetQuestions.map(q => sanitizeQuestion(q));

      const snapshot: AttemptSnapshot = {
        id: clientRunId,
        ticketToken,
        userId: req.user?.id || 'guest-1',
        userName: req.user?.displayName || 'Học sinh',
        userRole: req.user?.role || 'guest',
        grade: numGrade,
        title: bpTitle,
        durationMinutes,
        blueprintId: blueprintId || undefined,
        mode: mode as ExamMode,
        gameSkin: gameSkin as GameSkinType,
        questions: sanitizedList,
        status: 'prepared',
        serverPreparedAt: Date.now(),
        answers: {}
      };

      await db.saveAttempt(snapshot);

      res.status(201).json({
        attemptId: clientRunId,
        ticketToken,
        mode,
        gameSkin,
        grade: numGrade,
        title: bpTitle,
        durationMinutes,
        totalQuestions: sanitizedList.length,
        questions: sanitizedList
      });
    } catch (err: any) {
      res.status(500).json({ error: 'PREPARE_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/attempts/activate
   */
  router.post('/activate', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { attemptId, ticketToken } = req.body;
      const attempt = await db.getAttemptById(attemptId);

      if (!attempt) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy phiên làm bài.' });
      }

      if (attempt.status === 'submitted') {
        return res.json({ status: 'already_submitted', attemptId });
      }

      let durationMs = (attempt.durationMinutes || 30) * 60 * 1000;
      if (attempt.blueprintId) {
        const bp = await db.getBlueprintById(attempt.blueprintId);
        if (bp && bp.durationMinutes) {
          durationMs = bp.durationMinutes * 60 * 1000;
        }
      }

      const now = Date.now();
      attempt.status = 'in_progress';
      attempt.serverStartedAt = attempt.serverStartedAt || now;
      attempt.serverExpiresAt = attempt.serverStartedAt + durationMs;

      await db.saveAttempt(attempt);

      res.json({
        status: 'in_progress',
        attemptId,
        serverStartedAt: attempt.serverStartedAt,
        serverExpiresAt: attempt.serverExpiresAt,
        remainingSeconds: Math.max(0, Math.floor((attempt.serverExpiresAt - now) / 1000))
      });
    } catch (err: any) {
      res.status(500).json({ error: 'ACTIVATE_FAILED', message: err.message });
    }
  });

  /**
   * PUT /api/ioe/attempts/:id/answers/batch
   * Periodic batch answer saving
   */
  router.put('/:id/answers/batch', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Dữ liệu answers không hợp lệ.' });
      }

      const attempt = await db.getAttemptById(id);
      if (!attempt) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài thi.' });
      }

      if (attempt.status === 'submitted') {
        return res.json({ status: 'already_submitted', message: 'Bài thi đã nộp.' });
      }

      const updated = await db.updateAttemptAnswers(id, answers);
      res.json({ success: true, savedAnswersCount: Object.keys(updated?.answers || {}).length });
    } catch (err: any) {
      res.status(500).json({ error: 'BATCH_SYNC_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/attempts/:id/submit
   * Idempotent Authoritative Submit & Grading
   */
  router.post('/:id/submit', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      const attempt = await db.getAttemptById(id);
      if (!attempt) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài thi.' });
      }

      // Idempotency check
      if (attempt.status === 'submitted') {
        return res.json({
          idempotent: true,
          status: 'submitted',
          finalScore: attempt.finalScore,
          totalPoints: attempt.totalPoints,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          unansweredCount: attempt.unansweredCount,
          gradedResults: attempt.gradedResults,
          submittedAt: attempt.submittedAt
        });
      }

      const mergedAnswers = {
        ...attempt.answers,
        ...(answers || {})
      };

      const fullQuestions: IOEQuestion[] = [];
      for (const sq of attempt.questions) {
        const fullQ = await db.getQuestionById(sq.id);
        if (fullQ) {
          fullQuestions.push(fullQ);
        }
      }

      const gradeOutcome = gradingService.gradeAttempt(fullQuestions, mergedAnswers);

      const submittedAt = Date.now();
      const timeSpentSeconds = attempt.serverStartedAt 
        ? Math.floor((submittedAt - attempt.serverStartedAt) / 1000)
        : 60;

      attempt.status = 'submitted';
      attempt.answers = mergedAnswers;
      attempt.finalScore = gradeOutcome.finalScore;
      attempt.totalPoints = gradeOutcome.totalPoints;
      attempt.correctCount = gradeOutcome.correctCount;
      attempt.incorrectCount = gradeOutcome.incorrectCount;
      attempt.unansweredCount = gradeOutcome.unansweredCount;
      attempt.gradedResults = gradeOutcome.results;
      attempt.submittedAt = submittedAt;

      await db.saveAttempt(attempt);

      const accuracy = gradeOutcome.totalPoints > 0 
        ? Math.round((gradeOutcome.finalScore / gradeOutcome.totalPoints) * 1000) / 10
        : 0;

      const lbEntry: LeaderboardEntry = {
        id: `lb-${Date.now()}-${attempt.id.slice(-4)}`,
        userId: attempt.userId,
        userName: attempt.userName,
        grade: attempt.grade,
        score: gradeOutcome.finalScore,
        maxScore: gradeOutcome.totalPoints,
        accuracy,
        timeSpentSeconds,
        examTitle: attempt.mode === 'mock_exam' ? `Thi thử IOE Khối ${attempt.grade}` : `Luyện tập Khối ${attempt.grade}`,
        completedAt: new Date(submittedAt).toISOString()
      };

      await db.recordLeaderboardEntry(lbEntry);

      res.json({
        idempotent: false,
        status: 'submitted',
        finalScore: attempt.finalScore,
        totalPoints: attempt.totalPoints,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        timeSpentSeconds,
        gradedResults: attempt.gradedResults,
        submittedAt
      });
    } catch (err: any) {
      res.status(500).json({ error: 'SUBMIT_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/attempts/:id
   */
  router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const attempt = await db.getAttemptById(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài thi.' });
      }

      if (attempt.status !== 'submitted') {
        const { gradedResults, ...safeAttempt } = attempt;
        return res.json(safeAttempt);
      }

      res.json(attempt);
    } catch (err: any) {
      res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/attempts/:id/review
   */
  router.get('/:id/review', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const attempt = await db.getAttemptById(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy bài thi.' });
      }

      if (attempt.status !== 'submitted') {
        return res.status(400).json({ 
          error: 'INCOMPLETE_ATTEMPT', 
          message: 'Chỉ có thể xem giải thích và đáp án sau khi đã hoàn thành và nộp bài.' 
        });
      }

      res.json({
        attemptId: attempt.id,
        grade: attempt.grade,
        mode: attempt.mode,
        finalScore: attempt.finalScore,
        totalPoints: attempt.totalPoints,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        submittedAt: attempt.submittedAt,
        gradedResults: attempt.gradedResults
      });
    } catch (err: any) {
      res.status(500).json({ error: 'REVIEW_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/attempts/user/history
   */
  router.get('/user/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'guest-1';
      const history = await db.listUserAttempts(userId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: 'HISTORY_FAILED', message: err.message });
    }
  });

  return router;
}
