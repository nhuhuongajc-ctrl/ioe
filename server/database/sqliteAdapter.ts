import fs from 'fs';
import path from 'path';
import { IRepository, QuestionFilter, MediaRecord } from './repositoryInterface.js';
import { 
  IOEQuestion, 
  ExamBlueprint, 
  AttemptSnapshot, 
  LeaderboardEntry,
  QualityStatus
} from '../../src/shared/types/ioe.js';
import { UserProfile, UserRole } from '../../src/shared/types/user.js';
import { Post, DocumentItem, PostFilter, DocumentFilter } from '../../src/shared/types/content.js';
import { AuditLogEntry } from '../security/auditLogger.js';
import { INITIAL_SEED_QUESTIONS } from '../core/database/seedQuestions.js';
import { INITIAL_SEED_BLUEPRINTS } from '../core/database/seedBlueprints.js';
import { INITIAL_SEED_POSTS, INITIAL_SEED_DOCUMENTS } from '../core/database/seedContent.js';
import { QuestionSynthesizer } from '../core/database/questionSynthesizer.js';
import { SQLITE_SCHEMA_DDL } from './schema.js';

export class SqliteAdapter implements IRepository {
  private dbPath: string;
  private isNativeSqlite = false;
  private sqliteInstance: any = null;

  // Resilient memory cache fallback for zero-dependency environments
  private questionsMap = new Map<string, IOEQuestion>();
  private blueprintsMap = new Map<string, ExamBlueprint>();
  private attemptsMap = new Map<string, AttemptSnapshot>();
  private leaderboardList: LeaderboardEntry[] = [];
  private usersMap = new Map<string, UserProfile>();
  private auditLogsList: AuditLogEntry[] = [];
  private mediaMap = new Map<string, MediaRecord>();
  private postsMap = new Map<string, Post>();
  private documentsMap = new Map<string, DocumentItem>();

