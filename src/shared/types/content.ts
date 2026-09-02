export type ContentStatus = 'draft' | 'published' | 'archived';

export type PostCategory = 'guide' | 'tips' | 'grammar' | 'announcement' | 'vocabulary';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string; // alias for summary
  content: string;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null; // alias for coverUrl
  authorUid: string;
  authorId?: string; // alias for authorUid
  authorName?: string;
  authorRole?: string;
  status: ContentStatus;
  isPublished?: boolean; // helper boolean flag
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  grade?: number; // 0 for all grades or 1..12
  category?: PostCategory;
  tags?: string[];
  viewCount?: number;
}

export type DocumentCategory = 'exam_paper' | 'audio_listening' | 'grammar_guide' | 'vocabulary_sheet' | 'practice_set';

export interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  fileUrl?: string; // download url
  uploaderUid: string;
  authorId?: string; // alias for uploaderUid
  uploaderName?: string;
  authorName?: string; // alias for uploaderName
  status: ContentStatus;
  isPublished?: boolean; // helper boolean flag
  createdAt: string;
  updatedAt: string;
  grade?: number; // 0 for all, or 1..12
  category?: DocumentCategory;
  skill?: string;
  downloadCount?: number;
}

export interface PostFilter {
  status?: ContentStatus;
  isPublished?: boolean;
  authorUid?: string;
  authorId?: string;
  search?: string;
  grade?: number;
  category?: PostCategory;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface DocumentFilter {
  status?: ContentStatus;
  isPublished?: boolean;
  uploaderUid?: string;
  authorId?: string;
  search?: string;
  grade?: number;
  category?: DocumentCategory;
  skill?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
