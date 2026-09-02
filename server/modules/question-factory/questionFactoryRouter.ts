import express, { Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { requireRole, AuthenticatedRequest } from '../../auth/authMiddleware.js';
import { geminiQuestionGenerator } from '../../integrations/ai/geminiQuestionGenerator.js';
import { lexicalService } from '../../integrations/lexical/lexicalService.js';
import { imageProvider } from '../../integrations/images/imageProvider.js';
import { IOEQuestion } from '../../../src/shared/types/ioe.js';
import { AuditLogger } from '../../security/auditLogger.js';

export function createQuestionFactoryRouter(db: IRepository) {
  const router = express.Router();
  const auditLogger = new AuditLogger(db);

  /**
   * POST /api/ioe/factory/generate
   * Generate draft questions with AI
   */
  router.post('/generate', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { grade, skill, topic, count, difficulty, interactionFamily, interactionSubtype, keywords } = req.body;

      if (!grade || !skill || !topic) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Vui lòng cung cấp grade, skill và topic.' });
      }

      const drafts = await geminiQuestionGenerator.generateDraftQuestions({
        grade: Number(grade),
        skill,
        topic,
        count: Math.min(Number(count) || 3, 10),
        difficulty: Number(difficulty) || 2 as any,
        interactionFamily,
        interactionSubtype,
        keywords
      });

      // Save drafts to repository as 'review_required' (never approved automatically)
      for (const draft of drafts) {
        await db.saveQuestion(draft);
      }

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'CREATE_QUESTION',
        resourceType: 'question',
        resourceId: 'ai-batch',
        details: { count: drafts.length, grade, skill, topic }
      });

      res.json({
        success: true,
        count: drafts.length,
        items: drafts
      });
    } catch (err: any) {
      res.status(500).json({ error: 'GENERATE_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/factory/validate
   */
  router.post('/validate', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const question: IOEQuestion = req.body;
      const issues: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = [];

      // 1. Schema check
      if (!question.prompt || question.prompt.trim().length === 0) {
        issues.push({ field: 'prompt', message: 'Nội dung câu hỏi (prompt) không được để trống.', severity: 'error' });
      }
      if (!question.grade || question.grade < 1 || question.grade > 12) {
        issues.push({ field: 'grade', message: 'Khối lớp phải từ 1 đến 12.', severity: 'error' });
      }
      if (!question.skill) {
        issues.push({ field: 'skill', message: 'Kỹ năng (skill) không hợp lệ.', severity: 'error' });
      }

      // 2. Interaction check
      const fam = question.interaction?.family;
      if (fam === 'choice') {
        if (!question.options || question.options.length < 2) {
          issues.push({ field: 'options', message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 phương án.', severity: 'error' });
        }
        if (!question.answer?.correctOptionId) {
          issues.push({ field: 'answer.correctOptionId', message: 'Phải chọn 1 đáp án đúng cho câu hỏi trắc nghiệm.', severity: 'error' });
        }
      } else if (fam === 'text-entry') {
        if (!question.answer?.acceptedAnswers || question.answer.acceptedAnswers.length === 0) {
          issues.push({ field: 'answer.acceptedAnswers', message: 'Phải có ít nhất 1 đáp án được chấp nhận (accepted answer).', severity: 'error' });
        }
      } else if (fam === 'ordering') {
        if (!question.tokens || question.tokens.length < 2) {
          issues.push({ field: 'tokens', message: 'Câu hỏi sắp xếp phải có ít nhất 2 từ/cụm từ.', severity: 'error' });
        }
        if (!question.answer?.orderedTokenIds || question.answer.orderedTokenIds.length === 0) {
          issues.push({ field: 'answer.orderedTokenIds', message: 'Chưa chỉ định thứ tự đúng của các tokens.', severity: 'error' });
        }
      }

      // 3. Explanation check
      if (!question.answer?.explanation || question.answer.explanation.trim().length < 5) {
        issues.push({ field: 'explanation', message: 'Cần có giải thích chi tiết đáp án để học sinh hiểu bài.', severity: 'warning' });
      }

      const isValid = issues.filter(i => i.severity === 'error').length === 0;

      res.json({
        isValid,
        issues
      });
    } catch (err: any) {
      res.status(500).json({ error: 'VALIDATION_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/factory/approve/:id
   * Teacher approves question into active bank
   */
  router.post('/approve/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const existing = await db.getQuestionById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy câu hỏi.' });
      }

      const updated = await db.updateQuestion(req.params.id, {
        qualityStatus: 'approved',
        approvedBy: req.user?.displayName || 'Teacher'
      });

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'APPROVE_QUESTION',
        resourceType: 'question',
        resourceId: req.params.id
      });

      res.json({ success: true, item: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'APPROVE_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/factory/reject/:id
   */
  router.post('/reject/:id', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = await db.updateQuestion(req.params.id, {
        qualityStatus: 'retired'
      });

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'UPDATE_QUESTION',
        resourceType: 'question',
        resourceId: req.params.id,
        details: { status: 'retired' }
      });

      res.json({ success: true, item: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'REJECT_FAILED', message: err.message });
    }
  });

  /**
   * POST /api/ioe/factory/import-json
   */
  router.post('/import-json', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'INVALID_DATA', message: 'Danh sách câu hỏi không hợp lệ.' });
      }

      const imported: IOEQuestion[] = [];
      for (const item of items) {
        const question: IOEQuestion = {
          id: item.id || `ioe-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          version: 1,
          grade: Number(item.grade) || 5,
          cefrLevel: item.cefrLevel || 'A1',
          skill: item.skill || 'vocabulary',
          topic: item.topic || 'General Topic',
          grammarPoint: item.grammarPoint || undefined,
          difficulty: Number(item.difficulty) || 2 as any,
          interaction: item.interaction || {
            family: 'choice',
            subtype: 'single',
            variant: 'text-options'
          },
          prompt: item.prompt || '',
          passage: item.passage || undefined,
          options: item.options || undefined,
          tokens: item.tokens || undefined,
          matchingPairs: item.matchingPairs || undefined,
          missingLetterPattern: item.missingLetterPattern || undefined,
          audioUrl: item.audioUrl || undefined,
          imageUrl: item.imageUrl || undefined,
          answer: item.answer || {
            correctOptionId: item.correctOptionId || 'opt-a',
            explanation: item.explanation || '',
            vietnameseMeaning: item.vietnameseMeaning || ''
          },
          source: item.source || {
            provider: 'manual',
            license: 'Teacher-Import',
            provenance: 'Bulk JSON Import'
          },
          qualityStatus: 'approved',
          statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvedBy: req.user?.displayName || 'Teacher'
        };

        await db.saveQuestion(question);
        imported.push(question);
      }

      await auditLogger.log({
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'CREATE_QUESTION',
        resourceType: 'question',
        resourceId: 'bulk-json-import',
        details: { count: imported.length }
      });

      res.json({
        success: true,
        count: imported.length,
        items: imported
      });
    } catch (err: any) {
      res.status(500).json({ error: 'IMPORT_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/factory/lexical/search
   */
  router.get('/lexical/search', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const q = req.query.q as string;
      const type = (req.query.type as any) || 'synonyms';
      if (!q) return res.json([]);

      const [datamuseResults, dictDef, tatoebaSentences] = await Promise.all([
        lexicalService.getDatamuseWords(q, type),
        lexicalService.getDictionaryDefinition(q),
        lexicalService.getTatoebaExamples(q)
      ]);

      res.json({
        word: q,
        datamuse: datamuseResults,
        dictionary: dictDef,
        tatoeba: tatoebaSentences
      });
    } catch (err: any) {
      res.status(500).json({ error: 'LEXICAL_FAILED', message: err.message });
    }
  });

  /**
   * GET /api/ioe/factory/images/search
   */
  router.get('/images/search', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.json([]);
      const results = await imageProvider.searchImages(q);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'IMAGE_SEARCH_FAILED', message: err.message });
    }
  });

  return router;
}
