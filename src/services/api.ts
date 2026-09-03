import { 
  SanitizedQuestion, 
  IOEQuestion, 
  ExamBlueprint, 
  LeaderboardEntry, 
  AttemptSnapshot,
  UserAnswerPayload
} from '../shared/types/ioe';
import { UserProfile } from '../shared/types/user';
import { Post, DocumentItem, PostFilter, DocumentFilter } from '../shared/types/content';

class ApiService {
  private token: string | null = null;
  private guestUser: { id: string; name: string; grade: number } | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  setGuestUser(user: { id: string; name: string; grade: number } | null) {
    this.guestUser = user;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.guestUser) {
      headers['x-guest-id'] = this.guestUser.id;
      headers['x-guest-name'] = encodeURIComponent(this.guestUser.name);
      headers['x-guest-grade'] = String(this.guestUser.grade);
    }
    return headers;
  }

  // --- Users & Profile ---
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/users/me', { headers: this.getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }

  async updateProfile(partial: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(partial)
    });
    if (!res.ok) throw new Error('Không thể cập nhật thông tin cá nhân');
    const data = await res.json();
    return data.user;
  }

  async getAuditLogs(limit = 50): Promise<any[]> {
    const res = await fetch(`/api/users/audit-logs?limit=${limit}`, { headers: this.getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  }

  async getOverviewStats(): Promise<{
    totalQuestions: number;
    questionsByGrade: Record<number, number>;
    questionsByLevel: Record<string, number>;
    questionsBySkill: Record<string, number>;
    totalStudents: number;
    attemptsToday: number;
    totalAttempts: number;
    totalBlueprints: number;
    recentAttempts: any[];
  }> {
    const res = await fetch('/api/users/overview-stats', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Không thể tải thống kê tổng quan');
    return res.json();
  }

  async getStudents(params: Record<string, any> = {}): Promise<{ items: UserProfile[]; total: number }> {
    const query = new URLSearchParams();
    query.append('role', 'student');
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    }
    const res = await fetch(`/api/users?${query.toString()}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách học sinh');
    return res.json();
  }

  // --- Questions ---
  async getQuestions(params: Record<string, any> = {}): Promise<{ items: IOEQuestion[]; total: number }> {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    }
    const res = await fetch(`/api/ioe/questions?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải danh sách câu hỏi');
    return res.json();
  }

  async getBankStats(): Promise<{
    totalQuestions: number;
    byGrade: Record<number, number>;
    bySkill: Record<string, number>;
    byQualityStatus: Record<string, number>;
    byFamily: Record<string, number>;
  }> {
    const res = await fetch(`/api/ioe/questions/stats`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải thống kê');
    return res.json();
  }

  async createQuestion(question: Partial<IOEQuestion>): Promise<IOEQuestion> {
    const res = await fetch('/api/ioe/questions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(question)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo câu hỏi');
    }
    return res.json();
  }

  async updateQuestion(id: string, partial: Partial<IOEQuestion>): Promise<IOEQuestion> {
    const res = await fetch(`/api/ioe/questions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(partial)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật câu hỏi');
    }
    return res.json();
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const res = await fetch(`/api/ioe/questions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.ok;
  }

  // --- Blueprints ---
  async getBlueprints(grade?: number): Promise<ExamBlueprint[]> {
    const q = grade ? `?grade=${grade}` : '';
    const res = await fetch(`/api/ioe/blueprints${q}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  async createBlueprint(bp: Partial<ExamBlueprint>): Promise<ExamBlueprint> {
    const res = await fetch('/api/ioe/blueprints', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bp)
    });
    if (!res.ok) throw new Error('Không thể tạo ma trận đề thi');
    return res.json();
  }

  // --- Question Factory & AI ---
  async generateAIDraftQuestions(payload: {
    grade: number;
    skill: string;
    topic: string;
    count: number;
    difficulty: number;
    interactionFamily?: string;
    interactionSubtype?: string;
    keywords?: string[];
  }): Promise<{ items: IOEQuestion[]; count: number }> {
    const res = await fetch('/api/ioe/factory/generate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể sinh câu hỏi AI');
    }
    return res.json();
  }

  async validateQuestion(question: Partial<IOEQuestion>): Promise<{
    isValid: boolean;
    issues: Array<{ field: string; message: string; severity: 'error' | 'warning' }>;
  }> {
    const res = await fetch('/api/ioe/factory/validate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(question)
    });
    if (!res.ok) throw new Error('Kiểm tra câu hỏi thất bại');
    return res.json();
  }

  async approveQuestion(id: string): Promise<any> {
    const res = await fetch(`/api/ioe/factory/approve/${id}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Duyệt câu hỏi thất bại');
    return res.json();
  }

  async rejectQuestion(id: string): Promise<any> {
    const res = await fetch(`/api/ioe/factory/reject/${id}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Từ chối câu hỏi thất bại');
    return res.json();
  }

  async searchLexical(query: string, type = 'synonyms'): Promise<any> {
    const res = await fetch(`/api/ioe/factory/lexical/search?q=${encodeURIComponent(query)}&type=${type}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  async searchImages(query: string): Promise<any[]> {
    const res = await fetch(`/api/ioe/factory/images/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  // --- Attempts Lifecycle ---
  async prepareAttempt(params: {
    blueprintId?: string;
    grade?: number;
    mode?: string;
    gameSkin?: string;
    skill?: string;
    topic?: string;
    interactionFamily?: string;
    count?: number;
  }): Promise<{
    attemptId: string;
    ticketToken: string;
    mode: string;
    gameSkin: string;
    grade: number;
    title: string;
    durationMinutes: number;
    totalQuestions: number;
    questions: SanitizedQuestion[];
  }> {
    const res = await fetch('/api/ioe/attempts/prepare', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể khởi tạo phòng thi');
    }
    return res.json();
  }

  async activateAttempt(attemptId: string, ticketToken: string): Promise<{
    status: string;
    attemptId: string;
    serverStartedAt: number;
    serverExpiresAt: number;
    remainingSeconds: number;
  }> {
    const res = await fetch('/api/ioe/attempts/activate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ attemptId, ticketToken })
    });
    if (!res.ok) throw new Error('Không thể kích hoạt bài thi');
    return res.json();
  }

  async syncAnswersBatch(attemptId: string, answers: Record<string, UserAnswerPayload>): Promise<any> {
    const res = await fetch(`/api/ioe/attempts/${attemptId}/answers/batch`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers })
    });
    return res.ok;
  }

  async submitAttempt(attemptId: string, answers?: Record<string, UserAnswerPayload>): Promise<{
    status: string;
    finalScore: number;
    totalPoints: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    timeSpentSeconds: number;
    gradedResults: any[];
    submittedAt: number;
  }> {
    const res = await fetch(`/api/ioe/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Không thể nộp bài thi');
    return res.json();
  }

  async getAttemptReview(attemptId: string): Promise<any> {
    const res = await fetch(`/api/ioe/attempts/${attemptId}/review`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể xem đáp án và giải thích');
    return res.json();
  }

  async getUserHistory(): Promise<AttemptSnapshot[]> {
    const res = await fetch('/api/ioe/attempts/user/history', {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  // --- Leaderboard ---
  async getLeaderboard(params: { grade?: number; round?: number; limit?: number; competitionLevel?: string; level?: string } = {}): Promise<LeaderboardEntry[]> {
    const query = new URLSearchParams();
    if (params.grade) query.append('grade', String(params.grade));
    if (params.round) query.append('round', String(params.round));
    if (params.limit) query.append('limit', String(params.limit));
    const level = params.competitionLevel || params.level;
    if (level) query.append('competitionLevel', String(level));

    const res = await fetch(`/api/ioe/leaderboard?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  }

  // --- Posts & Articles ---
  async getPosts(filter: PostFilter = {}): Promise<{ items: Post[]; total: number; page?: number; totalPages?: number }> {
    const query = new URLSearchParams();
    if (filter.grade !== undefined) query.append('grade', String(filter.grade));
    if (filter.category) query.append('category', filter.category);
    if (filter.search) query.append('search', filter.search);
    if (filter.limit) query.append('limit', String(filter.limit));
    if (filter.offset) query.append('offset', String(filter.offset));

    const res = await fetch(`/api/content/posts?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
    return res.json();
  }

  async getAdminPosts(filter: { grade?: number; category?: string; status?: string; search?: string; page?: number; limit?: number } = {}): Promise<{ items: Post[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (filter.grade !== undefined) query.append('grade', String(filter.grade));
    if (filter.category) query.append('category', filter.category);
    if (filter.status) query.append('status', filter.status);
    if (filter.search) query.append('search', filter.search);
    if (filter.page) query.append('page', String(filter.page));
    if (filter.limit) query.append('limit', String(filter.limit));

    const res = await fetch(`/api/content/posts/admin/list?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải danh sách bài viết quản trị');
    }
    return res.json();
  }

  async getPostById(idOrSlug: string): Promise<Post> {
    const res = await fetch(`/api/content/posts/${encodeURIComponent(idOrSlug)}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải chi tiết bài viết');
    const data = await res.json();
    return data.post;
  }

  async createPost(post: Partial<Post>): Promise<Post> {
    const res = await fetch('/api/content/posts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(post)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể đăng bài viết');
    }
    const data = await res.json();
    return data.post;
  }

  async updatePost(id: string, partial: Partial<Post>): Promise<Post> {
    const res = await fetch(`/api/content/posts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(partial)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật bài viết');
    }
    const data = await res.json();
    return data.post;
  }

  async setPostStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<Post> {
    const res = await fetch(`/api/content/posts/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật trạng thái bài viết');
    }
    const data = await res.json();
    return data.post;
  }

  async deletePost(id: string, hard = false): Promise<boolean> {
    const res = await fetch(`/api/content/posts/${id}${hard ? '?hard=true' : ''}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể xóa bài viết');
    }
    return true;
  }

  // --- Documents & Materials ---
  async getDocuments(filter: DocumentFilter = {}): Promise<{ items: DocumentItem[]; total: number; page?: number; totalPages?: number }> {
    const query = new URLSearchParams();
    if (filter.grade !== undefined) query.append('grade', String(filter.grade));
    if (filter.category) query.append('category', filter.category);
    if (filter.skill) query.append('skill', filter.skill);
    if (filter.search) query.append('search', filter.search);
    if (filter.limit) query.append('limit', String(filter.limit));
    if (filter.offset) query.append('offset', String(filter.offset));

    const res = await fetch(`/api/content/documents?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải tài liệu');
    return res.json();
  }

  async getAdminDocuments(filter: { grade?: number; category?: string; status?: string; search?: string; page?: number; limit?: number } = {}): Promise<{ items: DocumentItem[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (filter.grade !== undefined) query.append('grade', String(filter.grade));
    if (filter.category) query.append('category', filter.category);
    if (filter.status) query.append('status', filter.status);
    if (filter.search) query.append('search', filter.search);
    if (filter.page) query.append('page', String(filter.page));
    if (filter.limit) query.append('limit', String(filter.limit));

    const res = await fetch(`/api/content/documents/admin/list?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải danh sách tài liệu quản trị');
    }
    return res.json();
  }

  async uploadDocumentFile(formData: FormData): Promise<DocumentItem> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch('/api/content/documents/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải lên tài liệu');
    }
    const data = await res.json();
    return data.document;
  }

  async updateDocument(id: string, partial: Partial<DocumentItem>): Promise<DocumentItem> {
    const res = await fetch(`/api/content/documents/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(partial)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật tài liệu');
    }
    const data = await res.json();
    return data.document;
  }

  async setDocumentStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<DocumentItem> {
    const res = await fetch(`/api/content/documents/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật trạng thái tài liệu');
    }
    const data = await res.json();
    return data.document;
  }

  async deleteDocument(id: string, hard = false): Promise<boolean> {
    const res = await fetch(`/api/content/documents/${id}${hard ? '?hard=true' : ''}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể xóa tài liệu');
    }
    return true;
  }

  async uploadMediaImage(file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'images');

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải lên hình ảnh');
    }
    return res.json();
  }
}

export const api = new ApiService();
