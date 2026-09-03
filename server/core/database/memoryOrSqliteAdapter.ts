import { 
  IOEQuestion, 
  ExamBlueprint, 
  AttemptSnapshot, 
  LeaderboardEntry,
  QualityStatus
} from '../../../src/shared/types/ioe.js';
import { UserProfile } from '../../../src/shared/types/user.js';
import { IRepository, QuestionFilter } from './repositoryInterface.js';
import { INITIAL_SEED_QUESTIONS } from './seedQuestions.js';
import { INITIAL_SEED_BLUEPRINTS } from './seedBlueprints.js';
import { QuestionSynthesizer } from './questionSynthesizer.js';

export class MemoryOrSqliteAdapter implements IRepository {
  private questions: Map<string, IOEQuestion> = new Map();
  private blueprints: Map<string, ExamBlueprint> = new Map();
  private attempts: Map<string, AttemptSnapshot> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  private users: Map<string, UserProfile> = new Map();

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    // Seed questions
    for (const q of INITIAL_SEED_QUESTIONS) {
      this.questions.set(q.id, q);
    }

    // Seed blueprints
    for (const bp of INITIAL_SEED_BLUEPRINTS) {
      this.blueprints.set(bp.id, bp);
    }

    // Seed mock users
    const demoStudent: UserProfile = {
      id: 'student-demo-1',
      displayName: 'Nguyễn Minh Anh',
      role: 'student',
      grade: 5,
      schoolName: 'TH Nguyễn Du',
      province: 'Hà Nội',
      createdAt: new Date().toISOString(),
      stats: {
        totalExamsTaken: 12,
        totalPracticeSessions: 45,
        highestScore: 1980,
        averageScore: 1750,
        accuracyRate: 88.5
      }
    };
    this.users.set(demoStudent.id, demoStudent);

    const demoTeacher: UserProfile = {
      id: 'teacher-demo-1',
      displayName: 'Cô Hoàng Thu Thảo',
      role: 'teacher',
      grade: 5,
      schoolName: 'TH Vinschool Times City',
      province: 'Hà Nội',
      createdAt: new Date().toISOString()
    };
    this.users.set(demoTeacher.id, demoTeacher);

