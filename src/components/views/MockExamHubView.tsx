import React, { useState, useEffect } from 'react';
import { ExamBlueprint, IOECompetitionLevel } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { Trophy, Clock, CheckCircle2, Award, Play, Sparkles, Filter, ShieldAlert, BookOpen } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface MockExamHubViewProps {
  currentGrade: number;
  onStartExam: (blueprint: ExamBlueprint) => void;
}

export const MockExamHubView: React.FC<MockExamHubViewProps> = ({
  currentGrade,
  onStartExam
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(currentGrade || 5);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [blueprints, setBlueprints] = useState<ExamBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Standard exam length based on user prompt requirements:
  // Lớp 1-2: 100 câu / 30 phút
  // Lớp 3-9: 200 câu / 30 phút
  const standardQuestionCount = selectedGrade <= 2 ? 100 : 200;
  const maxExamScore = standardQuestionCount * 10;

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const list = await api.getBlueprints(selectedGrade);
        setBlueprints(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedGrade]);

  const handleSelectBlueprint = (bp: ExamBlueprint) => {
    soundEngine.playClick();
    onStartExam(bp);
  };

  const handleStartAIGeneratedExam = (level: IOECompetitionLevel = 'school') => {
    soundEngine.playClick();
    const levelNames: Record<string, string> = {
      school: 'Cấp Trường (Vòng 1 - 15)',
      district: 'Cấp Quận/Huyện (Vòng 20)',
      province: 'Cấp Tỉnh/TP (Vòng 25)',
      national: 'Cấp Toàn Quốc (Vòng 30)'
    };

    const dynamicBp: ExamBlueprint = {
      id: `bp-ai-gen-${selectedGrade}-${level}-${Date.now()}`,
      title: `Đề Thi Thử AI Ngẫu Nhiên - Khối ${selectedGrade} (${levelNames[level] || 'Toàn Diện'})`,
      description: `Đề thi được AI chọn ngẫu nhiên ${standardQuestionCount} câu hỏi không trùng lặp theo độ khó ${levelNames[level] || 'chuẩn IOE'}. Thời gian làm bài 30 phút.`,
      grade: selectedGrade,
      competitionLevel: level,
      isOfficialMock: true,
      durationMinutes: 30,
      totalQuestions: standardQuestionCount,
      skillDistribution: {
        vocabulary: Math.round(standardQuestionCount * 0.4),
        grammar: Math.round(standardQuestionCount * 0.35),
        reading: Math.round(standardQuestionCount * 0.15),
        listening: Math.round(standardQuestionCount * 0.1)
      },
      difficultyDistribution: level === 'school' 
        ? { 1: Math.round(standardQuestionCount * 0.5), 2: Math.round(standardQuestionCount * 0.4), 3: Math.round(standardQuestionCount * 0.1) }
        : level === 'district'
        ? { 1: Math.round(standardQuestionCount * 0.3), 2: Math.round(standardQuestionCount * 0.5), 3: Math.round(standardQuestionCount * 0.2) }
        : level === 'province'
        ? { 1: Math.round(standardQuestionCount * 0.2), 2: Math.round(standardQuestionCount * 0.4), 3: Math.round(standardQuestionCount * 0.3), 4: Math.round(standardQuestionCount * 0.1) }
        : { 1: Math.round(standardQuestionCount * 0.1), 2: Math.round(standardQuestionCount * 0.3), 3: Math.round(standardQuestionCount * 0.4), 4: Math.round(standardQuestionCount * 0.2) },
      createdAt: new Date().toISOString()
    };

    onStartExam(dynamicBp);
  };

  // Filter blueprints by level
  const filteredBlueprints = blueprints.filter(bp => {
    if (selectedLevel === 'all') return true;
    return bp.competitionLevel === selectedLevel;
  });

  const competitionLevels = [
    { id: 'all', label: 'Tất cả các cấp', icon: BookOpen, desc: 'Toàn bộ đề thi thử' },
    { id: 'school', label: 'Cấp Trường', icon: Trophy, desc: 'Vòng Tự Luyện & Cấp Trường (Dễ & Nhận biết)' },
    { id: 'district', label: 'Cấp Quận/Huyện', icon: Award, desc: 'Vòng Cấp Huyện (Thông hiểu & Vận dụng)' },
    { id: 'province', label: 'Cấp Tỉnh/TP', icon: Sparkles, desc: 'Vòng Cấp Tỉnh (Vận dụng & Phân hóa)' },
    { id: 'national', label: 'Cấp Toàn Quốc', icon: Trophy, desc: 'Vòng Chung Kết Quốc Gia (Vận dụng cao)' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-900 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 z-10 relative">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Phòng thi IOE chuẩn Quốc Gia</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Thi Thử IOE Trực Tuyến — Khối {selectedGrade}
          </h1>
          <p className="text-white/95 text-sm md:text-base leading-relaxed">
            Quy chuẩn IOE: <strong className="text-amber-200">{selectedGrade <= 2 ? 'Lớp 1 - 2 gồm 100 câu' : 'Lớp 3 - 9 gồm 200 câu'}</strong> trong thời gian <strong className="text-amber-200">30 phút</strong>. Câu hỏi được thuật toán AI chọn ngẫu nhiên theo ma trận độ khó từng cấp thi, đảm bảo không bị trùng lặp.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-white/25 px-3 py-1 rounded-lg">
              ⏱️ Thời gian: 30 phút
            </span>
            <span className="bg-white/25 px-3 py-1 rounded-lg">
              🎯 Số lượng: {standardQuestionCount} câu
            </span>
            <span className="bg-white/25 px-3 py-1 rounded-lg">
              🏆 Điểm tối đa: {maxExamScore} điểm
            </span>
          </div>
        </div>
      </div>

      {/* Grade Selector (Grades 1 to 9 + 10,11,12) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chọn khối lớp dự thi:
          </div>
          <div className="text-xs text-indigo-600 font-semibold">
            {selectedGrade <= 2 ? '⚡ Lớp 1 - 2: 100 câu / 30 phút' : '⚡ Lớp 3 - 9: 200 câu / 30 phút'}
          </div>
        </div>

        {/* Primary Grades 1 - 5 */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400">Khối Tiểu Học:</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center space-x-1.5
                  ${selectedGrade === g
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-200 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                `}
              >
                <span>Lớp {g}</span>
                <span className="text-[10px] opacity-80 font-normal">
                  ({g <= 2 ? '100 câu' : '200 câu'})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Grades 6 - 9 */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400">Khối THCS (Trung Học Cơ Sở):</div>
          <div className="flex flex-wrap gap-2">
            {[6, 7, 8, 9].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center space-x-1.5
                  ${selectedGrade === g
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-200 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                `}
              >
                <span>Lớp {g}</span>
                <span className="text-[10px] opacity-80 font-normal">(200 câu)</span>
              </button>
            ))}
          </div>
        </div>

        {/* High School Grades 10 - 12 */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400">Khối THPT:</div>
          <div className="flex flex-wrap gap-2">
            {[10, 11, 12].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer
                  ${selectedGrade === g
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                `}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fast AI Random Exam Generator Action */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 rounded-2xl p-6 border-2 border-indigo-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Thuật toán tạo đề thi AI ngẫu nhiên</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Tạo đề thi mới tự động (Khối {selectedGrade} • {standardQuestionCount} câu • 30 phút)
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            AI tự động quét ngân hàng câu hỏi, chọn ngẫu nhiên các câu hỏi theo đúng ma trận độ khó bạn mong muốn và đảm bảo câu hỏi không trùng lặp so với các lần thi trước.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('school')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Trường</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('district')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Huyện</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('province')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Tỉnh/QG</span>
          </button>
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Danh sách các đề thi mẫu theo cấp độ:</h2>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {competitionLevels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer
                  ${selectedLevel === lvl.id ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Đang tải danh sách đề thi...</div>
        ) : filteredBlueprints.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-3">
            <p>Không tìm thấy đề thi mẫu theo bộ lọc hiện tại.</p>
            <button
              type="button"
              onClick={() => handleStartAIGeneratedExam('school')}
              className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Bấm vào đây để AI tạo đề thi mới ngay lập tức
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlueprints.map((bp) => {
              const levelBadge = bp.competitionLevel === 'national' 
                ? { label: 'Cấp Toàn Quốc', color: 'bg-rose-100 text-rose-800 border-rose-200' }
                : bp.competitionLevel === 'province'
                ? { label: 'Cấp Tỉnh/TP', color: 'bg-purple-100 text-purple-800 border-purple-200' }
                : bp.competitionLevel === 'district'
                ? { label: 'Cấp Quận/Huyện', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                : { label: 'Cấp Trường', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

              return (
                <div
                  key={bp.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${levelBadge.color}`}>
                          {levelBadge.label}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                          {bp.totalQuestions} câu
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {bp.durationMinutes} phút
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {bp.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {bp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-600 font-semibold">
                      Điểm tối đa: <span className="text-amber-700 font-bold">{bp.totalQuestions * 10} điểm</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectBlueprint(bp)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Vào thi ngay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
