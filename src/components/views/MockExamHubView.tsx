import React, { useState, useEffect } from 'react';
import { ExamBlueprint, IOECompetitionLevel } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { Trophy, Clock, CheckCircle2, Award, Play, Sparkles, Filter, ShieldAlert, BookOpen } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface MockExamHubViewProps {
  currentGrade: number;
  onStartExam: (blueprint: ExamBlueprint) => void;
}

// Standard templates for each grade ensuring full coverage of competition levels:
// Lớp 1 - 2: 3 cấp thi (Cấp Trường, Cấp Quận/Huyện, Cấp Tỉnh/TP) • 100 câu / 30 phút
// Lớp 3 - 9: 4 cấp thi (Cấp Trường, Cấp Quận/Huyện, Cấp Tỉnh/TP, Cấp Toàn Quốc) • 200 câu / 30 phút
function getStandardBlueprintsForGrade(grade: number): ExamBlueprint[] {
  const isG12 = grade <= 2;
  const totalQuestions = isG12 ? 100 : 200;

  const baseLevels: {
    level: IOECompetitionLevel;
    title: string;
    desc: string;
    diff: Record<number, number>;
  }[] = [
    {
      level: 'school',
      title: `IOE Lớp ${grade} - Cấp Trường (${totalQuestions} câu / 30 phút)`,
      desc: isG12
        ? `Đề thi IOE Khối ${grade} Cấp Trường chuẩn 100 câu trong 30 phút. Bám sát ma trận từ vựng hình ảnh, số đếm, màu sắc và mẫu câu cơ bản.`
        : `Đề thi IOE Khối ${grade} Cấp Trường chuẩn 200 câu trong 30 phút. Tổng hợp toàn diện kiến thức ngữ pháp, từ vựng và kỹ năng đọc hiểu.`,
      diff: isG12 ? { 1: 60, 2: 30, 3: 10 } : { 1: 80, 2: 80, 3: 35, 4: 5 }
    },
    {
      level: 'district',
      title: `IOE Lớp ${grade} - Cấp Quận/Huyện (${totalQuestions} câu / 30 phút)`,
      desc: isG12
        ? `Đề thi IOE Khối ${grade} Cấp Quận/Huyện chuẩn 100 câu / 30 phút. Nâng cao mẫu câu giao tiếp, nghe phản xạ và điền chữ cái còn thiếu.`
        : `Đề thi IOE Khối ${grade} Cấp Quận/Huyện chuẩn 200 câu / 30 phút. Tăng cường kỹ năng đọc hiểu, sắp xếp câu và ngữ pháp mở rộng.`,
      diff: isG12 ? { 1: 40, 2: 40, 3: 20 } : { 1: 50, 2: 80, 3: 50, 4: 20 }
    },
    {
      level: 'province',
      title: `IOE Lớp ${grade} - Cấp Tỉnh/Thành Phố (${totalQuestions} câu / 30 phút)`,
      desc: isG12
        ? `Đề thi IOE Khối ${grade} Cấp Tỉnh/Thành Phố (Cấp cao nhất Khối ${grade}) với độ khó phân loại học sinh giỏi cấp Tỉnh/Thành Phố.`
        : `Đề thi IOE Khối ${grade} Cấp Tỉnh/Thành Phố chuẩn 200 câu / 30 phút. Thử thách phản xạ đọc nhanh, ngữ pháp nâng cao và nghe hiểu chuyên sâu.`,
      diff: isG12 ? { 1: 25, 2: 45, 3: 30 } : { 1: 30, 2: 70, 3: 70, 4: 30 }
    }
  ];

  if (!isG12) {
    baseLevels.push({
      level: 'national',
      title: `IOE Lớp ${grade} - Cấp Toàn Quốc (${totalQuestions} câu / 30 phút)`,
      desc: `Đề thi IOE Khối ${grade} Vòng Toàn Quốc (National Round) chuẩn 200 câu trong 30 phút. Bộ đề phân loại học sinh giỏi cấp Quốc Gia.`,
      diff: { 1: 20, 2: 50, 3: 85, 4: 40, 5: 5 }
    });
  }

  return baseLevels.map((item) => ({
    id: `bp-g${grade}-${item.level}`,
    title: item.title,
    description: item.desc,
    grade,
    competitionLevel: item.level,
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions,
    skillDistribution: isG12
      ? { vocabulary: 50, grammar: 25, reading: 15, listening: 10 }
      : { vocabulary: 70, grammar: 70, reading: 30, listening: 30 },
    difficultyDistribution: item.diff,
    createdAt: '2026-08-15T08:00:00.000Z'
  }));
}

