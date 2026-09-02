import { UserRole } from './user.js';

export type IOESkill = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export type InteractionFamily = 
  | 'choice'
  | 'text-entry'
  | 'ordering'
  | 'matching'
  | 'listening'
  | 'image'
  | 'cloze';

export type InteractionSubtype = string;

export interface InteractionDescriptor {
  family: InteractionFamily;
  subtype: string; // 'single' | 'fill-blank' | 'reorder-words' | 'pair-match' | 'fill-letter' | 'dictation' | etc.
  variant?: string; // 'text-options' | 'image-options' | 'audio-options' | string
}

export interface QuestionOption {
  id: string;
  label?: string; // 'A', 'B', 'C', 'D'
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface QuestionMatchingPair {
  id: string;
  leftId: string;
  leftText?: string;
  leftImage?: string;
  rightId: string;
  rightText?: string;
  rightImage?: string;
}

// Alias for matching interaction component
export type MatchingPair = QuestionMatchingPair;

export interface TokenItem {
  id: string;
  text: string;
}

export interface HotspotRegion {
  id: string;
  x: number; // percentage 0 - 100
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface ServerAuthoritativeAnswer {
  correctOptionId?: string;
  acceptedAnswers?: string[];
  orderedTokenIds?: string[];
  correctPairMatches?: Record<string, string>; // leftId -> rightId
  correctRegionId?: string;
  explanation?: string;
  vietnameseMeaning?: string;
  pronunciationIpa?: string;
}

export interface QuestionSourceProvenance {
  provider: 'wordnet' | 'tatoeba' | 'dictionaryapi' | 'wikimedia' | 'unsplash' | 'manual' | 'ai-synthesized' | 'ai_draft' | 'datamuse' | 'dictionary' | string;
  license?: string;
  sourceUrl?: string;
  provenance?: string;
}

export interface QuestionStatistics {
  attempts: number;
  correctRate: number;
  averageTimeMs: number;
}

export type QualityStatus = 'draft' | 'review_required' | 'approved' | 'retired';

export interface IOEQuestion {
  id: string;
  version: number;
  grade: number; // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  skill: IOESkill;
  topic: string;
  grammarPoint?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  interaction: InteractionDescriptor;
  prompt: string;
  passage?: string;
  options?: QuestionOption[];
  tokens?: Array<{ id: string; text: string }>;
  matchingPairs?: QuestionMatchingPair[];
  hotspotData?: {
    imageUrl: string;
    regions: HotspotRegion[];
  };
  missingLetterPattern?: string; // e.g. "e _ e p h _ n t"
  audioUrl?: string;
  imageUrl?: string;
  mediaAssetIds?: string[];
  answer: ServerAuthoritativeAnswer; // Server only! Stripped in student payload
  source: QuestionSourceProvenance;
  qualityStatus: QualityStatus;
  statistics: QuestionStatistics;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
}

/**
 * Sanitized Question delivered to the student client (NEVER contains answer keys)
 */
export interface SanitizedQuestion {
  id: string;
  version: number;
  grade: number;
  skill: IOESkill;
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  interaction: InteractionDescriptor;
  prompt: string;
  passage?: string;
  options?: QuestionOption[];
  tokens?: Array<{ id: string; text: string }>;
  matchingPairs?: QuestionMatchingPair[];
  hotspotData?: {
    imageUrl: string;
    regions: HotspotRegion[];
  };
  missingLetterPattern?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export type IOECompetitionLevel = 'school' | 'district' | 'province' | 'national' | 'practice';

export interface ExamBlueprint {
  id: string;
  title: string;
  description?: string;
  grade: number;
  competitionLevel?: IOECompetitionLevel;
  round?: number;
  isOfficialMock?: boolean;
  durationMinutes: number;
  totalQuestions: number;
  skillDistribution?: {
    vocabulary?: number;
    grammar?: number;
    reading?: number;
    listening?: number;
    [key: string]: number | undefined;
  };
  difficultyDistribution?: Record<number, number>;
  allowedInteractionFamilies?: InteractionFamily[];
  topicConstraints?: string[];
  createdAt: string;
}

export type GameSkinType = 'standard' | 'speed_racing' | 'mountain_climb' | 'jungle_quest';

export type ExamMode = 
  | 'mock_exam'          // Thi thử 200 câu / 30 phút hoặc 100 câu Lớp 1-2
  | 'round_practice'     // Tự luyện theo vòng IOE (Vòng 1 - 35)
  | 'practice_topic'     // Luyện theo chủ đề
  | 'practice_skill'     // Luyện theo kỹ năng
  | 'practice_type'      // Luyện theo dạng bài
  | 'wrong_questions';   // Luyện câu thường sai

export interface UserAnswerPayload {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  orderedTokenIds?: string[];
  pairMatches?: Record<string, string>;
  selectedRegionId?: string;
  clientAnsweredAt: number;
}

export interface GradedQuestionResult {
  questionId: string;
  isCorrect: boolean;
  scoreEarned: number;
  maxScore: number;
  userAnswer: UserAnswerPayload;
  correctAnswer: ServerAuthoritativeAnswer;
  timeSpentMs: number;
}

export interface AttemptSnapshot {
  id: string; // clientRunId
  ticketToken: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  grade: number;
  title?: string;
  durationMinutes?: number;
  blueprintId?: string;
  mode: ExamMode;
  gameSkin: GameSkinType;
  questions: SanitizedQuestion[];
  status: 'prepared' | 'in_progress' | 'submitted' | 'expired';
  serverPreparedAt: number;
  serverStartedAt?: number;
  serverExpiresAt?: number;
  answers: Record<string, UserAnswerPayload>;
  finalScore?: number;
  totalPoints?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  gradedResults?: GradedQuestionResult[];
  submittedAt?: number;
}

export interface LeaderboardEntry {
  id?: string;
  rank?: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  schoolName?: string;
  grade: number;
  score: number;
  maxScore?: number;
  accuracy: number;
  timeSpentSeconds: number;
  round?: number;
  competitionLevel?: IOECompetitionLevel;
  examTitle?: string;
  completedAt?: string;
  recordedAt?: string;
}
