import { 
  IOEQuestion, 
  ExamBlueprint, 
  AttemptSnapshot, 
  LeaderboardEntry,
  QualityStatus,
  IOESkill
} from '../../../src/shared/types/ioe.js';
import { UserProfile } from '../../../src/shared/types/user.js';

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

  // Users
  getUserById(id: string): Promise<UserProfile | null>;
  getUserByEmail(email: string): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<UserProfile>;
}
