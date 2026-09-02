import React from 'react';
import { SanitizedQuestion, UserAnswerPayload } from '../../shared/types/ioe';
import { ChoiceInteraction } from './ChoiceInteraction';
import { TextEntryInteraction } from './TextEntryInteraction';
import { OrderingInteraction } from './OrderingInteraction';
import { MatchingInteraction } from './MatchingInteraction';
import { ListeningInteraction } from './ListeningInteraction';
import { Star, Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface QuestionRendererProps {
  question: SanitizedQuestion;
  questionIndex: number;
  totalQuestions: number;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case 'vocabulary': return 'Từ vựng';
      case 'grammar': return 'Ngữ pháp';
      case 'reading': return 'Đọc hiểu';
      case 'listening': return 'Nghe hiểu';
      default: return 'Tổng hợp';
    }
  };

  const renderInteraction = () => {
    const family = question.interaction?.family;
    switch (family) {
      case 'choice':
        return (
          <ChoiceInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      case 'text-entry':
        return (
          <TextEntryInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      case 'ordering':
        return (
          <OrderingInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      case 'matching':
        return (
          <MatchingInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      case 'listening':
        return (
          <ListeningInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      case 'image':
        return (
          <ChoiceInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <ChoiceInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-8 space-y-6">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="bg-indigo-600 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-xs">
            Câu {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-lg border border-indigo-100">
            Khối {question.grade} • {getSkillLabel(question.skill)}
          </span>
          {question.topic && (
            <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
              {question.topic}
            </span>
          )}
        </div>

        {/* Difficulty Stars */}
        <div className="flex items-center space-x-1" title={`Độ khó: ${question.difficulty}/5`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= (question.difficulty || 2)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Prompt */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
            {question.prompt}
          </h2>
          <button
            type="button"
            title="Nghe phát âm đề bài"
            onClick={() => soundEngine.speakWord(question.prompt)}
            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Question Image if present */}
        {question.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50 flex items-center justify-center p-2">
            <img
              src={question.imageUrl}
              alt="Hình ảnh minh họa cho câu hỏi"
              className="max-h-64 object-contain rounded-xl"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Interaction Body */}
      <div className="pt-2">
        {renderInteraction()}
      </div>
    </div>
  );
};
