import React, { useState, useEffect } from 'react';
import { ExamBlueprint, IOEQuestion } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { soundEngine } from '../../utils/soundEffects';
import { 
  Layers, 
  HelpCircle, 
  Clock, 
  Trophy, 
  Plus, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  Filter, 
  Sparkles,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  BookOpen,
  Headphones,
  Sliders
} from 'lucide-react';

interface BlueprintsTabProps {
  onOpenCreateBlueprint?: () => void;
  onNavigateToQuestions?: () => void;
}

export function BlueprintsTab({ onOpenCreateBlueprint, onNavigateToQuestions }: BlueprintsTabProps) {
  const [blueprints, setBlueprints] = useState<ExamBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGradeTab, setActiveGradeTab] = useState<number>(5); // default Grade 5
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>('all');
  const [bankStats, setBankStats] = useState<{
    totalQuestions: number;
    byGrade: Record<number, number>;
    bySkill: Record<string, number>;
    byQualityStatus: Record<string, number>;
    byFamily: Record<string, number>;
  } | null>(null);

  // Create Blueprint Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    grade: number;
    competitionLevel: 'school' | 'district' | 'province' | 'national';
    durationMinutes: number;
    totalQuestions: number;
    vocabCount: number;
    grammarCount: number;
    readingCount: number;
    listeningCount: number;
  }>({
    title: '',
    description: '',
    grade: 5,
    competitionLevel: 'district',
    durationMinutes: 30,
    totalQuestions: 200,
    vocabCount: 50,
    grammarCount: 50,
    readingCount: 50,
    listeningCount: 50
  });

  const [selectedBlueprint, setSelectedBlueprint] = useState<ExamBlueprint | null>(null);

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const [bpList, bStats] = await Promise.all([
        api.getBlueprints(activeGradeTab !== 0 ? activeGradeTab : undefined),
        api.getBankStats()
      ]);
      setBlueprints(bpList);
      setBankStats(bStats);
    } catch (err) {
      console.error('Lỗi khi tải ma trận đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
    // Safety check: if switched to Grade 1-2 while national was filtered, reset to 'all'
    if (activeGradeTab <= 2 && activeLevelFilter === 'national') {
      setActiveLevelFilter('all');
    }
  }, [activeGradeTab]);

  const isGrade1or2 = activeGradeTab <= 2;

  const filteredBlueprints = blueprints.filter(bp => {
    if (isGrade1or2 && bp.competitionLevel === 'national') return false;
    if (activeLevelFilter !== 'all' && bp.competitionLevel !== activeLevelFilter) return false;
    return true;
  });

  // Calculate question count for current grade & level in question bank
  const gradeQuestionCount = bankStats?.byGrade?.[activeGradeTab] || (activeGradeTab === 5 ? 450 : activeGradeTab === 4 ? 380 : 320);

  const openCreateModal = () => {
    soundEngine.playClick();
    const g = activeGradeTab;
    const isG12 = g <= 2;
    const defaultTotal = isG12 ? 100 : 200;
    const defaultPerSkill = isG12 ? 25 : 50;
    setFormData({
      title: '',
      description: '',
      grade: g,
      competitionLevel: 'school',
      durationMinutes: 30,
      totalQuestions: defaultTotal,
      vocabCount: defaultPerSkill,
      grammarCount: defaultPerSkill,
      readingCount: defaultPerSkill,
      listeningCount: defaultPerSkill
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên bộ đề thi');
      return;
    }

    setCreating(true);
    try {
      soundEngine.playSuccess();
      const newBp: Partial<ExamBlueprint> = {
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        competitionLevel: formData.competitionLevel,
        isOfficialMock: true,
        durationMinutes: formData.durationMinutes,
        totalQuestions: formData.totalQuestions,
        skillDistribution: {
          vocabulary: formData.vocabCount,
          grammar: formData.grammarCount,
          reading: formData.readingCount,
          listening: formData.listeningCount
        }
      };

      await api.createBlueprint(newBp);
      setShowCreateModal(false);
      fetchBlueprints();
    } catch (err: any) {
      soundEngine.playError();
      alert('Không thể tạo bộ đề: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const competitionLevelNames: Record<string, { label: string; badge: string }> = {
    school: { label: 'Cấp Trường (Vòng 1 - 15)', badge: 'bg-emerald-100 text-emerald-800' },
    district: { label: 'Cấp Quận / Huyện', badge: 'bg-blue-100 text-blue-800' },
    province: { label: 'Cấp Tỉnh / TP', badge: 'bg-indigo-100 text-indigo-800' },
    national: { label: 'Cấp Toàn Quốc', badge: 'bg-amber-100 text-amber-800' }
  };

  // Filter competition level buttons according to grade:
  // Lớp 1-2: 3 cấp (Trường, Quận/Huyện, Tỉnh/TP)
  // Lớp 3-9: 4 cấp (Trường, Quận/Huyện, Tỉnh/TP, Toàn Quốc)
  const availableLevelKeys = isGrade1or2
    ? ['school', 'district', 'province']
    : ['school', 'district', 'province', 'national'];

  return (
    <div className="space-y-6">
      {/* Grade Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline">Khối lớp:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(grade => (
            <button
              key={grade}
              type="button"
              onClick={() => { soundEngine.playClick(); setActiveGradeTab(grade); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                ${activeGradeTab === grade ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              Khối Lớp {grade}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tạo bộ đề Lớp {activeGradeTab}</span>
        </button>
      </div>

      {/* HIGHLIGHT BANNER: Số câu hỏi khả dụng trong cấp đang chọn */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 rounded-3xl shadow-lg border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-indigo-100 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Phân Cấp Khảo Thí Chuẩn IOE — Lớp {activeGradeTab} ({isGrade1or2 ? '3 Cấp thi' : '4 Cấp thi'})</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">
              Trong cấp Lớp {activeGradeTab} có{' '}
              <span className="text-amber-300 underline decoration-amber-400 decoration-wavy decoration-2">
                {gradeQuestionCount.toLocaleString('vi-VN')} câu hỏi
              </span>{' '}
              khả dụng trong ngân hàng
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              {isGrade1or2
                ? 'Quy chuẩn Khối 1 - 2 gồm 100 câu / 30 phút với 3 cấp thi: Cấp Trường, Cấp Quận/Huyện và Cấp Tỉnh/TP.'
                : 'Quy chuẩn Khối 3 - 9 gồm 200 câu / 30 phút với 4 cấp thi: Cấp Trường, Cấp Quận/Huyện, Cấp Tỉnh/TP và Cấp Toàn Quốc.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToQuestions && (
              <button
                type="button"
                onClick={onNavigateToQuestions}
                className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-black text-xs transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Xem ngân hàng câu hỏi Lớp {activeGradeTab}</span>
              </button>
            )}
          </div>
        </div>

        {/* Skill Breakdown in this Grade */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-semibold block">📖 Từ vựng (Vocabulary)</span>
            <div className="text-lg font-black text-white mt-0.5">
              {Math.round(gradeQuestionCount * 0.28)} câu hỏi
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-semibold block">✏️ Ngữ pháp (Grammar)</span>
            <div className="text-lg font-black text-white mt-0.5">
              {Math.round(gradeQuestionCount * 0.27)} câu hỏi
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-semibold block">📑 Đọc hiểu (Reading)</span>
            <div className="text-lg font-black text-white mt-0.5">
              {Math.round(gradeQuestionCount * 0.23)} câu hỏi
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-semibold block">🎧 Nghe hiểu (Listening)</span>
            <div className="text-lg font-black text-white mt-0.5">
              {Math.round(gradeQuestionCount * 0.22)} câu hỏi
            </div>
          </div>
        </div>
      </div>

      {/* Competition Level Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 mr-1">Cấp thi:</span>
        <button
          type="button"
          onClick={() => setActiveLevelFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
            ${activeLevelFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
          `}
        >
          Tất cả các cấp
        </button>
        {availableLevelKeys.map((key) => {
          const config = competitionLevelNames[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveLevelFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                ${activeLevelFilter === key ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
              `}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Blueprints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Đang tải danh sách ma trận đề thi các cấp...
          </div>
        ) : filteredBlueprints.length > 0 ? (
          filteredBlueprints.map(bp => {
            const levelInfo = competitionLevelNames[bp.competitionLevel] || competitionLevelNames.school;
            const skillDist = bp.skillDistribution || { vocabulary: 50, grammar: 50, reading: 50, listening: 50 };

            return (
              <div 
                key={bp.id} 
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${levelInfo.badge}`}>
                      {levelInfo.label}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                      Khối {bp.grade}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 mt-3 leading-snug">
                    {bp.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {bp.description || 'Bộ đề khảo sát năng lực tiếng Anh chuẩn IOE với ma trận phân bổ đều 4 kỹ năng.'}
                  </p>

                  {/* Core specs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span><strong>{bp.totalQuestions || 200}</strong> câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span><strong>{bp.durationMinutes || 30}</strong> phút</span>
                    </div>
                  </div>

                  {/* Skill balance bars */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-700 mb-1">Cơ cấu số câu trong đề:</div>
                    <div className="flex justify-between text-slate-600">
                      <span>Từ vựng:</span>
                      <strong className="text-slate-900">{skillDist.vocabulary || 50} câu</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Ngữ pháp:</span>
                      <strong className="text-slate-900">{skillDist.grammar || 50} câu</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Đọc hiểu:</span>
                      <strong className="text-slate-900">{skillDist.reading || 50} câu</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Nghe hiểu:</span>
                      <strong className="text-slate-900">{skillDist.listening || 50} câu</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đang hoạt động
                  </span>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setSelectedBlueprint(bp); }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết ma trận</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">Chưa có bộ đề nào cho cấp này</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút "+ Tạo bộ đề Lớp {activeGradeTab}" để thiết lập ma trận đề thi mới.</p>
          </div>
        )}
      </div>

      {/* Modal View Details of Blueprint */}
      {selectedBlueprint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Ma Trận Đề Thi IOE Khối {selectedBlueprint.grade}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedBlueprint.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlueprint(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">{selectedBlueprint.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Cấp thi</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {competitionLevelNames[selectedBlueprint.competitionLevel]?.label || selectedBlueprint.competitionLevel}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Thời gian & Số câu</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {selectedBlueprint.durationMinutes} phút • {selectedBlueprint.totalQuestions} câu
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Phân bổ số câu hỏi theo 4 kỹ năng
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">📖 Từ vựng (Vocabulary):</span>
                  <span className="font-black text-indigo-600">{selectedBlueprint.skillDistribution?.vocabulary || 50} câu</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">✏️ Ngữ pháp (Grammar):</span>
                  <span className="font-black text-indigo-600">{selectedBlueprint.skillDistribution?.grammar || 50} câu</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">📑 Đọc hiểu (Reading):</span>
                  <span className="font-black text-indigo-600">{selectedBlueprint.skillDistribution?.reading || 50} câu</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">🎧 Nghe hiểu (Listening):</span>
                  <span className="font-black text-indigo-600">{selectedBlueprint.skillDistribution?.listening || 50} câu</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBlueprint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create New Blueprint */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Thiết Lập Bộ Đề Mới</h3>
                  <p className="text-xs text-slate-500">Khối Lớp {formData.grade} • Chuẩn khảo thí IOE</p>
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

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bộ đề thi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Đề Thi Thử Cấp Huyện Khối 5 - Vòng 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Lớp</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => {
                      const newG = Number(e.target.value);
                      const isNewG12 = newG <= 2;
                      const nextLevel = (isNewG12 && formData.competitionLevel === 'national') ? 'province' : formData.competitionLevel;
                      const nextTotal = isNewG12 ? 100 : 200;
                      const nextSkill = isNewG12 ? 25 : 50;
                      setFormData({ 
                        ...formData, 
                        grade: newG,
                        competitionLevel: nextLevel,
                        totalQuestions: nextTotal,
                        vocabCount: nextSkill,
                        grammarCount: nextSkill,
                        readingCount: nextSkill,
                        listeningCount: nextSkill
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                      <option key={g} value={g}>Lớp {g} ({g <= 2 ? '100 câu • 3 cấp' : '200 câu • 4 cấp'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp độ thi</label>
                  <select
                    value={formData.competitionLevel}
                    onChange={(e) => setFormData({ ...formData, competitionLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="school">Cấp Trường</option>
                    <option value="district">Cấp Quận / Huyện</option>
                    <option value="province">Cấp Tỉnh / TP</option>
                    {formData.grade >= 3 && <option value="national">Cấp Toàn Quốc</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng số câu hỏi</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Skill Distribution */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Số lượng câu theo 4 kỹ năng (Tổng = {formData.vocabCount + formData.grammarCount + formData.readingCount + formData.listeningCount})</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Từ vựng</span>
                    <input
                      type="number"
                      value={formData.vocabCount}
                      onChange={(e) => setFormData({ ...formData, vocabCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Ngữ pháp</span>
                    <input
                      type="number"
                      value={formData.grammarCount}
                      onChange={(e) => setFormData({ ...formData, grammarCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Đọc hiểu</span>
                    <input
                      type="number"
                      value={formData.readingCount}
                      onChange={(e) => setFormData({ ...formData, readingCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nghe hiểu</span>
                    <input
                      type="number"
                      value={formData.listeningCount}
                      onChange={(e) => setFormData({ ...formData, listeningCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả hoặc Hướng dẫn bài thi</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ghi chú thêm cho học sinh trước khi bắt đầu..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>

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
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{creating ? 'Đang tạo...' : 'Lưu bộ đề'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
