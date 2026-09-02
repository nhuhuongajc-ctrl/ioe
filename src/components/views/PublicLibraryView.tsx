import React, { useState, useEffect } from 'react';
import { Post, DocumentItem, PostCategory, DocumentCategory } from '../../shared/types/content';
import { api } from '../../services/api';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Search, 
  Calendar, 
  Eye, 
  User, 
  GraduationCap,
  FolderOpen,
  X,
  FileCheck,
  Share2,
  FileCode,
  Music,
  Archive,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface PublicLibraryViewProps {
  currentGrade: number;
  onNavigateToPractice?: () => void;
  onNavigateToMockExam?: () => void;
}

export function PublicLibraryView({ currentGrade, onNavigateToPractice, onNavigateToMockExam }: PublicLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<'articles' | 'documents'>('articles');
  
  // Articles state
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [articleCategory, setArticleCategory] = useState<string>('all');
  const [articleGrade, setArticleGrade] = useState<number>(currentGrade || 5);
  const [articleSearch, setArticleSearch] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [postTotal, setPostTotal] = useState(0);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docCategory, setDocCategory] = useState<string>('all');
  const [docGrade, setDocGrade] = useState<number>(currentGrade || 5);
  const [docSearch, setDocSearch] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [docPage, setDocPage] = useState(1);
  const [docTotal, setDocTotal] = useState(0);

  // Load Posts
  useEffect(() => {
    loadPosts();
  }, [articleCategory, articleGrade, articleSearch, postPage]);

  // Load Documents
  useEffect(() => {
    loadDocuments();
  }, [docCategory, docGrade, docSearch, docPage]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.getPosts({
        grade: articleGrade === 0 ? undefined : articleGrade,
        category: articleCategory === 'all' ? undefined : (articleCategory as PostCategory),
        search: articleSearch.trim() || undefined,
        limit: 12,
        offset: (postPage - 1) * 12
      });
      setPosts(res.items || []);
      setPostTotal(res.total || 0);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await api.getDocuments({
        grade: docGrade === 0 ? undefined : docGrade,
        category: docCategory === 'all' ? undefined : (docCategory as DocumentCategory),
        search: docSearch.trim() || undefined,
        limit: 12,
        offset: (docPage - 1) * 12
      });
      setDocuments(res.items || []);
      setDocTotal(res.total || 0);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenPost = async (post: Post) => {
    soundEngine.playClick();
    setSelectedPost(post);
    try {
      const fullPost = await api.getPostById(post.slug || post.id);
      setSelectedPost(fullPost);
    } catch (err) {
      console.warn('Could not load full post', err);
    }
  };

  const handleDownloadDoc = async (doc: DocumentItem) => {
    soundEngine.playCorrect();
    setDownloadingId(doc.id);
    try {
      // Create native download anchor
      const downloadUrl = `/api/content/documents/${doc.id}/download`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optimistically increment download count
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d));
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      guide: 'Hướng dẫn thi',
      tips: 'Bí quyết đạt điểm cao',
      news: 'Thông báo & Tin tức',
      grammar: 'Ngữ pháp trọng điểm',
      vocabulary: 'Từ vựng cốt lõi',
      exam_strategy: 'Chiến thuật phòng thi',
      exam_paper: 'Đề thi chính thức',
      practice_set: 'Bộ đề luyện tập',
      vocabulary_list: 'Sổ tay từ vựng',
      grammar_handbook: 'Cẩm nang ngữ pháp',
      audio_lesson: 'File nghe Audio',
      other: 'Tài liệu khác'
    };
    return map[category] || category;
  };

  const getFileTypeIcon = (fileName?: string, mimeType?: string) => {
    const name = (fileName || '').toLowerCase();
    if (name.endsWith('.pdf') || mimeType?.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (name.endsWith('.mp3') || mimeType?.includes('audio')) {
      return <Music className="w-6 h-6 text-emerald-500" />;
    }
    if (name.endsWith('.zip') || name.endsWith('.rar')) {
      return <Archive className="w-6 h-6 text-amber-500" />;
    }
    return <FileCode className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Thư viện kiến thức IOE chuẩn hóa
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Kho Cẩm Nang & Tài Liệu Ôn Luyện Tiếng Anh IOE
          </h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed">
            Tổng hợp bài giảng, bí quyết bứt phá điểm số và kho đề thi chính thức được biên soạn bởi đội ngũ giáo viên giàu kinh nghiệm.
          </p>

          {/* Sub Navigation Switcher */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => { soundEngine.playClick(); setActiveTab('articles'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'articles'
                  ? 'bg-white text-indigo-900 shadow-md shadow-black/10'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bài viết & Cẩm nang ôn luyện ({postTotal})
            </button>
            <button
              onClick={() => { soundEngine.playClick(); setActiveTab('documents'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'bg-white text-indigo-900 shadow-md shadow-black/10'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Download className="w-4 h-4" />
              Tài liệu & Đề thi tải về ({docTotal})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'articles' ? (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={articleSearch}
                onChange={(e) => { setArticleSearch(e.target.value); setPostPage(1); }}
                placeholder="Tìm kiếm bài viết, chủ đề..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Category and Grade Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: 'Tất cả khối', val: 0 },
                  { label: 'Lớp 3', val: 3 },
                  { label: 'Lớp 4', val: 4 },
                  { label: 'Lớp 5', val: 5 }
                ].map(g => (
                  <button
                    key={g.val}
                    onClick={() => { soundEngine.playClick(); setArticleGrade(g.val); setPostPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      articleGrade === g.val
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <select
                value={articleCategory}
                onChange={(e) => { setArticleCategory(e.target.value); setPostPage(1); }}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="guide">Hướng dẫn thi</option>
                <option value="tips">Bí quyết đạt điểm cao</option>
                <option value="grammar">Ngữ pháp trọng điểm</option>
                <option value="vocabulary">Từ vựng cốt lõi</option>
                <option value="exam_strategy">Chiến thuật phòng thi</option>
                <option value="news">Thông báo & Tin tức</option>
              </select>
            </div>
          </div>

          {/* Posts Grid */}
          {loadingPosts ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Đang tải danh sách bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy bài viết phù hợp</h3>
              <p className="text-slate-500 text-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn khối lớp khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <article
                  key={post.id}
                  onClick={() => handleOpenPost(post)}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    {post.coverMediaId || post.thumbnailUrl ? (
                      <div className="w-full h-44 bg-slate-100 overflow-hidden relative">
                        <img
                          src={post.thumbnailUrl || `/api/media/images/${post.coverMediaId}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
                          {getCategoryLabel(post.category)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-between px-6 border-b border-slate-100">
                        <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                          {getCategoryLabel(post.category)}
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-300" />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          Lớp {post.grade === 0 ? 'Tất cả' : post.grade}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {post.summary || post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span className="truncate max-w-[130px]">{post.authorName || 'Giáo viên IOE'}</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Toolbar for Documents */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => { setDocSearch(e.target.value); setDocPage(1); }}
                placeholder="Tìm đề thi, file nghe, cẩm nang..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: 'Tất cả khối', val: 0 },
                  { label: 'Lớp 3', val: 3 },
                  { label: 'Lớp 4', val: 4 },
                  { label: 'Lớp 5', val: 5 }
                ].map(g => (
                  <button
                    key={g.val}
                    onClick={() => { soundEngine.playClick(); setDocGrade(g.val); setDocPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      docGrade === g.val
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <select
                value={docCategory}
                onChange={(e) => { setDocCategory(e.target.value); setDocPage(1); }}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại tài liệu</option>
                <option value="exam_paper">Đề thi chính thức</option>
                <option value="practice_set">Bộ đề luyện tập</option>
                <option value="vocabulary_list">Sổ tay từ vựng</option>
                <option value="grammar_handbook">Cẩm nang ngữ pháp</option>
                <option value="audio_lesson">File nghe Audio</option>
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          {loadingDocs ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Đang tải tài liệu ôn tập...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Chưa có tài liệu phù hợp</h3>
              <p className="text-slate-500 text-sm">Vui lòng thử bộ lọc khác hoặc quay lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-400 hover:shadow-indigo-900/5 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        {getFileTypeIcon(doc.fileName, doc.mimeType)}
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        Lớp {doc.grade === 0 ? 'Tất cả' : doc.grade}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                        {getCategoryLabel(doc.category)}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p className="font-semibold text-slate-700">{formatFileSize(doc.fileSize)}</p>
                      <p className="text-[11px]">{doc.downloadCount || 0} lượt tải</p>
                    </div>

                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      disabled={downloadingId === doc.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition"
                    >
                      <Download className={`w-3.5 h-3.5 ${downloadingId === doc.id ? 'animate-bounce' : ''}`} />
                      {downloadingId === doc.id ? 'Đang tải...' : 'Tải về'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Post Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {getCategoryLabel(selectedPost.category)}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  Lớp {selectedPost.grade === 0 ? 'Tất cả' : selectedPost.grade}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Cover Image */}
              {(selectedPost.coverMediaId || selectedPost.thumbnailUrl) && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-80">
                  <img
                    src={selectedPost.thumbnailUrl || `/api/media/images/${selectedPost.coverMediaId}`}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {selectedPost.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="w-4 h-4 text-blue-600" />
                    {selectedPost.authorName || 'Giáo viên IOE'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {selectedPost.viewCount || 0} lượt xem
                  </span>
                </div>
              </div>

              {/* Formatted Content */}
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4 text-base">
                {selectedPost.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-bold text-slate-900 mt-6">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-black text-slate-900 mt-6">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-black text-slate-900 mt-6">{paragraph.replace('# ', '')}</h1>;
                  }
                  if (paragraph.startsWith('> ')) {
                    return (
                      <blockquote key={idx} className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl text-blue-900 italic font-medium">
                        {paragraph.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">Từ khóa:</span>
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Hệ thống bài giảng IOE Master</span>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