    // Seed leaderboard entries
    this.leaderboard = [
      {
        id: 'lb-1',
        userId: 'student-demo-1',
        userName: 'Nguyễn Minh Anh',
        grade: 5,
        score: 1980,
        maxScore: 2000,
        accuracy: 99.0,
        timeSpentSeconds: 1420,
        round: 15,
        examTitle: 'IOE Quốc Gia - Khối 5 (Thi thử Đợt 1)',
        completedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
      },
      {
        id: 'lb-2',
        userId: 'student-2',
        userName: 'Trần Gia Bảo',
        grade: 5,
        score: 1950,
        maxScore: 2000,
        accuracy: 97.5,
        timeSpentSeconds: 1510,
        round: 15,
        examTitle: 'IOE Quốc Gia - Khối 5 (Thi thử Đợt 1)',
        completedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
      },
      {
        id: 'lb-3',
        userId: 'student-3',
        userName: 'Lê Ngọc Mai',
        grade: 5,
        score: 1920,
        maxScore: 2000,
        accuracy: 96.0,
        timeSpentSeconds: 1590,
        round: 15,
        examTitle: 'IOE Quốc Gia - Khối 5 (Thi thử Đợt 1)',
        completedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
      },
      {
        id: 'lb-4',
        userId: 'student-4',
        userName: 'Phạm Đức Huy',
        grade: 4,
        score: 1900,
        maxScore: 2000,
        accuracy: 95.0,
        timeSpentSeconds: 1620,
        round: 10,
        examTitle: 'IOE Cấp Tỉnh - Khối 4',
        completedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
      },
      {
        id: 'lb-5',
        userId: 'student-5',
        userName: 'Vũ Thùy Linh',
        grade: 3,
        score: 1880,
        maxScore: 2000,
        accuracy: 94.0,
        timeSpentSeconds: 1650,
        round: 5,
        examTitle: 'IOE Cấp Huyện - Khối 3',
        completedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString()
      }
    ];
  }

  async getQuestionById(id: string): Promise<IOEQuestion | null> {
    return this.questions.get(id) || null;
  }

  async queryQuestions(filter: QuestionFilter): Promise<{ items: IOEQuestion[]; total: number }> {
    let list = Array.from(this.questions.values());

    if (filter.grade !== undefined && filter.grade !== null) {
      list = list.filter(q => q.grade === filter.grade);
    }
    if (filter.skill) {
      list = list.filter(q => q.skill === filter.skill);
    }
    if (filter.topic) {
      list = list.filter(q => q.topic.toLowerCase().includes(filter.topic!.toLowerCase()));
    }
    if (filter.difficulty) {
      list = list.filter(q => q.difficulty === filter.difficulty);
    }
    if (filter.qualityStatus) {
      list = list.filter(q => q.qualityStatus === filter.qualityStatus);
    }
    if (filter.interactionFamily) {
      list = list.filter(q => q.interaction.family === filter.interactionFamily);
    }
    if (filter.interactionSubtype) {
      list = list.filter(q => q.interaction.subtype === filter.interactionSubtype);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(q => 
        q.prompt.toLowerCase().includes(s) || 
        q.topic.toLowerCase().includes(s) ||
        (q.grammarPoint && q.grammarPoint.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const items = list.slice(offset, offset + limit);

    return { items, total };
  }

  async saveQuestion(question: IOEQuestion): Promise<IOEQuestion> {
    this.questions.set(question.id, question);
    return question;
  }

  async updateQuestion(id: string, partial: Partial<IOEQuestion>): Promise<IOEQuestion | null> {
    const existing = this.questions.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    this.questions.set(id, updated);
    return updated;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.questions.delete(id);
  }

  async getRandomQuestionsForExam(params: {
    grade: number;
    count: number;
    skillDistribution?: Record<string, number>;
    difficultyDistribution?: Record<number, number>;
    topicConstraints?: string[];
  }): Promise<IOEQuestion[]> {
    const allAvailable = Array.from(this.questions.values());
    const generated = QuestionSynthesizer.generateExamQuestions(allAvailable, {
      grade: params.grade,
      count: params.count,
      skillDistribution: params.skillDistribution,
      difficultyDistribution: params.difficultyDistribution
    });

    // Cache any newly generated questions in database so authoritative grading resolves them
    for (const q of generated) {
      if (!this.questions.has(q.id)) {
        this.questions.set(q.id, q);
      }
    }

    return generated;
  }

  async getBlueprintById(id: string): Promise<ExamBlueprint | null> {
    return this.blueprints.get(id) || null;
  }

  async listBlueprints(grade?: number): Promise<ExamBlueprint[]> {
    let list = Array.from(this.blueprints.values());
    if (grade) {
      list = list.filter(bp => bp.grade === grade);
    }
    return list;
  }

  async saveBlueprint(blueprint: ExamBlueprint): Promise<ExamBlueprint> {
    this.blueprints.set(blueprint.id, blueprint);
    return blueprint;
  }

  async getAttemptById(id: string): Promise<AttemptSnapshot | null> {
    return this.attempts.get(id) || null;
  }

  async saveAttempt(attempt: AttemptSnapshot): Promise<AttemptSnapshot> {
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async updateAttemptAnswers(id: string, answers: Record<string, any>): Promise<AttemptSnapshot | null> {
    const attempt = this.attempts.get(id);
    if (!attempt) return null;
    attempt.answers = {
      ...attempt.answers,
      ...answers
    };
    return attempt;
  }

  async listUserAttempts(userId: string): Promise<AttemptSnapshot[]> {
    return Array.from(this.attempts.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.submittedAt || b.serverPreparedAt) - (a.submittedAt || a.serverPreparedAt));
  }

  async getLeaderboard(params: { grade?: number; round?: number; limit?: number; competitionLevel?: string }): Promise<LeaderboardEntry[]> {
    let list = [...this.leaderboard];
    if (params.grade) {
      list = list.filter(e => e.grade === params.grade);
    }
    if (params.round) {
      list = list.filter(e => e.round === params.round);
    }
    if (params.competitionLevel) {
      list = list.filter(e => e.competitionLevel === params.competitionLevel);
    }
    list.sort((a, b) => b.score - a.score || a.timeSpentSeconds - b.timeSpentSeconds);
    return list.slice(0, params.limit || 50);
  }

  async recordLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
    this.leaderboard.push(entry);
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  async saveUser(user: UserProfile): Promise<UserProfile> {
    this.users.set(user.id, user);
    return user;
  }
}
