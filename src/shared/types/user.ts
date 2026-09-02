export type UserRole = 'student' | 'teacher' | 'super_admin' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  role: UserRole;
  grade: number; // 1 - 12
  schoolName?: string;
  province?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  stats?: {
    totalExamsTaken: number;
    totalPracticeSessions: number;
    highestScore: number;
    averageScore: number;
    accuracyRate: number;
  };
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}
