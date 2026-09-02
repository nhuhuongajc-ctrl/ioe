import React, { useState, useEffect } from 'react';
import { SanitizedQuestion, UserAnswerPayload, TokenItem } from '../../shared/types/ioe';
import { soundEngine } from '../../utils/soundEffects';
import { RotateCcw, ArrowRight } from 'lucide-react';

interface OrderingInteractionProps {
  question: SanitizedQuestion;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

export const OrderingInteraction: React.FC<OrderingInteractionProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const initialTokens = question.tokens || [];
  const [selectedTokens, setSelectedTokens] = useState<TokenItem[]>([]);
  const [availableTokens, setAvailableTokens] = useState<TokenItem[]>(initialTokens);

  useEffect(() => {
    if (currentAnswer?.orderedTokenIds && currentAnswer.orderedTokenIds.length > 0) {
      const selected: TokenItem[] = [];
      const tokenMap = new Map<string, TokenItem>();
      initialTokens.forEach(t => tokenMap.set(t.id, t));

      currentAnswer.orderedTokenIds.forEach(id => {
        const tok = tokenMap.get(id);
        if (tok) selected.push(tok);
      });

      const selectedIdSet = new Set(selected.map(t => t.id));
      const remaining = initialTokens.filter(t => !selectedIdSet.has(t.id));

      setSelectedTokens(selected);
      setAvailableTokens(remaining);
    } else {
      setSelectedTokens([]);
      setAvailableTokens(initialTokens);
    }
  }, [question.id, currentAnswer?.orderedTokenIds]);

  const handleSelectToken = (token: TokenItem) => {
    if (disabled) return;
    soundEngine.playClick();

    const newSelected = [...selectedTokens, token];
    const newAvailable = availableTokens.filter(t => t.id !== token.id);

    setSelectedTokens(newSelected);
    setAvailableTokens(newAvailable);

    onAnswerChange({
      questionId: question.id,
      orderedTokenIds: newSelected.map(t => t.id),
      textAnswer: newSelected.map(t => t.text).join(' '),
      clientAnsweredAt: Date.now()
    });
  };

  const handleDeselectToken = (token: TokenItem, index: number) => {
    if (disabled) return;
    soundEngine.playClick();

    const newSelected = selectedTokens.filter((_, i) => i !== index);
    const newAvailable = [...availableTokens, token];

    setSelectedTokens(newSelected);
    setAvailableTokens(newAvailable);

    onAnswerChange({
      questionId: question.id,
      orderedTokenIds: newSelected.map(t => t.id),
      textAnswer: newSelected.map(t => t.text).join(' '),
      clientAnsweredAt: Date.now()
    });
  };

  const handleReset = () => {
    if (disabled) return;
    soundEngine.playClick();
    setSelectedTokens([]);
    setAvailableTokens(initialTokens);

    onAnswerChange({
      questionId: question.id,
      orderedTokenIds: [],
      textAnswer: '',
      clientAnsweredAt: Date.now()
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Target Sentence Area */}
      <div className="bg-slate-50 border-2 border-dashed border-indigo-300 rounded-2xl p-5 min-h-[90px] flex flex-wrap items-center gap-2.5 transition-all">
        {selectedTokens.length === 0 ? (
          <div className="w-full text-center text-slate-400 text-sm py-4 italic">
            Chạm vào các từ bên dưới theo thứ tự đúng để ghép thành câu hoàn chỉnh
          </div>
        ) : (
          selectedTokens.map((token, index) => (
            <button
              key={`selected-${token.id}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => handleDeselectToken(token, index)}
              className="group bg-indigo-600 hover:bg-rose-600 text-white font-semibold text-base md:text-lg px-4 py-2 rounded-xl shadow-xs transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{token.text}</span>
              <span className="text-xs opacity-60 group-hover:opacity-100">✕</span>
            </button>
          ))
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          <span>Kho từ có sẵn:</span>
        </div>

        {selectedTokens.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        )}
      </div>

      {/* Available Tokens Bank */}
      <div className="flex flex-wrap gap-2.5 p-4 bg-white border border-slate-200 rounded-xl shadow-xs min-h-[80px]">
        {availableTokens.length === 0 ? (
          <div className="text-xs text-emerald-700 font-medium py-2 flex items-center gap-1">
            ✓ Đã chọn hết các từ! Bạn có thể chạm vào từ đã chọn ở trên để chỉnh sửa nếu cần.
          </div>
        ) : (
          availableTokens.map((token) => (
            <button
              key={`available-${token.id}`}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectToken(token)}
              className="bg-slate-100 hover:bg-indigo-50 hover:border-indigo-400 border border-slate-300 text-slate-800 hover:text-indigo-700 font-medium text-base md:text-lg px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {token.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
