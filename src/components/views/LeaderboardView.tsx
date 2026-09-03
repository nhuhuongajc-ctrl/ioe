import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { Trophy, Medal, Flame, Clock, Award } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.getLeaderboard({ grade, limit: 30 });
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [grade]);

  const top3 = entries.slice(0, 3);
  const others = entries.slice(3);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-white/20 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-200" />
          <span>Bảng Vinh Danh Toàn Quốc</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black">Bảng Xếp Hạng IOE</h1>
        <p className="text-white/90 text-xs md:text-sm">
          Vinh danh các thí sinh có điểm số cao nhất và tốc độ làm bài nhanh nhất trong các kỳ thi thử.
        </p>
      </div>

      {/* Grade Selector */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setGrade(undefined)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${grade === undefined ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
          `}
        >
          Tất cả khối lớp
        </button>
        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
          <button
            key={g}
            type="button"
            onClick={() => setGrade(g)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all
              ${grade === g ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
            `}
          >
            Lớp {g}
          </button>
        ))}
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {top3.map((entry, idx) => {
            const rank = idx + 1;
            const medalColor = rank === 1 ? 'bg-amber-400 text-amber-950' : rank === 2 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-amber-100';

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-3xl p-6 border-2 text-center shadow-sm space-y-3 relative
                  ${rank === 1 ? 'border-amber-400 ring-2 ring-amber-200 -translate-y-1' : 'border-slate-200'}
                `}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto shadow-sm ${medalColor}`}>
                  #{rank}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{entry.userName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Khối {entry.grade}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 space-y-1">
                  <div className="text-2xl font-black text-indigo-700">{entry.score} <span className="text-xs font-normal text-slate-500">điểm</span></div>
                  <div className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(entry.timeSpentSeconds)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Others List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Đang tải bảng xếp hạng...</div>
          ) : others.length === 0 && top3.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Chưa có kết quả nào. Hãy là người đầu tiên hoàn thành bài thi!</div>
          ) : (
            others.map((entry, idx) => (
              <div key={entry.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                    {idx + 4}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{entry.userName}</h4>
                    <span className="text-xs text-slate-500">Khối {entry.grade} • {entry.examTitle}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-indigo-700">{entry.score} điểm</div>
                  <div className="text-xs text-slate-500">{formatTime(entry.timeSpentSeconds)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
