import React, { useState, useEffect } from 'react';
import { IOEQuestion, IOESkill, InteractionFamily } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { soundEngine } from '../../utils/soundEffects';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Headphones, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Volume2, 
  X, 
  Check, 
  RefreshCw,
  Clock,
  Layers,
  Star,
  ChevronDown
} from 'lucide-react';

interface QuestionBankTabProps {
  onOpenAIFactory?: () => void;
}

export function QuestionBankTab({ onOpenAIFactory }: QuestionBankTabProps) {
  const [questions, setQuestions] = useState<IOEQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [gradeFilter, setGradeFilter] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<IOEQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<IOEQuestion | null>(null);

  // Form State for creating/editing question
  const [formData, setFormData] = useState<{
    grade: number;
    skill: IOESkill;
    family: InteractionFamily;
    difficulty: 1 | 2 | 3 | 4 | 5;
    topic: string;
    prompt: string;
    passage: string;
    audioUrl: string;
    imageUrl: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string; // 'opt_a' | 'opt_b' | 'opt_c' | 'opt_d'
    textAnswer: string; // for fill blank or ordering
    explanation: string;
    vietnameseMeaning: string;
  }>({
    grade: 5,
    skill: 'vocabulary',
    family: 'choice',
    difficulty: 2,
    topic: 'School & Daily Life',
    prompt: '',
    passage: '',
    audioUrl: '',
    imageUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'opt_a',
    textAnswer: '',
    explanation: '',
    vietnameseMeaning: ''
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getQuestions({
        grade: gradeFilter !== 0 ? gradeFilter : undefined,
        skill: skillFilter !== 'all' ? skillFilter : undefined,
        family: familyFilter !== 'all' ? familyFilter : undefined,
        search: search || undefined,
        limit: 15,
        offset: (page - 1) * 15
      });
      setQuestions(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Lỗi khi tải câu hỏi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [gradeFilter, skillFilter, familyFilter, search, page]);

  const openCreateModal = () => {
    soundEngine.playClick();
    setEditingQuestion(null);
    setFormData({
      grade: gradeFilter !== 0 ? gradeFilter : 5,
      skill: 'vocabulary',
      family: 'choice',
      difficulty: 2,
      topic: 'School & Everyday Objects',
      prompt: '',
      passage: '',
      audioUrl: '',
      imageUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'opt_a',
      textAnswer: '',
      explanation: '',
      vietnameseMeaning: ''
    });
    setShowCreateModal(true);
  };

  const openEditModal = (q: IOEQuestion) => {
    soundEngine.playClick();
    setEditingQuestion(q);
    const opts = q.options || [];
    setFormData({
      grade: q.grade,
      skill: q.skill,
      family: q.interaction.family,
      difficulty: q.difficulty,
      topic: q.topic || 'General',
      prompt: q.prompt,
      passage: q.passage || '',
      audioUrl: q.audioUrl || '',
      imageUrl: q.imageUrl || '',
      optionA: opts[0]?.text || '',
      optionB: opts[1]?.text || '',
      optionC: opts[2]?.text || '',
      optionD: opts[3]?.text || '',
      correctOption: q.answer?.correctOptionId || 'opt_a',
      textAnswer: q.answer?.acceptedAnswers?.[0] || '',
      explanation: q.answer?.explanation || '',
      vietnameseMeaning: q.answer?.vietnameseMeaning || ''
    });
    setShowCreateModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setSaving(true);
    try {
      const isChoice = formData.family === 'choice';
      const questionPayload: Partial<IOEQuestion> = {
        grade: formData.grade,
        skill: formData.skill,
        topic: formData.topic,
        difficulty: formData.difficulty,
        prompt: formData.prompt,
        passage: formData.passage || undefined,
        audioUrl: formData.audioUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
        interaction: {
          family: formData.family,
          subtype: isChoice ? 'single' : 'fill-blank'
        },
        qualityStatus: 'approved',
        answer: {
          correctOptionId: isChoice ? formData.correctOption : undefined,
          acceptedAnswers: !isChoice && formData.textAnswer ? [formData.textAnswer.trim().toLowerCase()] : undefined,
          explanation: formData.explanation || undefined,
          vietnameseMeaning: formData.vietnameseMeaning || undefined
        }
      };

      if (isChoice) {
        questionPayload.options = [
          { id: 'opt_a', label: 'A', text: formData.optionA || 'Lựa chọn A' },
          { id: 'opt_b', label: 'B', text: formData.optionB || 'Lựa chọn B' },
          { id: 'opt_c', label: 'C', text: formData.optionC || 'Lựa chọn C' },
          { id: 'opt_d', label: 'D', text: formData.optionD || 'Lựa chọn D' }
        ];
      }

      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, questionPayload);
        soundEngine.playSuccess();
      } else {
        await api.createQuestion(questionPayload);
        soundEngine.playSuccess();
      }

      setShowCreateModal(false);
      fetchQuestions();
    } catch (err: any) {
      soundEngine.playError();
      alert('Lỗi lưu câu hỏi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) return;
    soundEngine.playClick();
    try {
      await api.deleteQuestion(id);
      fetchQuestions();
    } catch (err: any) {
      alert('Không thể xóa câu hỏi: ' + err.message);
    }
  };

  const skillMeta: Record<string, { label: string; badge: string }> = {
    vocabulary: { label: 'Từ vựng', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    grammar: { label: 'Ngữ pháp', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    reading: { label: 'Đọc hiểu', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    listening: { label: 'Nghe hiểu', badge: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  const familyMeta: Record<string, string> = {
    choice: 'Trắc nghiệm (Choice)',
    'text-entry': 'Điền từ / Điền chữ',
    ordering: 'Sắp xếp từ',
    matching: 'Nối cặp từ',
    listening: 'Nghe chọn đáp án'
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Ngân Hàng Câu Hỏi & Đăng Soạn Đề Chuẩn IOE
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Giáo viên có thể trực tiếp soạn câu hỏi trắc nghiệm, điền từ, nghe audio hoặc dùng AI sinh đề tự động.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenAIFactory && (
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); onOpenAIFactory(); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Soạn đề tự động</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đăng câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Multi-filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo nội dung câu hỏi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Grade filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => { setGradeFilter(Number(e.target.value)); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value={0}>Tất cả khối lớp</option>
              {[3, 4, 5, 6, 7, 8, 9].map(g => (
                <option key={g} value={g}>Khối Lớp {g}</option>
              ))}
            </select>
          </div>

          {/* Skill filter */}
          <div>
            <select
              value={skillFilter}
              onChange={(e) => { setSkillFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả kỹ năng</option>
              <option value="vocabulary">Từ vựng (Vocabulary)</option>
              <option value="grammar">Ngữ pháp (Grammar)</option>
              <option value="reading">Đọc hiểu (Reading)</option>
              <option value="listening">Nghe hiểu (Listening)</option>
            </select>
          </div>

          {/* Interaction family filter */}
          <div>
            <select
              value={familyFilter}
              onChange={(e) => { setFamilyFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả dạng câu hỏi</option>
              <option value="choice">Trắc nghiệm 4 đáp án</option>
              <option value="text-entry">Điền từ vào chỗ trống</option>
              <option value="ordering">Sắp xếp từ đảo</option>
              <option value="matching">Nối cặp từ / ảnh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              Danh sách câu hỏi trong ngân hàng ({total.toLocaleString('vi-VN')} câu)
            </span>
            <span className="text-xs text-slate-400">
              (Hiển thị {questions.length} trên trang {page})
            </span>
          </div>
          <button
            type="button"
            onClick={fetchQuestions}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold w-16">Khối</th>
                <th className="py-3 px-4 font-bold w-28">Kỹ năng</th>
                <th className="py-3 px-4 font-bold">Nội dung câu hỏi (Prompt)</th>
                <th className="py-3 px-4 font-bold w-32">Dạng câu</th>
                <th className="py-3 px-4 font-bold w-20 text-center">Độ khó</th>
                <th className="py-3 px-4 font-bold w-24 text-center">Media</th>
                <th className="py-3 px-4 font-bold text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải danh sách câu hỏi...
                  </td>
                </tr>
              ) : questions.length > 0 ? (
                questions.map((q) => {
                  const sm = skillMeta[q.skill] || skillMeta.vocabulary;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-black text-indigo-700">
                        Lớp {q.grade}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${sm.badge}`}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{q.prompt}</div>
                        {q.topic && (
                          <div className="text-[11px] text-slate-400 mt-0.5">Chủ đề: {q.topic}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {familyMeta[q.interaction.family] || q.interaction.family}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center font-black text-amber-500 gap-0.5">
                          {q.difficulty} <Star className="w-3 h-3 fill-amber-400" />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          {q.audioUrl && <Volume2 className="w-3.5 h-3.5 text-amber-500" title="Có âm thanh audio" />}
                          {q.imageUrl && <ImageIcon className="w-3.5 h-3.5 text-blue-500" title="Có ảnh minh họa" />}
                          {!q.audioUrl && !q.imageUrl && <span>—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => { soundEngine.playClick(); setPreviewQuestion(q); }}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem trước câu hỏi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(q)}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng số {total} câu hỏi</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-bold cursor-pointer"
              >
                Trang trước
              </button>
              <span className="font-bold text-slate-800">Trang {page} / {Math.ceil(total / 15)}</span>
              <button
                type="button"
                disabled={page >= Math.ceil(total / 15)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-bold cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview Question */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg">
                  Lớp {previewQuestion.grade}
                </span>
                <span className="font-bold text-xs text-slate-500">
                  {familyMeta[previewQuestion.interaction.family] || previewQuestion.interaction.family}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Card Visual */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              {previewQuestion.passage && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs italic text-slate-700 max-h-36 overflow-y-auto">
                  {previewQuestion.passage}
                </div>
              )}

              <div className="text-sm font-black text-slate-900 leading-relaxed">
                {previewQuestion.prompt}
              </div>

              {previewQuestion.imageUrl && (
                <img
                  src={previewQuestion.imageUrl}
                  alt="Minh họa"
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                />
              )}

              {previewQuestion.audioUrl && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold">
                  <Volume2 className="w-4 h-4" />
                  <span>Audio kèm theo: {previewQuestion.audioUrl}</span>
                </div>
              )}

              {/* Options if choice */}
              {previewQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {previewQuestion.options.map((opt) => {
                    const isCorrect = opt.id === previewQuestion.answer?.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-between ${
                          isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.label}. {opt.text}</span>
                        {isCorrect && <Check className="w-4 h-4 text-emerald-600 font-black" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Accepted answers if text-entry */}
              {previewQuestion.answer?.acceptedAnswers && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-800 block">Đáp án chính xác:</span>
                  <span className="font-black text-emerald-900">{previewQuestion.answer.acceptedAnswers.join(' / ')}</span>
                </div>
              )}

              {/* Explanation & Vietnamese Meaning */}
              {(previewQuestion.answer?.explanation || previewQuestion.answer?.vietnameseMeaning) && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs text-slate-600">
                  {previewQuestion.answer.explanation && (
                    <p><strong>Giải thích:</strong> {previewQuestion.answer.explanation}</p>
                  )}
                  {previewQuestion.answer.vietnameseMeaning && (
                    <p><strong>Dịch nghĩa:</strong> {previewQuestion.answer.vietnameseMeaning}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewQuestion(null);
                  openEditModal(previewQuestion);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs cursor-pointer"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Edit Question */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Đăng Soạn Câu Hỏi Mới Chuẩn IOE'}
                  </h3>
                  <p className="text-xs text-slate-500">Giáo viên trực tiếp bổ sung nội dung vào ngân hàng đề</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Row 1: Grade, Skill, Interaction Family, Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Lớp *</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    {[3, 4, 5, 6, 7, 8, 9].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỹ năng *</label>
                  <select
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="vocabulary">Từ vựng</option>
                    <option value="grammar">Ngữ pháp</option>
                    <option value="reading">Đọc hiểu</option>
                    <option value="listening">Nghe hiểu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dạng tương tác *</label>
                  <select
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="choice">Trắc nghiệm 4 lựa chọn</option>
                    <option value="text-entry">Điền từ vào chỗ trống</option>
                    <option value="ordering">Sắp xếp từ đảo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    <option value={1}>1 sao (Nhận biết)</option>
                    <option value={2}>2 sao (Thông hiểu)</option>
                    <option value={3}>3 sao (Vận dụng)</option>
                    <option value={4}>4 sao (Vận dụng cao)</option>
                  </select>
                </div>
              </div>

              {/* Topic & Prompt */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ đề bài học (Topic)</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ví dụ: Animals, School Activities, Daily Routines..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi (Prompt) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Nhập đề bài câu hỏi tiếng Anh, ví dụ: What time do you usually get up in the morning?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Options for Choice questions */}
              {formData.family === 'choice' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">4 Lựa chọn trả lời & Chọn đáp án đúng:</span>
                    <span className="text-[11px] text-indigo-600 font-bold">Tick chọn nút tròn đáp án đúng</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        id="opt_a_radio"
                        name="correctOpt"
                        checked={formData.correctOption === 'opt_a'}
                        onChange={() => setFormData({ ...formData, correctOption: 'opt_a' })}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="opt_a_radio" className="font-bold text-slate-600 w-4">A:</label>
                      <input
                        type="text"
                        required
                        value={formData.optionA}
                        onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                        placeholder="Nội dung đáp án A"
                        className="flex-1 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        id="opt_b_radio"
                        name="correctOpt"
                        checked={formData.correctOption === 'opt_b'}
                        onChange={() => setFormData({ ...formData, correctOption: 'opt_b' })}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="opt_b_radio" className="font-bold text-slate-600 w-4">B:</label>
                      <input
                        type="text"
                        required
                        value={formData.optionB}
                        onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                        placeholder="Nội dung đáp án B"
                        className="flex-1 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        id="opt_c_radio"
                        name="correctOpt"
                        checked={formData.correctOption === 'opt_c'}
                        onChange={() => setFormData({ ...formData, correctOption: 'opt_c' })}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="opt_c_radio" className="font-bold text-slate-600 w-4">C:</label>
                      <input
                        type="text"
                        required
                        value={formData.optionC}
                        onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                        placeholder="Nội dung đáp án C"
                        className="flex-1 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        id="opt_d_radio"
                        name="correctOpt"
                        checked={formData.correctOption === 'opt_d'}
                        onChange={() => setFormData({ ...formData, correctOption: 'opt_d' })}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="opt_d_radio" className="font-bold text-slate-600 w-4">D:</label>
                      <input
                        type="text"
                        required
                        value={formData.optionD}
                        onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                        placeholder="Nội dung đáp án D"
                        className="flex-1 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text answer if fill-blank or ordering */}
              {formData.family !== 'choice' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">Đáp án đúng chính xác *</label>
                  <input
                    type="text"
                    required
                    value={formData.textAnswer}
                    onChange={(e) => setFormData({ ...formData, textAnswer: e.target.value })}
                    placeholder="Nhập từ hoặc câu chuẩn học sinh cần điền / sắp xếp"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Media: Audio & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Đường dẫn Audio (URL MP3)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Đường dẫn Ảnh minh họa (URL)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Explanation & Vietnamese Meaning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giải thích đáp án chi tiết</label>
                  <textarea
                    rows={2}
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Lý do chọn đáp án này, cấu trúc ngữ pháp tương ứng..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dịch nghĩa tiếng Việt</label>
                  <textarea
                    rows={2}
                    value={formData.vietnameseMeaning}
                    onChange={(e) => setFormData({ ...formData, vietnameseMeaning: e.target.value })}
                    placeholder="Bản dịch tiếng Việt giúp học sinh hiểu sâu..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Đang lưu...' : (editingQuestion ? 'Cập nhật câu hỏi' : 'Đăng lên ngân hàng')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
