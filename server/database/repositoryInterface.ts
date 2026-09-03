import { 
  IOEQuestion, 
  ExamBlueprint, 
  AttemptSnapshot, 
  LeaderboardEntry,
  QualityStatus,
  IOESkill
} from '../../src/shared/types/ioe.js';
import { UserProfile, UserRole } from '../../src/shared/types/user.js';
import { Post, DocumentItem, PostFilter, DocumentFilter } from '../../src/shared/types/content.js';
import { AuditLogEntry } from '../security/auditLogger.js';

export interface QuestionFilter {
  grade?: number;
  skill?: IOESkill;
  topic?: string;
  difficulty?: number;
  qualityStatus?: QualityStatus;
  interactionFamily?: string;
  interactionSubtype?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MediaRecord {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  category: 'images' | 'audio';
  relativePath: string;
  storageDriver: string;
  createdAt: string;
}

export interface IRepository {
  // Questions
  getQuestionById(id: string): Promise<IOEQuestion | null>;
  queryQuestions(filter: QuestionFilter): Promise<{ items: IOEQuestion[]; total: number }>;
  saveQuestion(question: IOEQuestion): Promise<IOEQuestion>;
  updateQuestion(id: string, partial: Partial<IOEQuestion>): Promise<IOEQuestion | null>;
  deleteQuestion(id: string): Promise<boolean>;
  getRandomQuestionsForExam(params: {
    grade: number;
    count: number;
    skillDistribution?: Record<string, number>;
    difficultyDistribution?: Record<number, number>;
    topicConstraints?: string[];
  }): Promise<IOEQuestion[]>;

  // Blueprints
  getBlueprintById(id: string): Promise<ExamBlueprint | null>;
  listBlueprints(grade?: number): Promise<ExamBlueprint[]>;
  saveBlueprint(blueprint: ExamBlueprint): Promise<ExamBlueprint>;

  // Attempts
  getAttemptById(id: string): Promise<AttemptSnapshot | null>;
  saveAttempt(attempt: AttemptSnapshot): Promise<AttemptSnapshot>;
  updateAttemptAnswers(id: string, answers: Record<string, any>): Promise<AttemptSnapshot | null>;
  listUserAttempts(userId: string): Promise<AttemptSnapshot[]>;

  // Leaderboard
  getLeaderboard(params: { grade?: number; round?: number; limit?: number; competitionLevel?: string }): Promise<LeaderboardEntry[]>;
  recordLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;

  // Posts / Articles
  getPostById(id: string): Promise<Post | null>;
  getPostBySlug(slug: string): Promise<Post | null>;
  queryPosts(filter: PostFilter): Promise<{ items: Post[]; total: number }>;
  savePost(post: Post): Promise<Post>;
  updatePost(id: string, partial: Partial<Post>): Promise<Post | null>;
  setPostStatus(id: string, status: 'draft' | 'published' | 'archived', publishedAt?: string | null): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
  incrementPostViews(id: string): Promise<void>;

  // Documents / Materials
  getDocumentById(id: string): Promise<DocumentItem | null>;
  queryDocuments(filter: DocumentFilter): Promise<{ items: DocumentItem[]; total: number }>;
  saveDocument(doc: DocumentItem): Promise<DocumentItem>;
  updateDocument(id: string, partial: Partial<DocumentItem>): Promise<DocumentItem | null>;
  setDocumentStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<DocumentItem | null>;
  deleteDocument(id: string): Promise<boolean>;
  incrementDocumentDownloads(id: string): Promise<void>;

  // Users
  getUserById(id: string): Promise<UserProfile | null>;
  getUserByEmail(email: string): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<UserProfile>;
  updateUserRole(userId: string, role: UserRole): Promise<boolean>;
  listUsers(filter?: { role?: UserRole; grade?: number; search?: string; limit?: number; offset?: number }): Promise<{ items: UserProfile[]; total: number }>;
  getSystemOverviewStats(): Promise<{
    totalQuestions: number;
    questionsByGrade: Record<number, number>;
    questionsByLevel: Record<string, number>;
    questionsBySkill: Record<string, number>;
    totalStudents: number;
    attemptsToday: number;
    totalAttempts: number;
    totalBlueprints: number;
    recentAttempts: any[];
  }>;

  // Audit Logs
  recordAuditLog(entry: AuditLogEntry): Promise<void>;
  queryAuditLogs(limit?: number): Promise<AuditLogEntry[]>;

  // Media
  saveMediaRecord(record: MediaRecord): Promise<void>;
  getMediaRecord(id: string): Promise<MediaRecord | null>;
}