export const MockExamHubView: React.FC<MockExamHubViewProps> = ({
  currentGrade,
  onStartExam
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(currentGrade || 5);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [blueprints, setBlueprints] = useState<ExamBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Standard exam length and competition levels based on official IOE requirements:
  // Lớp 1 - 2: 100 câu / 30 phút • 3 cấp thi (Trường - Huyện - Tỉnh/TP)
  // Lớp 3 - 9: 200 câu / 30 phút • 4 cấp thi (Trường - Huyện - Tỉnh/TP - Toàn Quốc)
  const isGrade1or2 = selectedGrade <= 2;
  const standardQuestionCount = isGrade1or2 ? 100 : 200;
  const maxExamScore = standardQuestionCount * 10;

  useEffect(() => {
    // If user switched to Grade 1 or 2 while 'national' level was selected, reset to 'all'
    if (isGrade1or2 && selectedLevel === 'national') {
      setSelectedLevel('all');
    }
  }, [selectedGrade, isGrade1or2, selectedLevel]);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const serverList = await api.getBlueprints(selectedGrade);
        const standardList = getStandardBlueprintsForGrade(selectedGrade);

        // Map standard templates by level, then overlay server data
        const map = new Map<string, ExamBlueprint>();
        standardList.forEach((bp) => map.set(bp.competitionLevel, bp));

        if (Array.isArray(serverList)) {
          serverList.forEach((bp) => {
            if (bp.competitionLevel) {
              // Normalize legacy titles if needed (e.g. Cấp Huyện/Tỉnh -> Cấp Quận/Huyện)
              let title = bp.title || '';
              if (title.includes('Cấp Huyện/Tỉnh')) {
                title = title.replace('Cấp Huyện/Tỉnh', 'Cấp Quận/Huyện');
              }
              map.set(bp.competitionLevel, {
                ...bp,
                title: title || bp.title,
                totalQuestions: isGrade1or2 ? 100 : (bp.totalQuestions || 200)
              });
            }
          });
        }

        setBlueprints(Array.from(map.values()));
      } catch (err) {
        console.error(err);
        setBlueprints(getStandardBlueprintsForGrade(selectedGrade));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedGrade, isGrade1or2]);

  const handleSelectBlueprint = (bp: ExamBlueprint) => {
    soundEngine.playClick();
    onStartExam(bp);
  };

  const handleStartAIGeneratedExam = (level: IOECompetitionLevel = 'school') => {
    soundEngine.playClick();
    // Safety check: Grade 1-2 does not have national level
    const targetLevel = (isGrade1or2 && level === 'national') ? 'province' : level;

    const levelNames: Record<string, string> = {
      school: 'Cấp Trường (Vòng 1 - 15)',
      district: 'Cấp Quận/Huyện (Vòng 20)',
      province: isGrade1or2 ? 'Cấp Tỉnh/TP (Cấp cao nhất Khối 1-2)' : 'Cấp Tỉnh/TP (Vòng 25)',
      national: 'Cấp Toàn Quốc (Vòng 30)'
    };

    const dynamicBp: ExamBlueprint = {
      id: `bp-ai-gen-${selectedGrade}-${targetLevel}-${Date.now()}`,
      title: `Đề Thi Thử AI Ngẫu Nhiên - Khối ${selectedGrade} (${levelNames[targetLevel] || 'Toàn Diện'})`,
      description: `Đề thi được AI chọn ngẫu nhiên ${standardQuestionCount} câu hỏi không trùng lặp theo chuẩn ma trận ${levelNames[targetLevel] || 'IOE'}. Thời gian làm bài 30 phút.`,
      grade: selectedGrade,
      competitionLevel: targetLevel,
      isOfficialMock: true,
      durationMinutes: 30,
      totalQuestions: standardQuestionCount,
      skillDistribution: isGrade1or2
        ? {
            vocabulary: Math.round(standardQuestionCount * 0.5),
            grammar: Math.round(standardQuestionCount * 0.25),
            reading: Math.round(standardQuestionCount * 0.15),
            listening: Math.round(standardQuestionCount * 0.1)
          }
        : {
            vocabulary: Math.round(standardQuestionCount * 0.4),
            grammar: Math.round(standardQuestionCount * 0.35),
            reading: Math.round(standardQuestionCount * 0.15),
            listening: Math.round(standardQuestionCount * 0.1)
          },
      difficultyDistribution: isGrade1or2
        ? (targetLevel === 'school'
            ? { 1: 60, 2: 30, 3: 10 }
            : targetLevel === 'district'
            ? { 1: 40, 2: 40, 3: 20 }
            : { 1: 25, 2: 45, 3: 30 })
        : (targetLevel === 'school' 
            ? { 1: Math.round(standardQuestionCount * 0.5), 2: Math.round(standardQuestionCount * 0.4), 3: Math.round(standardQuestionCount * 0.1) }
            : targetLevel === 'district'
            ? { 1: Math.round(standardQuestionCount * 0.3), 2: Math.round(standardQuestionCount * 0.5), 3: Math.round(standardQuestionCount * 0.2) }
            : targetLevel === 'province'
            ? { 1: Math.round(standardQuestionCount * 0.2), 2: Math.round(standardQuestionCount * 0.4), 3: Math.round(standardQuestionCount * 0.3), 4: Math.round(standardQuestionCount * 0.1) }
            : { 1: Math.round(standardQuestionCount * 0.1), 2: Math.round(standardQuestionCount * 0.3), 3: Math.round(standardQuestionCount * 0.4), 4: Math.round(standardQuestionCount * 0.2) }),
      createdAt: new Date().toISOString()
    };

    onStartExam(dynamicBp);
  };

  const levelOrder: Record<string, number> = {
    school: 1,
    district: 2,
    province: 3,
    national: 4
  };

  // Filter blueprints by level and sort in standard competition progression
  const filteredBlueprints = blueprints
    .filter(bp => {
      // If grade 1-2, ignore any legacy national blueprints if any exist
      if (isGrade1or2 && bp.competitionLevel === 'national') return false;
      if (selectedLevel === 'all') return true;
      return bp.competitionLevel === selectedLevel;
    })
    .sort((a, b) => {
      const ordA = levelOrder[a.competitionLevel || 'school'] || 99;
      const ordB = levelOrder[b.competitionLevel || 'school'] || 99;
      return ordA - ordB;
    });

  // Competition levels list:
  // Lớp 1-2: 3 cấp (Trường, Quận/Huyện, Tỉnh/TP)
  // Lớp 3-9: 4 cấp (Trường, Quận/Huyện, Tỉnh/TP, Toàn Quốc)
  const competitionLevels = isGrade1or2
    ? [
        { id: 'all', label: 'Tất cả (3 cấp thi)', icon: BookOpen, desc: '3 cấp: Trường, Quận/Huyện, Tỉnh/TP' },
        { id: 'school', label: 'Cấp Trường', icon: Trophy, desc: 'Vòng Tự Luyện & Cấp Trường' },
        { id: 'district', label: 'Cấp Quận/Huyện', icon: Award, desc: 'Vòng Cấp Huyện' },
        { id: 'province', label: 'Cấp Tỉnh/TP', icon: Sparkles, desc: 'Vòng Cấp Tỉnh/TP (Cấp cao nhất Khối 1-2)' }
      ]
    : [
        { id: 'all', label: 'Tất cả (4 cấp thi)', icon: BookOpen, desc: '4 cấp: Trường, Quận/Huyện, Tỉnh/TP, Toàn Quốc' },
        { id: 'school', label: 'Cấp Trường', icon: Trophy, desc: 'Vòng Tự Luyện & Cấp Trường' },
        { id: 'district', label: 'Cấp Quận/Huyện', icon: Award, desc: 'Vòng Cấp Huyện' },
        { id: 'province', label: 'Cấp Tỉnh/TP', icon: Sparkles, desc: 'Vòng Cấp Tỉnh/TP' },
        { id: 'national', label: 'Cấp Toàn Quốc', icon: Trophy, desc: 'Vòng Chung Kết Quốc Gia' }
      ];

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs matching official IOE */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <span>Trang chủ</span>
        <span>&gt;</span>
        <span className="text-slate-800 font-bold">Thi Thử</span>
      </div>

      {/* Header Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thi thử
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Luyện thi với đề thi các cấp của IOE
        </p>
      </div>

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
            Quy chuẩn đề thi thử IOE: <strong className="text-amber-200">{isGrade1or2 ? 'Lớp 1 - 2 gồm 100 câu / 30 phút • 3 cấp thi (Trường - Quận/Huyện - Tỉnh/TP)' : 'Lớp 3 - 9 gồm 200 câu / 30 phút • 4 cấp thi (Trường - Quận/Huyện - Tỉnh/TP - Toàn Quốc)'}</strong>. Hệ thống tự động phân bổ câu hỏi theo ma trận độ khó chuẩn Bộ GD&ĐT, bảo đảm trải nghiệm thi chân thực và không trùng lặp.
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
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-1 rounded-lg shadow-xs">
              ⭐ {isGrade1or2 ? '3 Cấp thi (Trường - Huyện - Tỉnh)' : '4 Cấp thi (Trường - Huyện - Tỉnh - Toàn Quốc)'}
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
            {isGrade1or2 ? '⚡ Lớp 1 - 2: 100 câu • 3 Cấp (Trường - Huyện - Tỉnh/TP)' : '⚡ Lớp 3 - 9: 200 câu • 4 Cấp (Trường - Huyện - Tỉnh/TP - Toàn Quốc)'}
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
                  ({g <= 2 ? '100 câu • 3 cấp' : '200 câu • 4 cấp'})
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
                <span className="text-[10px] opacity-80 font-normal">(200 câu • 4 cấp)</span>
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
            Tạo đề thi mới tự động (Khối {selectedGrade} • {standardQuestionCount} câu • {isGrade1or2 ? '3 cấp thi' : '4 cấp thi'})
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            {isGrade1or2
              ? 'Dành cho Lớp 1 - 2: Tạo đề 100 câu / 30 phút theo 3 cấp độ: Cấp Trường, Cấp Quận/Huyện và Cấp Tỉnh/TP.'
              : 'Dành cho Lớp 3 - 9: Tạo đề 200 câu / 30 phút theo 4 cấp độ: Cấp Trường, Cấp Quận/Huyện, Cấp Tỉnh/TP và Cấp Toàn Quốc.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('school')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Trường</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('district')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Quận/Huyện</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartAIGeneratedExam('province')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tạo đề Cấp Tỉnh/TP</span>
          </button>
          {!isGrade1or2 && (
            <button
              type="button"
              onClick={() => handleStartAIGeneratedExam('national')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Tạo đề Cấp Toàn Quốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách các đề thi mẫu theo cấp độ ({isGrade1or2 ? '3 cấp thi' : '4 cấp thi'}):
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGrade1or2
                ? 'Gồm 3 cấp độ: Cấp Trường, Cấp Quận/Huyện và Cấp Tỉnh/TP (100 câu / 30 phút • 1.000 điểm)'
                : 'Gồm 4 cấp độ: Cấp Trường, Cấp Quận/Huyện, Cấp Tỉnh/TP và Cấp Toàn Quốc (200 câu / 30 phút • 2.000 điểm)'}
            </p>
          </div>
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
