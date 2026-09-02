import React, { useEffect } from 'react';
import { SanitizedQuestion, UserAnswerPayload } from '../../shared/types/ioe';
import { soundEngine } from '../../utils/soundEffects';

interface ChoiceInteractionProps {
  question: SanitizedQuestion;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

export const ChoiceInteraction: React.FC<ChoiceInteractionProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const selectedOptionId = currentAnswer?.selectedOptionId;

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      let pickedIndex = -1;

      if (['A', 'B', 'C', 'D'].includes(key)) {
        pickedIndex = key.charCodeAt(0) - 'A'.charCodeAt(0);
      } else if (['1', '2', '3', '4'].includes(key)) {
        pickedIndex = parseInt(key, 10) - 1;
      }

      if (pickedIndex >= 0 && question.options && pickedIndex < question.options.length) {
        const opt = question.options[pickedIndex];
        selectOption(opt.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question.options, disabled, selectedOptionId]);

  const selectOption = (optionId: string) => {
    if (disabled) return;
    soundEngine.playClick();
    onAnswerChange({
      questionId: question.id,
      selectedOptionId: optionId,
      clientAnsweredAt: Date.now()
    });
  };

  const isImageOptions = question.interaction.variant === 'image-options';

  return (
    <div className="w-full space-y-4">
      {/* Passage context if provided */}
      {question.passage && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 text-slate-800 text-base leading-relaxed mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Đoạn văn đọc hiểu</div>
          <p className="whitespace-pre-line font-medium">{question.passage}</p>
        </div>
      )}

      {/* Options grid */}
      <div className={`grid gap-3 ${isImageOptions ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {question.options?.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const letterLabel = option.label || String.fromCharCode(65 + idx);

          return (
            <button
              key={option.id}
              id={`option-btn-${option.id}`}
              type="button"
              disabled={disabled}
              onClick={() => selectOption(option.id)}
              className={`group relative text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3 cursor-pointer select-none
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 shadow-sm'}
                ${disabled ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {/* Option badge */}
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors
                ${isSelected 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'}
              `}>
                {letterLabel}
              </span>

              {/* Option content */}
              <div className="flex-1 min-w-0">
                {option.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 max-h-36 bg-slate-100">
                    <img 
                      src={option.imageUrl} 
                      alt={option.text} 
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <span className={`text-base md:text-lg font-medium leading-snug block break-words
                  ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-800'}
                `}>
                  {option.text}
                </span>
              </div>

              {/* Selection indicator radio circle */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 transition-colors
                ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}
              `}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
        <span>Mẹo phím tắt: Bấm phím <strong>A, B, C, D</strong> hoặc <strong>1, 2, 3, 4</strong> để chọn nhanh</span>
      </div>
    </div>
  );
};
