import React, { useState, useEffect } from 'react';
import { AttemptSnapshot } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { History, Calendar, CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  onReviewPastAttempt: (attemptId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onReviewPastAttempt }) => {
  const [history, setHistory] = useState<AttemptSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.getUserHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Gần đây';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Lịch Sử Làm Bài & Tiến Trình Học Tập
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Theo dõi điểm số, số câu đúng và xem lại giải thích chi tiết của từng bài thi đã làm.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Đang tải lịch sử thi...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p>Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu một bài luyện tập hoặc thi thử ngay!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => {
              const accuracy = item.totalPoints && item.totalPoints > 0
                ? Math.round(((item.finalScore || 0) / item.totalPoints) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                        Khối {item.grade}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.submittedAt || item.serverPreparedAt)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">
                      {item.mode === 'mock_exam' ? 'Thi thử IOE' : 'Luyện tập kỹ năng'} • {item.questions?.length || 0} câu
                    </h3>

                    <div className="text-xs text-slate-600 flex items-center space-x-3">
                      <span className="text-emerald-700 font-semibold">✓ {item.correctCount || 0} câu đúng</span>
                      <span className="text-rose-600 font-semibold">✗ {item.incorrectCount || 0} câu sai</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-black text-indigo-700">
                        {item.finalScore || 0} <span className="text-xs text-slate-500 font-normal">/ {item.totalPoints || 0}đ</span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">{accuracy}% chính xác</div>
                    </div>

                    {item.status === 'submitted' && (
                      <button
                        type="button"
                        onClick={() => onReviewPastAttempt(item.id)}
                        className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Xem lại</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
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
