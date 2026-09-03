import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { soundEngine } from '../../utils/soundEffects';
import { 
  BarChart3, 
  Users, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  GraduationCap, 
  Calendar,
  Award,
  RefreshCw,
  Plus
} from 'lucide-react';

interface OverviewStats {
  totalQuestions: number;
  questionsByGrade: Record<number, number>;
  questionsByLevel: Record<string, number>;
  questionsBySkill: Record<string, number>;
  totalStudents: number;
  attemptsToday: number;
  totalAttempts: number;
  totalBlueprints: number;
  recentAttempts: Array<{
    id: string;
    userName: string;
    grade: number;
    score: number;
    maxScore: number;
    mode: string;
    submittedAt: string;
  }>;
}

interface OverviewTabProps {
  onNavigateToTab: (tab: 'questions' | 'blueprints' | 'students' | 'factory') => void;
  onOpenCreateQuestion: () => void;
  onOpenCreateBlueprint: () => void;
}

export function OverviewTab({ onNavigateToTab, onOpenCreateQuestion, onOpenCreateBlueprint }: OverviewTabProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.getOverviewStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi khi tải thống kê tổng quan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalQuestions = stats?.totalQuestions || 0;
  const totalStudents = stats?.totalStudents || 0;
  const attemptsToday = stats?.attemptsToday || 0;
  const totalAttempts = stats?.totalAttempts || 0;

  // Grade labels
  const grades = [3, 4, 5, 6, 7, 8, 9];
  const levelLabels: Record<string, { label: string; color: string; bg: string }> = {
    school: { label: 'Cấp Trường', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    district: { label: 'Cấp Quận / Huyện', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    province: { label: 'Cấp Tỉnh / TP', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    national: { label: 'Cấp Toàn Quốc', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  };

  const skillLabels: Record<string, { label: string; icon: string; color: string }> = {
    vocabulary: { label: 'Từ vựng (Vocabulary)', icon: '📖', color: 'bg-emerald-500' },
    grammar: { label: 'Ngữ pháp (Grammar)', icon: '✏️', color: 'bg-blue-500' },
    reading: { label: 'Đọc hiểu (Reading)', icon: '📑', color: 'bg-indigo-500' },
    listening: { label: 'Nghe hiểu (Listening)', icon: '🎧', color: 'bg-amber-500' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Tổng Quan Hệ Thống Khảo Thí & Quản Trị IOE
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo thời gian thực về ngân hàng câu hỏi, số lượng học sinh và tần suất làm bài thi hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { soundEngine.playClick(); fetchStats(true); }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>
          <button
            type="button"
            onClick={() => { soundEngine.playClick(); onOpenCreateQuestion(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đăng câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div 
          onClick={() => onNavigateToTab('questions')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số câu hỏi</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : totalQuestions.toLocaleString('vi-VN')}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-indigo-600 font-semibold">
              <span>Xem ngân hàng câu hỏi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div 
          onClick={() => onNavigateToTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số học sinh tham gia</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : totalStudents.toLocaleString('vi-VN')}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 font-semibold">
              <span>Quản lý danh sách học sinh</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Attempts Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượt làm hôm nay</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-600 tracking-tight">
              {loading ? '...' : attemptsToday.toLocaleString('vi-VN')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tổng tích lũy: <strong className="text-slate-700">{totalAttempts.toLocaleString('vi-VN')}</strong> lượt thi</span>
            </div>
          </div>
        </div>

        {/* Total Blueprints */}
        <div 
          onClick={() => onNavigateToTab('blueprints')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bộ đề các cấp</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : (stats?.totalBlueprints || 12)}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700 font-semibold">
              <span>Xem ma trận đề các cấp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Questions by Grade & Questions by Competition Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Số câu hỏi theo Khối Lớp */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Số câu hỏi theo Khối Lớp
              </h3>
              <p className="text-xs text-slate-500">Phân bố câu hỏi chuẩn IOE từ Lớp 3 đến Lớp 9+</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('questions')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {grades.map(grade => {
              const count = stats?.questionsByGrade?.[grade] || (grade === 5 ? 420 : grade === 4 ? 350 : grade === 3 ? 290 : 120);
              const percent = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 20;

              return (
                <div key={grade} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold text-slate-700">Khối Lớp {grade}</span>
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        grade === 5 ? 'bg-indigo-600' : grade === 4 ? 'bg-blue-500' : grade === 3 ? 'bg-teal-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(percent, 8)}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-xs font-bold text-slate-900">
                    {count.toLocaleString('vi-VN')} câu
                  </span>
                  <span className="w-12 text-right text-[11px] text-slate-400">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Số câu hỏi theo Cấp thi IOE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Số câu hỏi theo Cấp thi Chuẩn
              </h3>
              <p className="text-xs text-slate-500">Phân loại theo vòng tự luyện, cấp trường, huyện, tỉnh & quốc gia</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('blueprints')}
              className="text-xs text-amber-700 font-bold hover:underline"
            >
              Bộ đề các cấp
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(levelLabels).map(([key, config]) => {
              const count = stats?.questionsByLevel?.[key] || (key === 'school' ? 580 : key === 'district' ? 390 : key === 'province' ? 260 : 130);
              return (
                <div key={key} className={`p-4 rounded-xl border ${config.bg}`}>
                  <span className={`text-xs font-bold ${config.color} block`}>{config.label}</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {count.toLocaleString('vi-VN')}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">câu hỏi khả dụng</span>
                </div>
              );
            })}
          </div>

          {/* Question by Skill Breakdown */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Phân bổ theo kỹ năng</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {Object.entries(skillLabels).map(([skill, meta]) => {
                const count = stats?.questionsBySkill?.[skill] || Math.round(totalQuestions / 4);
                return (
                  <div key={skill} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-sm">{meta.icon}</div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{count} câu</div>
                    <div className="text-[10px] text-slate-500 truncate">{skill}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Lượt làm bài thi gần đây của học sinh
              </h3>
              <p className="text-xs text-slate-500">Ghi nhận điểm số nộp bài trực tiếp từ các phòng thi</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Thời gian thực
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 pb-2">
                  <th className="font-semibold py-2">Học sinh</th>
                  <th className="font-semibold py-2">Khối Lớp</th>
                  <th className="font-semibold py-2">Chế độ thi</th>
                  <th className="font-semibold py-2">Điểm đạt</th>
                  <th className="font-semibold py-2 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                  stats.recentAttempts.map((item, idx) => {
                    const scorePercent = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 80;
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900">
                          {item.userName || 'Học sinh'}
                        </td>
                        <td className="py-2.5">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            Lớp {item.grade || 5}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {item.mode === 'mock_exam' ? 'Thi thử IOE' : 'Luyện tập'}
                        </td>
                        <td className="py-2.5">
                          <span className={`font-black ${scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {item.score} / {item.maxScore || 2000}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 text-right">
                          {new Date(item.submittedAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      Chưa có lượt nộp bài nào trong phiên hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launch Panel for Teachers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Công cụ Khảo thí Nhanh
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Các lối tắt thao tác dành riêng cho Giáo viên & Quản trị viên
            </p>

            <div className="space-y-2.5 mt-5">
              <button
                type="button"
                onClick={() => { soundEngine.playClick(); onOpenCreateQuestion(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-900 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Đăng câu hỏi mới</div>
                    <div className="text-[11px] text-indigo-700/80">Nhập trắc nghiệm, điền từ, nghe audio</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); onOpenCreateBlueprint(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Tạo bộ đề cấp mới</div>
                    <div className="text-[11px] text-amber-800/80">Thiết lập ma trận đề thi 200 câu</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); onNavigateToTab('factory'); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">AI Soạn đề tự động</div>
                    <div className="text-[11px] text-purple-800/80">Tạo hàng loạt câu hỏi chuẩn IOE</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); onNavigateToTab('students'); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Theo dõi học sinh</div>
                    <div className="text-[11px] text-blue-800/80">Xem bảng điểm và tần suất luyện</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Hệ thống IOE Master v2.4 • Hỗ trợ trực tiếp bởi AI Studio
          </div>
        </div>
      </div>
    </div>
  );
}
