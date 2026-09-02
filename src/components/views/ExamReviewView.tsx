import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, RotateCcw, Volume2, Award, Clock } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface ExamReviewViewProps {
  attemptSummary: {
    attemptId: string;
    grade: number;
    mode: string;
    finalScore: number;
    totalPoints: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    timeSpentSeconds: number;
    gradedResults: any[];
  };
  onBackToHome: () => void;
  onRetake: () => void;
}

export const ExamReviewView: React.FC<ExamReviewViewProps> = ({
  attemptSummary,
  onBackToHome,
  onRetake
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  const {
    finalScore,
    totalPoints,
    correctCount,
    incorrectCount,
    unansweredCount,
    timeSpentSeconds,
    gradedResults
  } = attemptSummary;

  const totalQuestions = gradedResults.length;
  const accuracy = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;

  const filteredResults = gradedResults.filter((item, idx) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return !item.isCorrect && (item.userAnswer?.selectedOptionId || item.userAnswer?.textAnswer || item.userAnswer?.orderedTokenIds || item.userAnswer?.pairMatches);
    if (filter === 'unanswered') return !item.userAnswer || (!item.userAnswer.selectedOptionId && !item.userAnswer.textAnswer && !item.userAnswer.orderedTokenIds && !item.userAnswer.pairMatches);
    return true;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Score Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Kết quả bài thi IOE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {accuracy >= 80 ? '🎉 Xuất sắc! Bạn làm rất tốt!' : accuracy >= 50 ? '👍 Khá tốt! Cố gắng thêm nhé!' : '💪 Đừng nản, cùng luyện tập thêm nào!'}
            </h1>
            <p className="text-indigo-200 text-sm flex items-center justify-center md:justify-start space-x-2">
              <Clock className="w-4 h-4" />
              <span>Thời gian làm bài: {formatTime(timeSpentSeconds)}</span>
            </p>
          </div>

          {/* Score Big Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-5 text-center shadow-lg">
            <div className="text-xs uppercase tracking-widest text-indigo-200 font-bold mb-1">Tổng điểm</div>
            <div className="text-4xl md:text-5xl font-black text-amber-300">
              {finalScore} <span className="text-xl text-white/70 font-normal">/ {totalPoints}</span>
            </div>
            <div className="text-sm font-semibold text-emerald-300 mt-1">
              Độ chính xác: {accuracy}%
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-indigo-700/50">
          <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-emerald-300">{correctCount}</div>
            <div className="text-xs text-emerald-100 font-medium">Câu đúng</div>
          </div>
          <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-rose-300">{incorrectCount}</div>
            <div className="text-xs text-rose-100 font-medium">Câu sai</div>
          </div>
          <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-amber-300">{unansweredCount}</div>
            <div className="text-xs text-amber-100 font-medium">Chưa làm</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Làm bài thi mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: `Tất cả (${totalQuestions})` },
          { key: 'correct', label: `Đúng (${correctCount})` },
          { key: 'incorrect', label: `Sai (${incorrectCount})` },
          { key: 'unanswered', label: `Chưa làm (${unansweredCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key as any)}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer
              ${filter === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question Review List */}
      <div className="space-y-4">
        {filteredResults.map((item, index) => {
          const originalIndex = gradedResults.indexOf(item);
          const isCorrect = item.isCorrect;
          const isUnanswered = !item.userAnswer || (!item.userAnswer.selectedOptionId && !item.userAnswer.textAnswer && !item.userAnswer.orderedTokenIds && !item.userAnswer.pairMatches);

          return (
            <div
              key={item.questionId || index}
              className={`p-5 md:p-6 rounded-2xl border-2 transition-all bg-white
                ${isCorrect ? 'border-emerald-200' : isUnanswered ? 'border-amber-200' : 'border-rose-200'}
              `}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm
                    ${isCorrect ? 'bg-emerald-100 text-emerald-800' : isUnanswered ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}
                  `}>
                    {originalIndex + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.scoreEarned} / {item.maxScore} điểm
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {isCorrect ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Chính xác</span>
                    </span>
                  ) : isUnanswered ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Chưa trả lời</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Chưa chính xác</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Correct Answer Box */}
              {item.correctAnswer && (
                <div className="space-y-3 mt-4 pt-3 border-t border-slate-100">
                  {/* Detailed Explanation */}
                  {item.correctAnswer.explanation && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-sm text-slate-800">
                      <div className="font-bold text-indigo-900 mb-1 flex items-center justify-between">
                        <span>💡 Giải thích chi tiết:</span>
                        {item.correctAnswer.pronunciationIpa && (
                          <button
                            type="button"
                            onClick={() => soundEngine.speakWord(item.correctAnswer.acceptedAnswers?.[0] || 'word')}
                            className="flex items-center space-x-1 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{item.correctAnswer.pronunciationIpa}</span>
                          </button>
                        )}
                      </div>
                      <p className="leading-relaxed">{item.correctAnswer.explanation}</p>
                      {item.correctAnswer.vietnameseMeaning && (
                        <p className="mt-2 text-xs text-indigo-950 font-medium italic">
                          Dịch nghĩa: {item.correctAnswer.vietnameseMeaning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
