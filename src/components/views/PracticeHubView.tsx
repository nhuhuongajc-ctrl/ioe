import React, { useState } from 'react';
import { BookOpen, Headphones, PenTool, Sparkles, Play, Flame, Layers } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface PracticeHubViewProps {
  currentGrade: number;
  onStartPractice: (params: {
    grade: number;
    skill?: string;
    topic?: string;
    count: number;
    gameSkin: string;
  }) => void;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  currentGrade,
  onStartPractice
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(currentGrade || 5);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);

  const standardFullCount = selectedGrade <= 2 ? 100 : 200;

  const skills = [
    { id: 'all', title: 'Tổng hợp 4 kỹ năng', icon: Sparkles, color: 'from-indigo-500 to-purple-600', desc: 'Trộn lẫn từ vựng, ngữ pháp, sắp xếp câu và đọc hiểu' },
    { id: 'vocabulary', title: 'Từ vựng (Vocabulary)', icon: BookOpen, color: 'from-amber-500 to-orange-600', desc: 'Nhận diện từ, điền chữ cái khuyết, ghép nghĩa' },
    { id: 'grammar', title: 'Ngữ pháp & Câu (Grammar)', icon: PenTool, color: 'from-emerald-500 to-teal-600', desc: 'Chia thì, giới từ, sắp xếp từ thành câu hoàn chỉnh' },
    { id: 'reading', title: 'Đọc hiểu (Reading)', icon: Layers, color: 'from-sky-500 to-blue-600', desc: 'Đọc đoạn văn ngắn và trả lời câu hỏi trắc nghiệm' },
    { id: 'listening', title: 'Luyện nghe (Listening)', icon: Headphones, color: 'from-rose-500 to-pink-600', desc: 'Nghe phát âm chuẩn bản ngữ và chọn đáp án' }
  ];

  const handleStart = () => {
    soundEngine.playClick();
    onStartPractice({
      grade: selectedGrade,
      skill: selectedSkill === 'all' ? undefined : selectedSkill,
      count: questionCount,
      gameSkin: 'standard'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-indigo-700/50">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Luyện tập tự do & Rèn luyện kỹ năng</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Luyện Thi IOE Tiếng Anh — Khối {selectedGrade}
          </h1>
          <p className="text-indigo-200 text-sm md:text-base leading-relaxed">
            Hệ thống ngân hàng bài tập thông minh với hàng ngàn câu hỏi phân loại theo từng kỹ năng và cấp lớp, giúp học sinh rèn luyện phản xạ nhanh và ghi nhớ từ vựng sâu sắc.
          </p>
        </div>
      </div>

      {/* Grade Selector Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Chọn khối lớp của bạn:
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
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 scale-102'
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
          <div className="text-[11px] font-semibold text-slate-400">Khối THCS:</div>
          <div className="flex flex-wrap gap-2">
            {[6, 7, 8, 9].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center space-x-1.5
                  ${selectedGrade === g
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 scale-102'
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

      {/* Skill Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">1. Chọn kỹ năng muốn rèn luyện:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedSkill === s.id;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSkill(s.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 bg-white select-none
                  ${isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-xs flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Number of Questions Option */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">2. Số lượng câu hỏi muốn làm:</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { count: 10, label: '10 câu', time: '5 phút' },
            { count: 20, label: '20 câu', time: '10 phút' },
            { count: 30, label: '30 câu', time: '15 phút' },
            { count: 50, label: '50 câu', time: '25 phút' },
            { count: standardFullCount, label: `${standardFullCount} câu (Đầy đủ)`, time: '30 phút' }
          ].map((item) => (
            <button
              key={item.count}
              type="button"
              onClick={() => setQuestionCount(item.count)}
              className={`p-3.5 rounded-xl border-2 font-bold text-center transition-all cursor-pointer
                ${questionCount === item.count
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'}
              `}
            >
              <div className="text-sm">{item.label}</div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="w-full sm:w-auto min-w-[300px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-indigo-300/50 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Bắt đầu luyện tập ngay ({questionCount} câu)</span>
        </button>
      </div>
    </div>
  );
};
