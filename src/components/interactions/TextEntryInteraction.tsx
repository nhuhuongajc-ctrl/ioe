import React, { useState, useEffect, useRef } from 'react';
import { SanitizedQuestion, UserAnswerPayload } from '../../shared/types/ioe';
import { soundEngine } from '../../utils/soundEffects';

interface TextEntryInteractionProps {
  question: SanitizedQuestion;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

export const TextEntryInteraction: React.FC<TextEntryInteractionProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const [inputValue, setInputValue] = useState<string>(currentAnswer?.textAnswer || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(currentAnswer?.textAnswer || '');
  }, [question.id, currentAnswer?.textAnswer]);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id, disabled]);

  const handleChange = (val: string) => {
    setInputValue(val);
    onAnswerChange({
      questionId: question.id,
      textAnswer: val,
      clientAnsweredAt: Date.now()
    });
  };

  const isMissingLetters = question.interaction.subtype === 'missing-letters' || Boolean(question.missingLetterPattern);

  return (
    <div className="w-full space-y-5">
      {/* Pattern visual if missing letters */}
      {isMissingLetters && question.missingLetterPattern && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            Mẫu từ khuyết (Missing Letters)
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold tracking-widest text-amber-950 px-3 py-2 bg-white rounded-lg inline-block border border-amber-200 shadow-inner">
            {question.missingLetterPattern}
          </div>
          <div className="text-xs text-amber-700 mt-2">
            Nhập toàn bộ từ hoàn chỉnh hoặc các chữ cái còn thiếu vào ô bên dưới
          </div>
        </div>
      )}

      {/* Input Field */}
      <div className="max-w-xl mx-auto">
        <label htmlFor="text-answer-input" className="block text-sm font-semibold text-slate-700 mb-2">
          {isMissingLetters ? 'Điền câu trả lời:' : 'Nhập từ hoặc cụm từ thích hợp:'}
        </label>

        <div className="relative flex items-center">
          <input
            id="text-answer-input"
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                soundEngine.playClick();
              }
            }}
            placeholder={isMissingLetters ? 'Gõ từ hoàn chỉnh...' : 'Nhập câu trả lời...'}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full text-lg md:text-xl font-medium px-4 py-3.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
          />

          {inputValue.length > 0 && !disabled && (
            <button
              type="button"
              onClick={() => handleChange('')}
              className="absolute right-3.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md transition-colors"
            >
              Xóa
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <span>Không phân biệt chữ hoa hay chữ thường</span>
          <span>Bấm <strong>Enter</strong> hoặc chuyển câu để lưu</span>
        </div>
      </div>
    </div>
  );
};