  constructor() {
    this.dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'app.sqlite');
    this.init();
  }

  private init() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.warn(`[SQLite] Failed to create directory ${dir}:`, e);
      }
    }

    // Try loading better-sqlite3 dynamically
    try {
      // @ts-ignore
      const Database = require('better-sqlite3');
      this.sqliteInstance = new Database(this.dbPath);
      this.sqliteInstance.pragma('journal_mode = WAL');
      this.sqliteInstance.pragma('synchronous = NORMAL');
      this.sqliteInstance.pragma('foreign_keys = ON');
      this.sqliteInstance.exec(SQLITE_SCHEMA_DDL);
      this.runSchemaMigrations();
      this.isNativeSqlite = true;
      console.log(`[SQLite Engine] Native better-sqlite3 running in WAL mode at: ${this.dbPath}`);
    } catch {
      console.log(`[SQLite Engine] Running file-backed storage (Path: ${this.dbPath})`);
      this.loadFromFileFallback();
    }

    this.ensureInitialData();
  }

  private runSchemaMigrations() {
    if (!this.isNativeSqlite) return;
    try {
      // Check posts columns
      const postCols = (this.sqliteInstance.prepare("PRAGMA table_info(posts)").all() as any[]).map(c => c.name);
      if (!postCols.includes('summary')) {
        this.sqliteInstance.exec("ALTER TABLE posts ADD COLUMN summary TEXT DEFAULT ''");
      }
      if (!postCols.includes('author_uid')) {
        this.sqliteInstance.exec("ALTER TABLE posts ADD COLUMN author_uid TEXT DEFAULT ''");
      }
      if (!postCols.includes('cover_media_id')) {
        this.sqliteInstance.exec("ALTER TABLE posts ADD COLUMN cover_media_id TEXT");
      }
      if (!postCols.includes('status')) {
        this.sqliteInstance.exec("ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'draft'");
      }
      if (!postCols.includes('published_at')) {
        this.sqliteInstance.exec("ALTER TABLE posts ADD COLUMN published_at TEXT");
      }

      // Check documents columns
      const docCols = (this.sqliteInstance.prepare("PRAGMA table_info(documents)").all() as any[]).map(c => c.name);
      if (!docCols.includes('stored_name')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN stored_name TEXT DEFAULT ''");
      }
      if (!docCols.includes('mime_type')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN mime_type TEXT DEFAULT 'application/pdf'");
      }
      if (!docCols.includes('storage_path')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN storage_path TEXT DEFAULT ''");
      }
      if (!docCols.includes('uploader_uid')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN uploader_uid TEXT DEFAULT ''");
      }
      if (!docCols.includes('uploader_name')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN uploader_name TEXT DEFAULT ''");
      }
      if (!docCols.includes('status')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'draft'");
      }
      if (!docCols.includes('updated_at')) {
        this.sqliteInstance.exec("ALTER TABLE documents ADD COLUMN updated_at TEXT DEFAULT ''");
      }
    } catch (err) {
      console.warn('[SQLite Engine] Migration check notice:', err);
    }
  }

  private loadFromFileFallback() {
    const jsonPath = this.dbPath.endsWith('.sqlite') ? this.dbPath.replace('.sqlite', '.json') : `${this.dbPath}.json`;
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.questions) (data.questions as IOEQuestion[]).forEach(q => this.questionsMap.set(q.id, q));
        if (data.blueprints) (data.blueprints as ExamBlueprint[]).forEach(b => this.blueprintsMap.set(b.id, b));
        if (data.attempts) (data.attempts as AttemptSnapshot[]).forEach(a => this.attemptsMap.set(a.id, a));
        if (data.leaderboard) this.leaderboardList = data.leaderboard;
        if (data.users) (data.users as UserProfile[]).forEach(u => this.usersMap.set(u.id, u));
        if (data.auditLogs) this.auditLogsList = data.auditLogs;
        if (data.posts) (data.posts as Post[]).forEach(p => this.postsMap.set(p.id, p));
        if (data.documents) (data.documents as DocumentItem[]).forEach(d => this.documentsMap.set(d.id, d));
      } catch (err) {
        console.warn('[SQLite Engine] Could not read file backup:', err);
      }
    }
  }

  private saveToFileFallback() {
    if (this.isNativeSqlite) return;
    const jsonPath = this.dbPath.endsWith('.sqlite') ? this.dbPath.replace('.sqlite', '.json') : `${this.dbPath}.json`;
    try {
      const data = {
        questions: Array.from(this.questionsMap.values()),
        blueprints: Array.from(this.blueprintsMap.values()),
        attempts: Array.from(this.attemptsMap.values()),
        leaderboard: this.leaderboardList,
        users: Array.from(this.usersMap.values()),
        auditLogs: this.auditLogsList,
        posts: Array.from(this.postsMap.values()),
        documents: Array.from(this.documentsMap.values())
      };
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[SQLite Engine] Save to file error:', err);
    }
  }

  private ensureInitialData() {
    // Only seed if empty (NEVER wipe existing production data)
    if (this.isNativeSqlite) {
      const qCount = this.sqliteInstance.prepare('SELECT count(*) as cnt FROM questions').get() as { cnt: number };
      if (qCount.cnt === 0) {
        console.log('[SQLite Engine] Seeding initial questions and blueprints into database...');
        const insertQ = this.sqliteInstance.prepare(`
          INSERT OR IGNORE INTO questions (
            id, version, grade, cefr_level, skill, topic, difficulty,
            interaction_family, interaction_subtype, prompt, options_json, answer_json,
            tokens_json, matching_pairs_json, missing_letter_pattern, passage, audio_url,
            image_url, source_json, quality_status, statistics_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = this.sqliteInstance.transaction((qs: IOEQuestion[]) => {
          for (const q of qs) {
            insertQ.run(
              q.id, q.version || 1, q.grade, q.cefrLevel || null, q.skill, q.topic || null,
              q.difficulty || 2, q.interaction.family, q.interaction.subtype, q.prompt,
              q.options ? JSON.stringify(q.options) : null,
              JSON.stringify(q.answer),
              q.tokens ? JSON.stringify(q.tokens) : null,
              q.matchingPairs ? JSON.stringify(q.matchingPairs) : null,
              q.missingLetterPattern || null,
              q.passage || null,
              q.audioUrl || null,
              q.imageUrl || null,
              q.source ? JSON.stringify(q.source) : null,
              q.qualityStatus || 'approved',
              q.statistics ? JSON.stringify(q.statistics) : null,
              q.createdAt || new Date().toISOString(),
              q.updatedAt || new Date().toISOString()
            );
          }
        });
        insertMany(INITIAL_SEED_QUESTIONS);

        const insertBp = this.sqliteInstance.prepare(`
          INSERT OR IGNORE INTO exam_blueprints (
            id, title, description, grade, competition_level, is_official_mock,
            duration_minutes, total_questions, skill_distribution_json, difficulty_distribution_json,
            topic_constraints_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertManyBp = this.sqliteInstance.transaction((bps: ExamBlueprint[]) => {
          for (const b of bps) {
            insertBp.run(
              b.id, b.title, b.description || null, b.grade, b.competitionLevel || 'school',
              b.isOfficialMock ? 1 : 0, b.durationMinutes || 30, b.totalQuestions || 200,
              b.skillDistribution ? JSON.stringify(b.skillDistribution) : null,
              b.difficultyDistribution ? JSON.stringify(b.difficultyDistribution) : null,
              b.topicConstraints ? JSON.stringify(b.topicConstraints) : null,
              b.createdAt || new Date().toISOString()
            );
          }
        });
        insertManyBp(INITIAL_SEED_BLUEPRINTS);
      }

      // Seed posts if empty
      const postCount = this.sqliteInstance.prepare('SELECT count(*) as cnt FROM posts').get() as { cnt: number };
      if (postCount.cnt === 0) {
        const insertPost = this.sqliteInstance.prepare(`
          INSERT OR IGNORE INTO posts (
            id, title, slug, summary, content, cover_media_id, author_uid, author_name, author_role,
            grade, category, tags_json, status, published_at,
            view_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertManyPosts = this.sqliteInstance.transaction((posts: Post[]) => {
          for (const p of posts) {
            insertPost.run(
              p.id, p.title, p.slug, p.summary || '', p.content, p.coverMediaId || null,
              p.authorUid || p.authorId || 'admin-1', p.authorName || 'Ban Quản Trị',
              p.authorRole || 'teacher', p.grade || 0, p.category || 'guide',
              p.tags ? JSON.stringify(p.tags) : null,
              p.status || (p.isPublished ? 'published' : 'draft'),
              p.publishedAt || (p.isPublished ? p.createdAt : null),
              p.viewCount || 0, p.createdAt, p.updatedAt
            );
          }
        });
        insertManyPosts(INITIAL_SEED_POSTS);
      }

      // Seed documents if empty
      const docCount = this.sqliteInstance.prepare('SELECT count(*) as cnt FROM documents').get() as { cnt: number };
      if (docCount.cnt === 0) {
        const insertDoc = this.sqliteInstance.prepare(`
          INSERT OR IGNORE INTO documents (
            id, title, description, file_name, stored_name, mime_type,
            file_size, storage_path, uploader_uid, uploader_name,
            grade, category, status, download_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertManyDocs = this.sqliteInstance.transaction((docs: DocumentItem[]) => {
          for (const d of docs) {
            insertDoc.run(
              d.id, d.title, d.description || null, d.fileName, d.storedName || d.fileName,
              d.mimeType || 'application/pdf', d.fileSize || 0, d.storagePath || '',
              d.uploaderUid || d.authorId || 'admin-1', d.uploaderName || d.authorName || 'Ban Quản Trị',
              d.grade || 0, d.category || 'exam_paper', d.status || 'published',
              d.downloadCount || 0, d.createdAt, d.updatedAt || d.createdAt
            );
          }
        });
        insertManyDocs(INITIAL_SEED_DOCUMENTS);
      }
    } else {
      if (this.questionsMap.size === 0) {
        INITIAL_SEED_QUESTIONS.forEach(q => this.questionsMap.set(q.id, q));
      }
      if (this.blueprintsMap.size === 0) {
        INITIAL_SEED_BLUEPRINTS.forEach(b => this.blueprintsMap.set(b.id, b));
      }
      if (this.postsMap.size === 0) {
        INITIAL_SEED_POSTS.forEach(p => this.postsMap.set(p.id, p));
      }
      if (this.documentsMap.size === 0) {
        INITIAL_SEED_DOCUMENTS.forEach(d => this.documentsMap.set(d.id, d));
      }
      this.saveToFileFallback();
    }
  }

  // ================= QUESTIONS =================
  async getQuestionById(id: string): Promise<IOEQuestion | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM questions WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapQuestionRow(row);
    }
    return this.questionsMap.get(id) || null;
  }

  async queryQuestions(filter: QuestionFilter): Promise<{ items: IOEQuestion[]; total: number }> {
    if (this.isNativeSqlite) {
      let sql = 'SELECT * FROM questions WHERE 1=1';
      const params: any[] = [];

      if (filter.grade !== undefined) {
        sql += ' AND grade = ?';
        params.push(filter.grade);
      }
      if (filter.skill) {
        sql += ' AND skill = ?';
        params.push(filter.skill);
      }
      if (filter.topic) {
        sql += ' AND topic LIKE ?';
        params.push(`%${filter.topic}%`);
      }
      if (filter.difficulty) {
        sql += ' AND difficulty = ?';
        params.push(filter.difficulty);
      }
      if (filter.qualityStatus) {
        sql += ' AND quality_status = ?';
        params.push(filter.qualityStatus);
      }
      if (filter.interactionFamily) {
        sql += ' AND interaction_family = ?';
        params.push(filter.interactionFamily);
      }
      if (filter.search) {
        sql += ' AND (prompt LIKE ? OR topic LIKE ?)';
        params.push(`%${filter.search}%`, `%${filter.search}%`);
      }

      const countSql = sql.replace('SELECT *', 'SELECT count(*) as total');
      const totalRow = this.sqliteInstance.prepare(countSql).get(...params) as { total: number };

      sql += ' ORDER BY created_at DESC';
      if (filter.limit) {
        sql += ' LIMIT ?';
        params.push(filter.limit);
        if (filter.offset) {
          sql += ' OFFSET ?';
          params.push(filter.offset);
        }
      }

      const rows = this.sqliteInstance.prepare(sql).all(...params);
      return {
        items: rows.map((r: any) => this.mapQuestionRow(r)),
        total: totalRow.total
      };
    }

    let list = Array.from(this.questionsMap.values());
    if (filter.grade !== undefined) list = list.filter(q => q.grade === filter.grade);
    if (filter.skill) list = list.filter(q => q.skill === filter.skill);
    if (filter.topic) list = list.filter(q => q.topic?.toLowerCase().includes(filter.topic!.toLowerCase()));
    if (filter.difficulty) list = list.filter(q => q.difficulty === filter.difficulty);
    if (filter.qualityStatus) list = list.filter(q => q.qualityStatus === filter.qualityStatus);
    if (filter.interactionFamily) list = list.filter(q => q.interaction.family === filter.interactionFamily);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(q => q.prompt.toLowerCase().includes(s) || q.topic?.toLowerCase().includes(s));
    }

    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const items = list.slice(offset, offset + limit);
    return { items, total };
  }

  async saveQuestion(question: IOEQuestion): Promise<IOEQuestion> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO questions (
          id, version, grade, cefr_level, skill, topic, difficulty,
          interaction_family, interaction_subtype, prompt, options_json, answer_json,
          tokens_json, matching_pairs_json, missing_letter_pattern, passage, audio_url,
          image_url, source_json, quality_status, statistics_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        question.id, question.version || 1, question.grade, question.cefrLevel || null, question.skill, question.topic || null,
        question.difficulty || 2, question.interaction.family, question.interaction.subtype, question.prompt,
        question.options ? JSON.stringify(question.options) : null,
        JSON.stringify(question.answer),
        question.tokens ? JSON.stringify(question.tokens) : null,
        question.matchingPairs ? JSON.stringify(question.matchingPairs) : null,
        question.missingLetterPattern || null,
        question.passage || null,
        question.audioUrl || null,
        question.imageUrl || null,
        question.source ? JSON.stringify(question.source) : null,
        question.qualityStatus || 'approved',
        question.statistics ? JSON.stringify(question.statistics) : null,
        question.createdAt || new Date().toISOString(),
        question.updatedAt || new Date().toISOString()
      );
      return question;
    }
    this.questionsMap.set(question.id, question);
    this.saveToFileFallback();
    return question;
  }

  async updateQuestion(id: string, partial: Partial<IOEQuestion>): Promise<IOEQuestion | null> {
    const existing = await this.getQuestionById(id);
    if (!existing) return null;
    const updated: IOEQuestion = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    return this.saveQuestion(updated);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    if (this.isNativeSqlite) {
      const res = this.sqliteInstance.prepare('DELETE FROM questions WHERE id = ?').run(id);
      return res.changes > 0;
    }
    const had = this.questionsMap.delete(id);
    this.saveToFileFallback();
    return had;
  }

  async getRandomQuestionsForExam(params: {
    grade: number;
    count: number;
    skillDistribution?: Record<string, number>;
    difficultyDistribution?: Record<number, number>;
    topicConstraints?: string[];
  }): Promise<IOEQuestion[]> {
    let allAvailable: IOEQuestion[] = [];
    if (this.isNativeSqlite) {
      const rows = this.sqliteInstance.prepare('SELECT * FROM questions WHERE quality_status = "approved"').all();
      allAvailable = rows.map((r: any) => this.mapQuestionRow(r));
    } else {
      allAvailable = Array.from(this.questionsMap.values());
    }

    const generated = QuestionSynthesizer.generateExamQuestions(allAvailable, {
      grade: params.grade,
      count: params.count,
      skillDistribution: params.skillDistribution,
      difficultyDistribution: params.difficultyDistribution
    });

    for (const q of generated) {
      if (!this.questionsMap.has(q.id)) {
        await this.saveQuestion(q);
      }
    }

    return generated;
  }

  // ================= BLUEPRINTS =================
  async getBlueprintById(id: string): Promise<ExamBlueprint | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM exam_blueprints WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapBlueprintRow(row);
    }
    return this.blueprintsMap.get(id) || null;
  }

  async listBlueprints(grade?: number): Promise<ExamBlueprint[]> {
    if (this.isNativeSqlite) {
      let sql = 'SELECT * FROM exam_blueprints';
      const params: any[] = [];
      if (grade !== undefined) {
        sql += ' WHERE grade = ?';
        params.push(grade);
      }
      sql += ' ORDER BY created_at DESC';
      const rows = this.sqliteInstance.prepare(sql).all(...params);
      return rows.map((r: any) => this.mapBlueprintRow(r));
    }
    let list = Array.from(this.blueprintsMap.values());
    if (grade !== undefined) {
      list = list.filter(b => b.grade === grade);
    }
    return list;
  }

  async saveBlueprint(blueprint: ExamBlueprint): Promise<ExamBlueprint> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO exam_blueprints (
          id, title, description, grade, competition_level, is_official_mock,
          duration_minutes, total_questions, skill_distribution_json, difficulty_distribution_json,
          topic_constraints_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        blueprint.id, blueprint.title, blueprint.description || null, blueprint.grade, blueprint.competitionLevel || 'school',
        blueprint.isOfficialMock ? 1 : 0, blueprint.durationMinutes || 30, blueprint.totalQuestions || 200,
        blueprint.skillDistribution ? JSON.stringify(blueprint.skillDistribution) : null,
        blueprint.difficultyDistribution ? JSON.stringify(blueprint.difficultyDistribution) : null,
        blueprint.topicConstraints ? JSON.stringify(blueprint.topicConstraints) : null,
        blueprint.createdAt || new Date().toISOString()
      );
      return blueprint;
    }
    this.blueprintsMap.set(blueprint.id, blueprint);
    this.saveToFileFallback();
    return blueprint;
  }

  // ================= ATTEMPTS =================
  async getAttemptById(id: string): Promise<AttemptSnapshot | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM attempts WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapAttemptRow(row);
    }
    return this.attemptsMap.get(id) || null;
  }

  async saveAttempt(attempt: AttemptSnapshot): Promise<AttemptSnapshot> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO attempts (
          id, user_id, user_name, user_role, grade, title, duration_minutes, blueprint_id,
          mode, game_skin, ticket_token, total_questions, question_snapshots_json, user_answers_json,
          score, max_score, correct_count, accuracy_rate, status, started_at, submitted_at, client_meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        attempt.id, attempt.userId, attempt.userName, attempt.userRole || 'student', attempt.grade,
        attempt.title || null, attempt.durationMinutes || 30, attempt.blueprintId || null,
        attempt.mode, attempt.gameSkin || 'standard', attempt.ticketToken || null,
        attempt.questions.length, JSON.stringify(attempt.questions),
        JSON.stringify(attempt.answers || {}),
        attempt.finalScore || 0, attempt.totalPoints || 0, attempt.correctCount || 0, 
        attempt.totalPoints ? Math.round(((attempt.finalScore || 0) / attempt.totalPoints) * 100) : 0,
        attempt.status, 
        attempt.serverStartedAt ? new Date(attempt.serverStartedAt).toISOString() : new Date(attempt.serverPreparedAt).toISOString(), 
        attempt.submittedAt ? new Date(attempt.submittedAt).toISOString() : null,
        null
      );
      return attempt;
    }
    this.attemptsMap.set(attempt.id, attempt);
    this.saveToFileFallback();
    return attempt;
  }

  async updateAttemptAnswers(id: string, answers: Record<string, any>): Promise<AttemptSnapshot | null> {
    const attempt = await this.getAttemptById(id);
    if (!attempt) return null;
    attempt.answers = {
      ...(attempt.answers || {}),
      ...answers
    };
    return this.saveAttempt(attempt);
  }

  async listUserAttempts(userId: string): Promise<AttemptSnapshot[]> {
    if (this.isNativeSqlite) {
      const rows = this.sqliteInstance.prepare('SELECT * FROM attempts WHERE user_id = ? ORDER BY started_at DESC LIMIT 50').all(userId);
      return rows.map((r: any) => this.mapAttemptRow(r));
    }
    return Array.from(this.attemptsMap.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.serverStartedAt || b.serverPreparedAt) - (a.serverStartedAt || a.serverPreparedAt));
  }

  // ================= LEADERBOARD =================
  async getLeaderboard(params: { grade?: number; round?: number; limit?: number }): Promise<LeaderboardEntry[]> {
    if (this.isNativeSqlite) {
      let sql = 'SELECT * FROM leaderboard_records WHERE 1=1';
      const sqlParams: any[] = [];
      if (params.grade !== undefined) {
        sql += ' AND grade = ?';
        sqlParams.push(params.grade);
      }
      sql += ' ORDER BY score DESC, duration_seconds ASC LIMIT ?';
      sqlParams.push(params.limit || 50);
      const rows = this.sqliteInstance.prepare(sql).all(...sqlParams);
      return rows.map((r: any, idx: number) => ({
        id: r.id,
        rank: idx + 1,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar || undefined,
        schoolName: r.school_name || undefined,
        grade: r.grade,
        round: r.round,
        competitionLevel: r.competition_level,
        score: r.score,
        timeSpentSeconds: r.duration_seconds,
        accuracy: r.accuracy_rate,
        recordedAt: r.recorded_at,
        completedAt: r.recorded_at
      }));
    }

    let list = [...this.leaderboardList];
    if (params.grade !== undefined) {
      list = list.filter(l => l.grade === params.grade);
    }
    list.sort((a, b) => b.score - a.score || a.timeSpentSeconds - b.timeSpentSeconds);
    return list.slice(0, params.limit || 50).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  async recordLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT INTO leaderboard_records (
          id, user_id, user_name, user_avatar, school_name, grade, round,
          competition_level, score, duration_seconds, accuracy_rate, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        `lb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        entry.userId, entry.userName, entry.userAvatar || null, entry.schoolName || null,
        entry.grade, entry.round || 1, entry.competitionLevel || 'school',
        entry.score, entry.timeSpentSeconds || 60, entry.accuracy || 0, 
        entry.recordedAt || entry.completedAt || new Date().toISOString()
      );
      return;
    }
    this.leaderboardList.push(entry);
    this.saveToFileFallback();
  }

  // ================= USERS =================
  async getUserById(id: string): Promise<UserProfile | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapUserRow(row);
    }
    return this.usersMap.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!row) return null;
      return this.mapUserRow(row);
    }
    return Array.from(this.usersMap.values()).find(u => u.email === email) || null;
  }

  async saveUser(user: UserProfile): Promise<UserProfile> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO users (
          id, email, display_name, role, grade, school_name, province,
          avatar_url, stats_json, created_at, last_login_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        user.id, user.email || null, user.displayName, user.role || 'student', user.grade || 5,
        user.schoolName || null, user.province || null, user.avatarUrl || null,
        user.stats ? JSON.stringify(user.stats) : null,
        user.createdAt || new Date().toISOString(),
        user.lastLoginAt || new Date().toISOString()
      );
      return user;
    }
    this.usersMap.set(user.id, user);
    this.saveToFileFallback();
    return user;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    const u = await this.getUserById(userId);
    if (!u) return false;
    u.role = role;
    await this.saveUser(u);
    return true;
  }

  // ================= AUDIT LOGS =================
  async recordAuditLog(entry: AuditLogEntry): Promise<void> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT INTO audit_logs (id, user_id, user_email, action, resource_type, resource_id, details_json, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        entry.id || `audit-${Date.now()}`, entry.userId, entry.userEmail || null,
        entry.action, entry.resourceType, entry.resourceId,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
        entry.createdAt || new Date().toISOString()
      );
      return;
    }
    this.auditLogsList.unshift(entry);
    this.saveToFileFallback();
  }

  async queryAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
    if (this.isNativeSqlite) {
      const rows = this.sqliteInstance.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userEmail: r.user_email || undefined,
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        details: r.details_json ? JSON.parse(r.details_json) : undefined,
        ipAddress: r.ip_address || undefined,
        createdAt: r.created_at
      }));
    }
    return this.auditLogsList.slice(0, limit);
  }

  // ================= MEDIA =================
  async saveMediaRecord(record: MediaRecord): Promise<void> {
    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO media_records (id, file_name, mime_type, file_size, category, relative_path, storage_driver, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.id, record.fileName, record.mimeType, record.fileSize,
        record.category, record.relativePath, record.storageDriver, record.createdAt
      );
      return;
    }
    this.mediaMap.set(record.id, record);
  }

  async getMediaRecord(id: string): Promise<MediaRecord | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM media_records WHERE id = ?').get(id);
      if (!row) return null;
      return {
        id: row.id,
        fileName: row.file_name,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        category: row.category,
        relativePath: row.relative_path,
        storageDriver: row.storage_driver,
        createdAt: row.created_at
      };
    }
    return this.mediaMap.get(id) || null;
  }

  // ================= POSTS / ARTICLES =================
  async getPostById(id: string): Promise<Post | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM posts WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapPostRow(row);
    }
    return this.postsMap.get(id) || null;
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
      if (!row) return null;
      return this.mapPostRow(row);
    }
    for (const post of this.postsMap.values()) {
      if (post.slug === slug) return post;
    }
    return null;
  }

  async queryPosts(filter: PostFilter): Promise<{ items: Post[]; total: number }> {
    if (this.isNativeSqlite) {
      let sql = 'SELECT * FROM posts WHERE 1=1';
      let countSql = 'SELECT COUNT(*) as cnt FROM posts WHERE 1=1';
      const params: any[] = [];
      const countParams: any[] = [];

      if (filter.status) {
        sql += ' AND status = ?';
        countSql += ' AND status = ?';
        params.push(filter.status);
        countParams.push(filter.status);
      } else if (filter.isPublished !== undefined) {
        const targetStatus = filter.isPublished ? 'published' : 'draft';
        sql += ' AND status = ?';
        countSql += ' AND status = ?';
        params.push(targetStatus);
        countParams.push(targetStatus);
      }

      if (filter.authorUid) {
        sql += ' AND author_uid = ?';
        countSql += ' AND author_uid = ?';
        params.push(filter.authorUid);
        countParams.push(filter.authorUid);
      }

      if (filter.grade !== undefined && filter.grade !== 0) {
        sql += ' AND (grade = ? OR grade = 0)';
        countSql += ' AND (grade = ? OR grade = 0)';
        params.push(filter.grade);
        countParams.push(filter.grade);
      }

      if (filter.category) {
        sql += ' AND category = ?';
        countSql += ' AND category = ?';
        params.push(filter.category);
        countParams.push(filter.category);
      }

      if (filter.search) {
        sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
        countSql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
        const term = `%${filter.search}%`;
        params.push(term, term, term);
        countParams.push(term, term, term);
      }

      sql += ' ORDER BY created_at DESC';

      const limit = filter.limit || 50;
      const offset = filter.offset || 0;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const totalRow = this.sqliteInstance.prepare(countSql).get(...countParams) as { cnt: number };
      const rows = this.sqliteInstance.prepare(sql).all(...params);

      return {
        items: rows.map((r: any) => this.mapPostRow(r)),
        total: totalRow.cnt
      };
    }

    let items = Array.from(this.postsMap.values());
    if (filter.status) {
      items = items.filter(p => p.status === filter.status);
    } else if (filter.isPublished !== undefined) {
      items = items.filter(p => filter.isPublished ? p.status === 'published' : p.status === 'draft');
    }
    if (filter.authorUid) {
      items = items.filter(p => (p.authorUid || p.authorId) === filter.authorUid);
    }
    if (filter.grade !== undefined && filter.grade !== 0) {
      items = items.filter(p => p.grade === filter.grade || p.grade === 0 || !p.grade);
    }
    if (filter.category) {
      items = items.filter(p => p.category === filter.category);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(p => p.title.toLowerCase().includes(s) || (p.summary && p.summary.toLowerCase().includes(s)));
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = items.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    return {
      items: items.slice(offset, offset + limit),
      total
    };
  }

  async savePost(post: Post): Promise<Post> {
    const authorUid = post.authorUid || post.authorId || 'admin-1';
    const status = post.status || (post.isPublished ? 'published' : 'draft');
    const publishedAt = post.publishedAt || (status === 'published' ? new Date().toISOString() : null);
    const summary = post.summary || post.excerpt || '';

    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO posts (
          id, title, slug, summary, content, cover_media_id, author_uid, author_name, author_role,
          grade, category, tags_json, status, published_at,
          view_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        post.id, post.title, post.slug, summary, post.content,
        post.coverMediaId || null, authorUid, post.authorName || 'Giáo viên',
        post.authorRole || 'teacher', post.grade || 0, post.category || 'guide',
        post.tags ? JSON.stringify(post.tags) : null,
        status, publishedAt,
        post.viewCount || 0,
        post.createdAt || new Date().toISOString(),
        post.updatedAt || new Date().toISOString()
      );
      return {
        ...post,
        authorUid,
        authorId: authorUid,
        status,
        publishedAt: publishedAt || undefined,
        summary,
        excerpt: summary,
        isPublished: status === 'published'
      };
    }
    const normalized = {
      ...post,
      authorUid,
      authorId: authorUid,
      status,
      publishedAt: publishedAt || undefined,
      summary,
      excerpt: summary,
      isPublished: status === 'published'
    };
    this.postsMap.set(post.id, normalized);
    this.saveToFileFallback();
    return normalized;
  }

  async updatePost(id: string, partial: Partial<Post>): Promise<Post | null> {
    const existing = await this.getPostById(id);
    if (!existing) return null;
    const updated: Post = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    return this.savePost(updated);
  }

  async setPostStatus(id: string, status: 'draft' | 'published' | 'archived', publishedAt?: string | null): Promise<Post | null> {
    const existing = await this.getPostById(id);
    if (!existing) return null;
    const pubDate = status === 'published' ? (publishedAt || new Date().toISOString()) : (status === 'draft' ? null : existing.publishedAt);
    return this.updatePost(id, {
      status,
      isPublished: status === 'published',
      publishedAt: pubDate || undefined
    });
  }

  async deletePost(id: string): Promise<boolean> {
    // Soft delete / archive is preferred; hard delete when explicitly invoked
    if (this.isNativeSqlite) {
      const res = this.sqliteInstance.prepare('DELETE FROM posts WHERE id = ?').run(id);
      return res.changes > 0;
    }
    const deleted = this.postsMap.delete(id);
    if (deleted) this.saveToFileFallback();
    return deleted;
  }

  async incrementPostViews(id: string): Promise<void> {
    if (this.isNativeSqlite) {
      this.sqliteInstance.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(id);
      return;
    }
    const post = this.postsMap.get(id);
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
      this.saveToFileFallback();
    }
  }

  // ================= DOCUMENTS / MATERIALS =================
  async getDocumentById(id: string): Promise<DocumentItem | null> {
    if (this.isNativeSqlite) {
      const row = this.sqliteInstance.prepare('SELECT * FROM documents WHERE id = ?').get(id);
      if (!row) return null;
      return this.mapDocumentRow(row);
    }
    return this.documentsMap.get(id) || null;
  }

  async queryDocuments(filter: DocumentFilter): Promise<{ items: DocumentItem[]; total: number }> {
    if (this.isNativeSqlite) {
      let sql = 'SELECT * FROM documents WHERE 1=1';
      let countSql = 'SELECT COUNT(*) as cnt FROM documents WHERE 1=1';
      const params: any[] = [];
      const countParams: any[] = [];

      if (filter.status) {
        sql += ' AND status = ?';
        countSql += ' AND status = ?';
        params.push(filter.status);
        countParams.push(filter.status);
      }

      if (filter.uploaderUid) {
        sql += ' AND uploader_uid = ?';
        countSql += ' AND uploader_uid = ?';
        params.push(filter.uploaderUid);
        countParams.push(filter.uploaderUid);
      }

      if (filter.grade !== undefined && filter.grade !== 0) {
        sql += ' AND (grade = ? OR grade = 0)';
        countSql += ' AND (grade = ? OR grade = 0)';
        params.push(filter.grade);
        countParams.push(filter.grade);
      }

      if (filter.category) {
        sql += ' AND category = ?';
        countSql += ' AND category = ?';
        params.push(filter.category);
        countParams.push(filter.category);
      }

      if (filter.search) {
        sql += ' AND (title LIKE ? OR description LIKE ? OR file_name LIKE ?)';
        countSql += ' AND (title LIKE ? OR description LIKE ? OR file_name LIKE ?)';
        const term = `%${filter.search}%`;
        params.push(term, term, term);
        countParams.push(term, term, term);
      }

      sql += ' ORDER BY created_at DESC';

      const limit = filter.limit || 50;
      const offset = filter.offset || 0;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const totalRow = this.sqliteInstance.prepare(countSql).get(...countParams) as { cnt: number };
      const rows = this.sqliteInstance.prepare(sql).all(...params);

      return {
        items: rows.map((r: any) => this.mapDocumentRow(r)),
        total: totalRow.cnt
      };
    }

    let items = Array.from(this.documentsMap.values());
    if (filter.status) {
      items = items.filter(d => d.status === filter.status);
    }
    if (filter.uploaderUid) {
      items = items.filter(d => (d.uploaderUid || d.authorId) === filter.uploaderUid);
    }
    if (filter.grade !== undefined && filter.grade !== 0) {
      items = items.filter(d => d.grade === filter.grade || d.grade === 0);
    }
    if (filter.category) {
      items = items.filter(d => d.category === filter.category);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(d => d.title.toLowerCase().includes(s) || (d.description && d.description.toLowerCase().includes(s)));
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = items.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    return {
      items: items.slice(offset, offset + limit),
      total
    };
  }

  async saveDocument(doc: DocumentItem): Promise<DocumentItem> {
    const uploaderUid = doc.uploaderUid || doc.authorId || 'admin-1';
    const status = doc.status || 'published';
    const storedName = doc.storedName || doc.fileName;
    const mimeType = doc.mimeType || 'application/pdf';
    const storagePath = doc.storagePath || '';

    if (this.isNativeSqlite) {
      const stmt = this.sqliteInstance.prepare(`
        INSERT OR REPLACE INTO documents (
          id, title, description, file_name, stored_name, mime_type,
          file_size, storage_path, uploader_uid, uploader_name,
          grade, category, status, download_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        doc.id, doc.title, doc.description || null, doc.fileName, storedName, mimeType,
        doc.fileSize || 0, storagePath, uploaderUid, doc.uploaderName || doc.authorName || 'Ban Quản Trị',
        doc.grade || 0, doc.category || 'exam_paper', status,
        doc.downloadCount || 0, doc.createdAt || new Date().toISOString(), doc.updatedAt || new Date().toISOString()
      );
      return {
        ...doc,
        uploaderUid,
        authorId: uploaderUid,
        status,
        storedName,
        mimeType,
        storagePath
      };
    }
    const normalized = {
      ...doc,
      uploaderUid,
      authorId: uploaderUid,
      status,
      storedName,
      mimeType,
      storagePath
    };
    this.documentsMap.set(doc.id, normalized);
    this.saveToFileFallback();
    return normalized;
  }

  async updateDocument(id: string, partial: Partial<DocumentItem>): Promise<DocumentItem | null> {
    const existing = await this.getDocumentById(id);
    if (!existing) return null;
    const updated: DocumentItem = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    return this.saveDocument(updated);
  }

  async setDocumentStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<DocumentItem | null> {
    return this.updateDocument(id, { status });
  }

  async deleteDocument(id: string): Promise<boolean> {
    if (this.isNativeSqlite) {
      const res = this.sqliteInstance.prepare('DELETE FROM documents WHERE id = ?').run(id);
      return res.changes > 0;
    }
    const deleted = this.documentsMap.delete(id);
    if (deleted) this.saveToFileFallback();
    return deleted;
  }

  async incrementDocumentDownloads(id: string): Promise<void> {
    if (this.isNativeSqlite) {
      this.sqliteInstance.prepare('UPDATE documents SET download_count = download_count + 1 WHERE id = ?').run(id);
      return;
    }
    const doc = this.documentsMap.get(id);
    if (doc) {
      doc.downloadCount = (doc.downloadCount || 0) + 1;
      this.saveToFileFallback();
    }
  }

  // ================= ROW MAPPERS =================
  private mapQuestionRow(r: any): IOEQuestion {
    return {
      id: r.id,
      version: r.version,
      grade: r.grade,
      cefrLevel: r.cefr_level || undefined,
      skill: r.skill,
      topic: r.topic || undefined,
      difficulty: r.difficulty,
      interaction: {
        family: r.interaction_family,
        subtype: r.interaction_subtype,
        variant: 'text-options'
      },
      prompt: r.prompt,
      options: r.options_json ? JSON.parse(r.options_json) : undefined,
      answer: JSON.parse(r.answer_json),
      tokens: r.tokens_json ? JSON.parse(r.tokens_json) : undefined,
      matchingPairs: r.matching_pairs_json ? JSON.parse(r.matching_pairs_json) : undefined,
      missingLetterPattern: r.missing_letter_pattern || undefined,
      passage: r.passage || undefined,
      audioUrl: r.audio_url || undefined,
      imageUrl: r.image_url || undefined,
      source: r.source_json ? JSON.parse(r.source_json) : undefined,
      qualityStatus: r.quality_status,
      statistics: r.statistics_json ? JSON.parse(r.statistics_json) : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  private mapBlueprintRow(r: any): ExamBlueprint {
    return {
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      grade: r.grade,
      competitionLevel: r.competition_level,
      isOfficialMock: Boolean(r.is_official_mock),
      durationMinutes: r.duration_minutes,
      totalQuestions: r.total_questions,
      skillDistribution: r.skill_distribution_json ? JSON.parse(r.skill_distribution_json) : undefined,
      difficultyDistribution: r.difficulty_distribution_json ? JSON.parse(r.difficulty_distribution_json) : undefined,
      topicConstraints: r.topic_constraints_json ? JSON.parse(r.topic_constraints_json) : undefined,
      createdAt: r.created_at
    };
  }

  private mapAttemptRow(r: any): AttemptSnapshot {
    const startedMs = r.started_at ? new Date(r.started_at).getTime() : Date.now();
    return {
      id: r.id,
      ticketToken: r.ticket_token || '',
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role as UserRole,
      grade: r.grade,
      title: r.title || undefined,
      durationMinutes: r.duration_minutes,
      blueprintId: r.blueprint_id || undefined,
      mode: r.mode,
      gameSkin: r.game_skin,
      questions: JSON.parse(r.question_snapshots_json),
      status: r.status,
      serverPreparedAt: startedMs,
      serverStartedAt: startedMs,
      serverExpiresAt: startedMs + (r.duration_minutes || 30) * 60 * 1000,
      answers: JSON.parse(r.user_answers_json || '{}'),
      finalScore: r.score,
      totalPoints: r.max_score,
      correctCount: r.correct_count,
      submittedAt: r.submitted_at ? new Date(r.submitted_at).getTime() : undefined
    };
  }

  private mapUserRow(r: any): UserProfile {
    return {
      id: r.id,
      email: r.email || undefined,
      displayName: r.display_name,
      role: r.role as UserRole,
      grade: r.grade,
      schoolName: r.school_name || undefined,
      province: r.province || undefined,
      avatarUrl: r.avatar_url || undefined,
      stats: r.stats_json ? JSON.parse(r.stats_json) : undefined,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at || undefined
    };
  }

  private mapPostRow(r: any): Post {
    const status = r.status || (r.is_published ? 'published' : 'draft');
    const authorUid = r.author_uid || r.author_id || 'admin-1';
    const summary = r.summary || r.excerpt || '';
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary,
      excerpt: summary,
      content: r.content,
      coverMediaId: r.cover_media_id || undefined,
      authorUid,
      authorId: authorUid,
      authorName: r.author_name,
      authorRole: r.author_role,
      grade: r.grade,
      category: r.category,
      tags: r.tags_json ? JSON.parse(r.tags_json) : undefined,
      status,
      isPublished: status === 'published',
      publishedAt: r.published_at || undefined,
      viewCount: r.view_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  private mapDocumentRow(r: any): DocumentItem {
    const uploaderUid = r.uploader_uid || r.author_id || 'admin-1';
    const uploaderName = r.uploader_name || r.author_name || 'Ban Quản Trị';
    const status = r.status || 'published';
    const storedName = r.stored_name || r.file_name;
    const fileUrl = r.file_url || `/api/content/documents/download/${storedName}`;

    return {
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      fileName: r.file_name,
      storedName,
      mimeType: r.mime_type || 'application/pdf',
      fileSize: r.file_size || 0,
      storagePath: r.storage_path || '',
      fileUrl,
      uploaderUid,
      uploaderName,
      authorId: uploaderUid,
      authorName: uploaderName,
      status,
      grade: r.grade || 0,
      category: r.category || 'exam_paper',
      skill: r.skill || 'general',
      downloadCount: r.download_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at
    };
  }
}
