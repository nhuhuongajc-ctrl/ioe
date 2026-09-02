import React, { useState, useEffect, useRef } from 'react';
import { Post, DocumentItem, PostCategory, DocumentCategory, ContentStatus } from '../../shared/types/content';
import { UserProfile } from '../../shared/types/user';
import { api } from '../../services/api';
import { QuestionFactoryView } from './QuestionFactoryView';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Activity, 
  Clock, 
  FileCheck,
  X,
  Send,
  Link,
  Image as ImageIcon,
  Archive,
  RotateCcw,
  Check,
  AlertTriangle,
  FileCode,
  Music,
  FolderArchive,
  User,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface AdminTeacherDashboardViewProps {
  currentUser: UserProfile;
}

export function AdminTeacherDashboardView({ currentUser }: AdminTeacherDashboardViewProps) {
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const hasAccess = isSuperAdmin || isTeacher;

  // Active Main SubTab
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'documents' | 'factory' | 'audit'>('posts');

  // ================= POSTS STATE =================
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postStatusFilter, setPostStatusFilter] = useState<string>('all');
  const [postGradeFilter, setPostGradeFilter] = useState<number>(0);
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>('all');
  const [postSearch, setPostSearch] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [postTotal, setPostTotal] = useState(0);

  // Post Modal Form State
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postFormTab, setPostFormTab] = useState<'edit' | 'preview'>('edit');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [postFormData, setPostFormData] = useState<{
    title: string;
    slug: string;
    category: PostCategory;
    grade: number;
    summary: string;
    content: string;
    coverMediaId: string | null;
    thumbnailUrl: string;
    tagsString: string;
    status: ContentStatus;
  }>({
    title: '',
    slug: '',
    category: 'guide',
    grade: 5,
    summary: '',
    content: '',
    coverMediaId: null,
    thumbnailUrl: '',
    tagsString: 'ioe,tieng-anh-tieu-hoc',
    status: 'published'
  });

  // Preview Post Modal
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  // ================= DOCUMENTS STATE =================
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docStatusFilter, setDocStatusFilter] = useState<string>('all');
  const [docGradeFilter, setDocGradeFilter] = useState<number>(0);
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [docSearch, setDocSearch] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docTotal, setDocTotal] = useState(0);

  // Document Upload Modal State
  const [showDocModal, setShowDocModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docFormData, setDocFormData] = useState<{
    title: string;
    description: string;
    grade: number;
    category: DocumentCategory;
    skill: string;
    status: ContentStatus;
  }>({
    title: '',
    description: '',
    grade: 5,
    category: 'exam_paper',
    skill: 'general',
    status: 'published'
  });

  // ================= AUDIT LOGS STATE =================
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auto-fetch data on tab/filter change
  useEffect(() => {
    if (!hasAccess) return;
    if (activeSubTab === 'posts') {
      loadAdminPosts();
    } else if (activeSubTab === 'documents') {
      loadAdminDocuments();
    } else if (activeSubTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeSubTab, postStatusFilter, postGradeFilter, postCategoryFilter, postSearch, postPage, docStatusFilter, docGradeFilter, docCategoryFilter, docSearch, docPage]);

  // Load Admin Posts
  const loadAdminPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.getAdminPosts({
        status: postStatusFilter === 'all' ? undefined : postStatusFilter,
        grade: postGradeFilter === 0 ? undefined : postGradeFilter,
        category: postCategoryFilter === 'all' ? undefined : postCategoryFilter,
        search: postSearch.trim() || undefined,
        page: postPage,
        limit: 15
      });
      setPosts(res.items || []);
      setPostTotal(res.total || 0);
    } catch (err: any) {
      console.error('Error loading admin posts:', err);
      showToast('error', err.message || 'Không thể tải danh sách bài viết');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load Admin Documents
  const loadAdminDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await api.getAdminDocuments({
        status: docStatusFilter === 'all' ? undefined : docStatusFilter,
        grade: docGradeFilter === 0 ? undefined : docGradeFilter,
        category: docCategoryFilter === 'all' ? undefined : docCategoryFilter,
        search: docSearch.trim() || undefined,
        page: docPage,
        limit: 15
      });
      setDocuments(res.items || []);
      setDocTotal(res.total || 0);
    } catch (err: any) {
      console.error('Error loading admin docs:', err);
      showToast('error', err.message || 'Không thể tải danh sách tài liệu');
    } finally {
      setLoadingDocs(false);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const logs = await api.getAuditLogs(60);
      setAuditLogs(logs || []);
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // ================= POST ACTIONS =================

  const handleOpenCreatePost = () => {
    soundEngine.playClick();
    setEditingPostId(null);
    setPostFormData({
      title: '',
      slug: '',
      category: 'guide',
      grade: 5,
      summary: '',
      content: `## 1. Trọng tâm kiến thức\n\nNêu tóm tắt những cấu trúc và từ vựng then chốt cần nắm vững...\n\n## 2. Các dạng bài thường gặp\n\n- Dạng 1: Chọn đáp án đúng (Multiple Choice)\n- Dạng 2: Sắp xếp từ thành câu hoàn chỉnh\n- Dạng 3: Điền từ còn thiếu vào chỗ trống\n\n> **Bí kíp:** Luôn chú ý thì của động từ và chủ ngữ số ít / số nhiều!\n\n## 3. Bài tập vận dụng\n\n1. She usually ______ (go) to school at 7 AM.\n2. Where ______ you yesterday?`,
      coverMediaId: null,
      thumbnailUrl: '',
      tagsString: 'ioe,on-tap,ngu-phap',
      status: 'published'
    });
    setPostFormTab('edit');
    setShowPostModal(true);
  };

  const handleOpenEditPost = async (post: Post) => {
    soundEngine.playClick();
    setEditingPostId(post.id);
    try {
      const fullPost = await api.getPostById(post.slug || post.id);
      setPostFormData({
        title: fullPost.title,
        slug: fullPost.slug,
        category: fullPost.category,
        grade: fullPost.grade,
        summary: fullPost.summary || fullPost.excerpt || '',
        content: fullPost.content,
        coverMediaId: fullPost.coverMediaId || null,
        thumbnailUrl: fullPost.thumbnailUrl || '',
        tagsString: (fullPost.tags || []).join(', '),
        status: fullPost.status || 'published'
      });
      setPostFormTab('edit');
      setShowPostModal(true);
    } catch (err: any) {
      showToast('error', 'Không thể tải chi tiết bài viết để chỉnh sửa');
    }
  };

  const handleSavePost = async (forceStatus?: ContentStatus) => {
    if (!postFormData.title.trim()) {
      showToast('error', 'Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!postFormData.content.trim()) {
      showToast('error', 'Vui lòng nhập nội dung bài viết');
      return;
    }

    const targetStatus = forceStatus || postFormData.status;
    const tags = postFormData.tagsString
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter(Boolean);

    try {
      if (editingPostId) {
        await api.updatePost(editingPostId, {
          title: postFormData.title,
          slug: postFormData.slug || undefined,
          category: postFormData.category,
          grade: postFormData.grade,
          summary: postFormData.summary,
          content: postFormData.content,
          coverMediaId: postFormData.coverMediaId || undefined,
          thumbnailUrl: postFormData.thumbnailUrl || undefined,
          tags,
          status: targetStatus
        });
        showToast('success', targetStatus === 'published' ? 'Đã cập nhật và xuất bản bài viết' : 'Đã lưu bản nháp bài viết');
      } else {
        await api.createPost({
          title: postFormData.title,
          slug: postFormData.slug || undefined,
          category: postFormData.category,
          grade: postFormData.grade,
          summary: postFormData.summary,
          content: postFormData.content,
          coverMediaId: postFormData.coverMediaId || undefined,
          thumbnailUrl: postFormData.thumbnailUrl || undefined,
          tags,
          status: targetStatus
        });
        showToast('success', targetStatus === 'published' ? 'Đã đăng bài viết thành công' : 'Đã tạo bản nháp bài viết');
      }

      setShowPostModal(false);
      loadAdminPosts();
      soundEngine.playCorrect();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu bài viết');
    }
  };

  const handleTogglePostStatus = async (post: Post, newStatus: ContentStatus) => {
    soundEngine.playClick();
    try {
      await api.setPostStatus(post.id, newStatus);
      const label = newStatus === 'published' ? 'xuất bản' : (newStatus === 'draft' ? 'chuyển về nháp' : 'lưu trữ');
      showToast('success', `Đã ${label} bài viết thành công`);
      loadAdminPosts();
    } catch (err: any) {
      showToast('error', err.message || 'Không thể thay đổi trạng thái');
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) return;
    soundEngine.playClick();
    try {
      await api.deletePost(post.id);
      showToast('info', 'Đã chuyển bài viết vào kho lưu trữ (Archive)');
      loadAdminPosts();
    } catch (err: any) {
      showToast('error', err.message || 'Không thể xóa bài viết');
    }
  };

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Chỉ chấp nhận tệp hình ảnh (PNG, JPG, WEBP)');
      return;
    }

    setUploadingCover(true);
    try {
      const result = await api.uploadMediaImage(file);
      setPostFormData(prev => ({
        ...prev,
        coverMediaId: result.id,
        thumbnailUrl: result.url
      }));
      showToast('success', 'Đã tải lên ảnh bìa bài viết');
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải lên ảnh bìa');
    } finally {
      setUploadingCover(false);
    }
  };

  // ================= DOCUMENT ACTIONS =================

  const handleOpenUploadDoc = () => {
    soundEngine.playClick();
    setSelectedDocFile(null);
    setDocFormData({
      title: '',
      description: '',
      grade: 5,
      category: 'exam_paper',
      skill: 'general',
      status: 'published'
    });
    setShowDocModal(true);
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocFile) {
      showToast('error', 'Vui lòng chọn tệp tài liệu để tải lên');
      return;
    }
    if (!docFormData.title.trim()) {
      showToast('error', 'Vui lòng nhập tên tài liệu');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedDocFile);
      formData.append('title', docFormData.title.trim());
      formData.append('description', docFormData.description.trim());
      formData.append('grade', String(docFormData.grade));
      formData.append('category', docFormData.category);
      formData.append('skill', docFormData.skill);
      formData.append('status', docFormData.status);

      await api.uploadDocumentFile(formData);
      showToast('success', 'Đã tải lên tài liệu thành công');
      setShowDocModal(false);
      loadAdminDocuments();
      soundEngine.playCorrect();
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải lên tài liệu');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleToggleDocStatus = async (doc: DocumentItem, newStatus: ContentStatus) => {
    soundEngine.playClick();
    try {
      await api.setDocumentStatus(doc.id, newStatus);
      const label = newStatus === 'published' ? 'xuất bản' : (newStatus === 'draft' ? 'chuyển về nháp' : 'lưu trữ');
      showToast('success', `Đã ${label} tài liệu thành công`);
      loadAdminDocuments();
    } catch (err: any) {
      showToast('error', err.message || 'Không thể thay đổi trạng thái');
    }
  };

  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.title}"?`)) return;
    soundEngine.playClick();
    try {
      await api.deleteDocument(doc.id);
      showToast('info', 'Đã chuyển tài liệu vào kho lưu trữ (Archive)');
      loadAdminDocuments();
    } catch (err: any) {
      showToast('error', err.message || 'Không thể xóa tài liệu');
    }
  };

  // Helper formatting
  const getStatusBadge = (status?: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã xuất bản (Public)
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Bản nháp (Draft)
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Archive className="w-3 h-3 text-slate-500" />
            Lưu trữ (Archived)
          </span>
        );
      default:
        return null;
    }
  };

  const getFileTypeIcon = (fileName?: string, mimeType?: string) => {
    const name = (fileName || '').toLowerCase();
    if (name.endsWith('.pdf') || mimeType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (name.endsWith('.mp3') || mimeType?.includes('audio')) {
      return <Music className="w-5 h-5 text-emerald-500" />;
    }
    if (name.endsWith('.zip') || name.endsWith('.rar')) {
      return <FolderArchive className="w-5 h-5 text-amber-500" />;
    }
    return <FileCode className="w-5 h-5 text-blue-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // If user does not have permission, show security barrier
  if (!hasAccess) {
    return (
      <div className="w-full max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Truy cập bị từ chối (403 Forbidden)</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
          Khu vực Dashboard quản trị chỉ dành cho tài khoản <strong>Giáo viên (Teacher)</strong> và <strong>Quản trị viên (Super Admin)</strong>. Tài khoản học sinh và khách vãng lai chỉ có quyền xem nội dung công khai.
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 font-mono text-left max-w-md mx-auto">
          Current Role: {currentUser.role} | UID: {currentUser.id}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            {isSuperAdmin ? 'Cổng Quản Trị Hệ Thống Toàn Quyền (Super Admin)' : 'Bảng Điều Khiển Giáo Viên (Teacher Hub)'}
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Quản Trị Nội Dung & Tài Liệu IOE
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isSuperAdmin 
              ? 'Toàn quyền kiểm duyệt, xuất bản, lưu trữ và điều phối bài viết, tài liệu cũng như theo dõi nhật ký bảo mật toàn hệ thống.'
              : 'Đăng bài viết ôn tập, tải lên tài liệu đề thi và quản lý trạng thái xuất bản các nội dung giảng dạy của bạn.'}
          </p>
        </div>

        {/* Quick User Identity Pill */}
        <div className="z-10 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-2 min-w-[220px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentUser.displayName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{currentUser.displayName}</p>
              <p className="text-xs text-blue-400 font-semibold mt-1 uppercase">{currentUser.role}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
            Đơn vị: {currentUser.schoolName || 'Hệ thống IOE Master'}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg text-sm font-bold animate-in fade-in duration-200 ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-900/20' :
          toastMessage.type === 'error' ? 'bg-red-600 text-white shadow-red-900/20' :
          'bg-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation SubTabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { soundEngine.playClick(); setActiveSubTab('posts'); }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'posts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Quản lý Bài viết ({postTotal})
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveSubTab('documents'); }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Kho Tài liệu & Tệp tin ({docTotal})
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveSubTab('factory'); }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'factory'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Xưởng Chế Tác Câu Hỏi AI
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveSubTab('audit'); }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'audit'
              ? 'bg-slate-800 text-white shadow-md shadow-black/10'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Nhật ký Hoạt động (Audit Logs)
        </button>
      </div>

      {/* ================= POST MANAGEMENT SUBTAB ================= */}
      {activeSubTab === 'posts' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => { setPostSearch(e.target.value); setPostPage(1); }}
                  placeholder="Tìm tiêu đề, tác giả..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={postStatusFilter}
                onChange={(e) => { setPostStatusFilter(e.target.value); setPostPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản (Published)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>

              {/* Grade Filter */}
              <select
                value={postGradeFilter}
                onChange={(e) => { setPostGradeFilter(parseInt(e.target.value, 10)); setPostPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Tất cả khối lớp</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={handleOpenCreatePost}
              className="w-full lg:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Đăng bài viết mới
            </button>
          </div>

          {/* Posts Table */}
          {loadingPosts ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-xs font-semibold">Đang tải danh sách bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">Chưa có bài viết nào</h3>
              <p className="text-slate-500 text-xs">Hãy nhấn nút "Đăng bài viết mới" để bắt đầu chia sẻ cẩm nang kiến thức.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Bài viết & Tóm tắt</th>
                      <th className="py-3.5 px-4">Khối lớp & Danh mục</th>
                      <th className="py-3.5 px-4">Tác giả</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Lượt xem</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 max-w-sm">
                          <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1" onClick={() => setPreviewPost(post)}>
                            {post.title}
                          </div>
                          <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                            {post.summary || post.excerpt}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            slug: {post.slug}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px] mr-1.5">
                            Lớp {post.grade === 0 ? 'Tất cả' : post.grade}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {post.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{post.authorName || 'Giáo viên IOE'}</div>
                          <div className="text-[10px] text-slate-400">{post.authorRole || 'teacher'}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(post.status)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600">
                          {post.viewCount || 0}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5">
                          {/* Preview */}
                          <button
                            onClick={() => setPreviewPost(post)}
                            title="Xem trước bài viết"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Publish / Unpublish */}
                          {post.status === 'published' ? (
                            <button
                              onClick={() => handleTogglePostStatus(post, 'draft')}
                              title="Hạ bài về bản nháp"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTogglePostStatus(post, 'published')}
                              title="Xuất bản công khai"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditPost(post)}
                            title="Chỉnh sửa bài viết"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Archive / Delete */}
                          <button
                            onClick={() => handleDeletePost(post)}
                            title="Lưu trữ / Xóa bài viết"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= DOCUMENT MANAGEMENT SUBTAB ================= */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => { setDocSearch(e.target.value); setDocPage(1); }}
                  placeholder="Tìm tài liệu, mã đề..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={docStatusFilter}
                onChange={(e) => { setDocStatusFilter(e.target.value); setDocPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản (Published)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>

              <select
                value={docGradeFilter}
                onChange={(e) => { setDocGradeFilter(parseInt(e.target.value, 10)); setDocPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Tất cả khối lớp</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
              </select>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleOpenUploadDoc}
              className="w-full lg:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-95 transition"
            >
              <UploadCloud className="w-4 h-4" />
              Tải lên tài liệu mới
            </button>
          </div>

          {/* Documents Table */}
          {loadingDocs ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-xs font-semibold">Đang tải danh sách tài liệu...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FolderArchive className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">Chưa có tài liệu nào</h3>
              <p className="text-slate-500 text-xs">Hãy nhấn nút "Tải lên tài liệu mới" để lưu trữ và phân phối đề thi cho học sinh.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Tài liệu & Tệp tin</th>
                      <th className="py-3.5 px-4">Khối lớp & Phân loại</th>
                      <th className="py-3.5 px-4">Kích thước</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Lượt tải</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                              {getFileTypeIcon(doc.fileName, doc.mimeType)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {doc.title}
                              </div>
                              <p className="text-slate-500 text-[11px] line-clamp-1">
                                {doc.fileName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[11px] mr-1.5">
                            Lớp {doc.grade === 0 ? 'Tất cả' : doc.grade}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {doc.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600">
                          {formatFileSize(doc.fileSize)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(doc.status)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600">
                          {doc.downloadCount || 0}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5">
                          {/* Test Download */}
                          <a
                            href={`/api/content/documents/${doc.id}/download`}
                            download
                            className="inline-block p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Tải xuống tệp tin"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Quick Publish / Unpublish */}
                          {doc.status === 'published' ? (
                            <button
                              onClick={() => handleToggleDocStatus(doc, 'draft')}
                              title="Hạ tài liệu về bản nháp"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleDocStatus(doc, 'published')}
                              title="Xuất bản tài liệu"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            title="Lưu trữ / Xóa tài liệu"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= QUESTION FACTORY SUBTAB ================= */}
      {activeSubTab === 'factory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <QuestionFactoryView currentGrade={currentUser.grade || 5} />
        </div>
      )}

      {/* ================= AUDIT LOGS SUBTAB ================= */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Nhật Ký Bảo Mật & Hoạt Động Hệ Thống</h2>
            <button
              onClick={loadAuditLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Làm mới nhật ký
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {loadingAudit ? (
              <div className="p-8 text-center text-slate-500 text-xs">Đang tải nhật ký...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">Chưa có nhật ký hoạt động nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Hành động</th>
                      <th className="py-3 px-4">Người thực hiện</th>
                      <th className="py-3 px-4">Đối tượng</th>
                      <th className="py-3 px-4">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono">
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-700' :
                            log.action.includes('PUBLISH') ? 'bg-blue-50 text-blue-700' :
                            log.action.includes('DELETE') ? 'bg-rose-50 text-rose-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-sans">
                          {log.userId}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.resourceType}:{log.resourceId}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-md truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT POST ================= */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingPostId ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
                  </h2>
                  <p className="text-xs text-slate-500">Nội dung sẽ hiển thị cho học sinh sau khi được xuất bản</p>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setPostFormTab('edit')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      postFormTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Soạn thảo
                  </button>
                  <button
                    onClick={() => setPostFormTab('preview')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      postFormTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Xem trước
                  </button>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 flex-1">
              {postFormTab === 'edit' ? (
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Tiêu đề bài viết *
                    </label>
                    <input
                      type="text"
                      value={postFormData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPostFormData(prev => ({
                          ...prev,
                          title: val,
                          slug: prev.slug ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]/g, '-')
                        }));
                      }}
                      placeholder="VD: Bí quyết phân biệt thì Hiện tại đơn và Hiện tại tiếp diễn..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Slug & Metadata Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Đường dẫn tĩnh (Slug)
                      </label>
                      <input
                        type="text"
                        value={postFormData.slug}
                        onChange={(e) => setPostFormData({ ...postFormData, slug: e.target.value })}
                        placeholder="tu-dong-tao-tu-tieu-de"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Khối lớp
                      </label>
                      <select
                        value={postFormData.grade}
                        onChange={(e) => setPostFormData({ ...postFormData, grade: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Tất cả khối lớp</option>
                        <option value={3}>Khối 3 (Tiểu học)</option>
                        <option value={4}>Khối 4 (Tiểu học)</option>
                        <option value={5}>Khối 5 (Tiểu học)</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Chuyên mục
                      </label>
                      <select
                        value={postFormData.category}
                        onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value as PostCategory })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="guide">Hướng dẫn thi IOE</option>
                        <option value="tips">Bí quyết đạt điểm cao</option>
                        <option value="grammar">Ngữ pháp trọng điểm</option>
                        <option value="vocabulary">Từ vựng cốt lõi</option>
                        <option value="exam_strategy">Chiến thuật phòng thi</option>
                        <option value="news">Thông báo & Tin tức</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary / Excerpt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Tóm tắt bài viết (Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={postFormData.summary}
                      onChange={(e) => setPostFormData({ ...postFormData, summary: e.target.value })}
                      placeholder="Mô tả ngắn hiển thị trên thẻ bài viết cho học sinh..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Ảnh bìa bài viết
                    </label>
                    <div className="flex items-center gap-4">
                      {postFormData.thumbnailUrl ? (
                        <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                          <img src={postFormData.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setPostFormData(prev => ({ ...prev, thumbnailUrl: '', coverMediaId: null }))}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-4 py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-2 transition"
                        >
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                          {uploadingCover ? 'Đang tải ảnh...' : 'Tải lên ảnh bìa (PNG, JPG)'}
                        </button>
                      )}
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCoverImage}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Markdown Content */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Nội dung Markdown *
                    </label>
                    <textarea
                      rows={12}
                      value={postFormData.content}
                      onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                      placeholder="Soạn thảo nội dung bài viết bằng định dạng Markdown..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Từ khóa (cách nhau bởi dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={postFormData.tagsString}
                      onChange={(e) => setPostFormData({ ...postFormData, tagsString: e.target.value })}
                      placeholder="ioe, thi-thu, lop-5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* Live Markdown Preview */
                <div className="space-y-6">
                  {postFormData.thumbnailUrl && (
                    <div className="h-56 rounded-2xl overflow-hidden border border-slate-200">
                      <img src={postFormData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h1 className="text-2xl font-black text-slate-900">{postFormData.title || 'Tiêu đề bài viết xem trước'}</h1>
                  <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
                    {postFormData.content.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSavePost('draft')}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Lưu bản nháp (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePost('published')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Xuất bản ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD DOCUMENT ================= */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleUploadDocumentSubmit}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Tải lên tài liệu mới</h2>
                    <p className="text-xs text-slate-500">Hỗ trợ định dạng PDF, DOCX, MP3, ZIP (tối đa 50MB)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* File Drop Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tệp tin đính kèm *
                  </label>
                  <div
                    onClick={() => document.getElementById('doc-file-input')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      selectedDocFile
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-indigo-400 bg-slate-50'
                    }`}
                  >
                    <input
                      id="doc-file-input"
                      type="file"
                      accept=".pdf,.docx,.doc,.mp3,.zip,.rar,.xlsx,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedDocFile(file);
                          if (!docFormData.title) {
                            setDocFormData(prev => ({
                              ...prev,
                              title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
                            }));
                          }
                        }
                      }}
                      className="hidden"
                    />

                    {selectedDocFile ? (
                      <div className="space-y-2">
                        <FileCheck className="w-8 h-8 text-indigo-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">{selectedDocFile.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {formatFileSize(selectedDocFile.size)} • {selectedDocFile.type || 'application/octet-stream'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">Nhấp để chọn hoặc kéo thả tệp tin vào đây</p>
                        <p className="text-[11px] text-slate-400">PDF, Word, MP3 Audio, ZIP</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tên hiển thị của tài liệu *
                  </label>
                  <input
                    type="text"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                    placeholder="VD: Đề thi thử IOE Cấp Quốc Gia Lớp 5 - Năm 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mô tả tài liệu
                  </label>
                  <textarea
                    rows={2}
                    value={docFormData.description}
                    onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                    placeholder="Bao gồm 200 câu hỏi trọng tâm có đáp án và file nghe audio đính kèm..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Grade & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Khối lớp
                    </label>
                    <select
                      value={docFormData.grade}
                      onChange={(e) => setDocFormData({ ...docFormData, grade: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Tất cả khối lớp</option>
                      <option value={3}>Lớp 3</option>
                      <option value={4}>Lớp 4</option>
                      <option value={5}>Lớp 5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phân loại tài liệu
                    </label>
                    <select
                      value={docFormData.category}
                      onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value as DocumentCategory })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="exam_paper">Đề thi chính thức</option>
                      <option value="practice_set">Bộ đề luyện tập</option>
                      <option value="vocabulary_list">Sổ tay từ vựng</option>
                      <option value="grammar_handbook">Cẩm nang ngữ pháp</option>
                      <option value="audio_lesson">File nghe Audio</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={docFormData.status}
                    onChange={(e) => setDocFormData({ ...docFormData, status: e.target.value as ContentStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="published">Xuất bản công khai ngay</option>
                    <option value="draft">Lưu bản nháp</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploadingDoc ? 'Đang lưu tệp lên server...' : 'Tải lên ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW POST ================= */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(previewPost.status)}
                <span className="text-xs text-slate-500 font-medium">Khối {previewPost.grade || 'Tất cả'}</span>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h1 className="text-2xl font-black text-slate-900 leading-tight">{previewPost.title}</h1>
            <p className="text-slate-600 text-xs italic">{previewPost.summary || previewPost.excerpt}</p>

            <div className="prose prose-slate max-w-none text-xs text-slate-800 leading-relaxed space-y-3 border-t border-slate-100 pt-4">
              {previewPost.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
