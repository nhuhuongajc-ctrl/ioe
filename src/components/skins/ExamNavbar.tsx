import React, { useState, useEffect } from 'react';
import { Clock, Volume2, VolumeX, Grid, Send, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface ExamNavbarProps {
  title: string;
  grade: number;
  totalQuestions: number;
  currentIndex: number;
  answeredCount: number;
  remainingSeconds: number;
  answersMap: Record<string, any>;
  questions: Array<{ id: string }>;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ExamNavbar: React.FC<ExamNavbarProps> = ({
  title,
  grade,
  totalQuestions,
  currentIndex,
  answeredCount,
  remainingSeconds,
  answersMap,
  questions,
  onSelectQuestion,
  onSubmit,
  isSubmitting
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showMatrix, setShowMatrix] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds <= 120 && remainingSeconds > 0;
  const isCriticalTime = remainingSeconds <= 30 && remainingSeconds > 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Title & Grade Badge */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs flex-shrink-0">
              {grade}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-slate-900 truncate">
                {title}
              </h1>
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <span>Đã làm: <strong className="text-indigo-600">{answeredCount}</strong>/{totalQuestions} câu</span>
              </div>
            </div>
          </div>

          {/* Center: Authoritative Countdown Timer */}
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-base md:text-lg transition-colors border
            ${isCriticalTime 
              ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse ring-2 ring-rose-200' 
              : isLowTime 
                ? 'bg-amber-50 border-amber-300 text-amber-700' 
                : 'bg-slate-50 border-slate-200 text-slate-800'}
          `}>
            <Clock className={`w-4 h-4 ${isCriticalTime ? 'text-rose-600' : 'text-slate-500'}`} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Question Matrix Drawer Button */}
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors relative"
              title="Xem danh sách toàn bộ câu hỏi"
            >
              <Grid className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Question Matrix Drawer Grid */}
        {showMatrix && (
          <div className="max-w-6xl mx-auto mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Bảng câu hỏi ({answeredCount}/{totalQuestions} câu đã làm)</span>
              <button 
                type="button" 
                onClick={() => setShowMatrix(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 max-h-48 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answersMap[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      onSelectQuestion(idx);
                      setShowMatrix(false);
                    }}
                    className={`h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer
                      ${isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}
                      ${isAnswered ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Confirmation Modal before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài thi?</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn đã hoàn thành <strong className="text-indigo-600">{answeredCount}</strong> trên tổng số <strong>{totalQuestions}</strong> câu hỏi.
              {answeredCount < totalQuestions && (
                <span className="block mt-1 text-rose-600 font-semibold">
                  (Còn {totalQuestions - answeredCount} câu chưa làm)
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Làm tiếp
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmit();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'Đồng ý nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
