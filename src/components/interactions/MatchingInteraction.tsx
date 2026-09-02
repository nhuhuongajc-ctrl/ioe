import React, { useState, useEffect } from 'react';
import { SanitizedQuestion, UserAnswerPayload, MatchingPair } from '../../shared/types/ioe';
import { soundEngine } from '../../utils/soundEffects';
import { RotateCcw } from 'lucide-react';

interface MatchingInteractionProps {
  question: SanitizedQuestion;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

const PAIR_COLORS = [
  'bg-emerald-500 text-white border-emerald-600',
  'bg-blue-500 text-white border-blue-600',
  'bg-purple-500 text-white border-purple-600',
  'bg-amber-500 text-white border-amber-600',
  'bg-rose-500 text-white border-rose-600'
];

export const MatchingInteraction: React.FC<MatchingInteractionProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const pairs = question.matchingPairs || [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>(currentAnswer?.pairMatches || {});

  useEffect(() => {
    setMatches(currentAnswer?.pairMatches || {});
  }, [question.id, currentAnswer?.pairMatches]);

  const handleLeftClick = (leftId: string) => {
    if (disabled) return;
    soundEngine.playClick();
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (disabled) return;
    if (!selectedLeft) return;

    soundEngine.playClick();
    const newMatches = { ...matches };

    // If this rightId was already matched to another left, remove old match
    for (const [lKey, rVal] of Object.entries(newMatches)) {
      if (rVal === rightId) {
        delete newMatches[lKey];
      }
    }

    newMatches[selectedLeft] = rightId;
    setMatches(newMatches);
    setSelectedLeft(null);

    onAnswerChange({
      questionId: question.id,
      pairMatches: newMatches,
      clientAnsweredAt: Date.now()
    });
  };

  const handleUnmatch = (leftId: string) => {
    if (disabled) return;
    soundEngine.playClick();
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);

    onAnswerChange({
      questionId: question.id,
      pairMatches: newMatches,
      clientAnsweredAt: Date.now()
    });
  };

  const handleReset = () => {
    if (disabled) return;
    soundEngine.playClick();
    setMatches({});
    setSelectedLeft(null);

    onAnswerChange({
      questionId: question.id,
      pairMatches: {},
      clientAnsweredAt: Date.now()
    });
  };

  // Get color index for left item
  const getPairColorClass = (leftId: string) => {
    const idx = pairs.findIndex(p => p.leftId === leftId);
    return PAIR_COLORS[idx % PAIR_COLORS.length];
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>Bấm chọn 1 mục ở Cột Trái, sau đó bấm chọn 1 mục tương ứng ở Cột Phải</span>
        {Object.keys(matches).length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nối lại từ đầu</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">Cột Trái (A)</div>
          {pairs.map((pair, idx) => {
            const isMatched = Boolean(matches[pair.leftId]);
            const isSelected = selectedLeft === pair.leftId;
            const colorClass = isMatched ? getPairColorClass(pair.leftId) : '';

            return (
              <div
                key={`left-${pair.leftId}`}
                onClick={() => handleLeftClick(pair.leftId)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between select-none
                  ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'}
                  ${isMatched ? 'border-l-8' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isMatched ? colorClass : 'bg-slate-100 text-slate-700'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 text-base">{pair.leftText}</span>
                </div>

                {isMatched && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmatch(pair.leftId);
                    }}
                    className="text-xs bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 px-2 py-1 rounded"
                  >
                    Hủy nối
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">Cột Phải (B)</div>
          {pairs.map((pair, idx) => {
            // Find which leftId is matched with this rightId
            const matchedLeftId = Object.keys(matches).find(lId => matches[lId] === pair.rightId);
            const isMatched = Boolean(matchedLeftId);
            const colorClass = matchedLeftId ? getPairColorClass(matchedLeftId) : '';

            return (
              <div
                key={`right-${pair.rightId}`}
                onClick={() => handleRightClick(pair.rightId)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between select-none
                  ${selectedLeft ? 'hover:border-indigo-500 hover:bg-indigo-50/50' : ''}
                  ${isMatched ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isMatched ? colorClass : 'bg-slate-100 text-slate-700'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium text-slate-800 text-sm md:text-base leading-snug">{pair.rightText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
