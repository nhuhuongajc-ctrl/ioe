import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SanitizedQuestion, UserAnswerPayload } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { ExamNavbar } from '../skins/ExamNavbar';
import { QuestionRenderer } from '../interactions/QuestionRenderer';
import { ExamReviewView } from './ExamReviewView';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface ExamArenaViewProps {
  prepareParams: {
    blueprintId?: string;
    grade?: number;
    mode?: string;
    gameSkin?: string;
    skill?: string;
    topic?: string;
    count?: number;
  };
  onBackToHome: () => void;
}

export const ExamArenaView: React.FC<ExamArenaViewProps> = ({
  prepareParams,
  onBackToHome
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string>('');
  const [ticketToken, setTicketToken] = useState<string>('');
  const [examTitle, setExamTitle] = useState<string>('Bài thi IOE');
  const [grade, setGrade] = useState<number>(prepareParams.grade || 5);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [answersMap, setAnswersMap] = useState<Record<string, UserAnswerPayload>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<any | null>(null);

  const timerRef = useRef<any>(null);
  const dirtyAnswersRef = useRef<Record<string, UserAnswerPayload>>({});

  // 1. Prepare Attempt
  useEffect(() => {
    let isMounted = true;

    async function initExam() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await api.prepareAttempt(prepareParams);
        if (!isMounted) return;

        setAttemptId(data.attemptId);
        setTicketToken(data.ticketToken);
        setExamTitle(data.title);
        setGrade(data.grade);
        setQuestions(data.questions);
        setRemainingSeconds(data.durationMinutes * 60);

        // Activate attempt
        await api.activateAttempt(data.attemptId, data.ticketToken);

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Không thể khởi tạo đề thi');
        setIsLoading(false);
      }
    }

    initExam();
    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Authoritative Timer Loop
  useEffect(() => {
    if (isLoading || reviewData) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        if (prev <= 10) {
          soundEngine.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, reviewData]);

  // 3. Periodic Background Sync for Buffered Answers
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const pending = { ...dirtyAnswersRef.current };
      if (Object.keys(pending).length > 0 && attemptId) {
        api.syncAnswersBatch(attemptId, pending).then(() => {
          dirtyAnswersRef.current = {};
        }).catch(err => console.warn('Background sync retry pending...', err));
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [attemptId]);

  // 4. Keyboard Shortcuts for Next/Previous Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length]);

  const handleAnswerChange = (ans: UserAnswerPayload) => {
    setAnswersMap(prev => ({
      ...prev,
      [ans.questionId]: ans
    }));
    dirtyAnswersRef.current[ans.questionId] = ans;
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      soundEngine.playClick();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      soundEngine.playClick();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting || reviewData) return;
    setIsSubmitting(true);
    try {
      const outcome = await api.submitAttempt(attemptId, answersMap);
      soundEngine.playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setReviewData({
        attemptId,
        grade,
        mode: prepareParams.mode || 'mock_exam',
        ...outcome
      });
    } catch (err: any) {
      console.error('Auto-submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, answersMap, grade, isSubmitting, reviewData, prepareParams.mode]);

  const handleManualSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const outcome = await api.submitAttempt(attemptId, answersMap);
      soundEngine.playFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setReviewData({
        attemptId,
        grade,
        mode: prepareParams.mode || 'mock_exam',
        ...outcome
      });
    } catch (err: any) {
      alert('Không thể nộp bài: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-slate-800">Đang chuẩn bị đề thi IOE...</h2>
        <p className="text-sm text-slate-500">Hệ thống đang tải ngân hàng câu hỏi chuẩn cho Khối {grade}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-4 max-w-md mx-auto text-center">
        <div className="text-rose-500 text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900">Không thể bắt đầu bài thi</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={onBackToHome}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  if (reviewData) {
    return (
      <ExamReviewView
        attemptSummary={reviewData}
        onBackToHome={onBackToHome}
        onRetake={() => {
          setReviewData(null);
          setCurrentIndex(0);
          setAnswersMap({});
          setIsLoading(true);
          api.prepareAttempt(prepareParams).then(data => {
            setAttemptId(data.attemptId);
            setTicketToken(data.ticketToken);
            setQuestions(data.questions);
            setRemainingSeconds(data.durationMinutes * 60);
            api.activateAttempt(data.attemptId, data.ticketToken);
            setIsLoading(false);
          });
        }}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answersMap).length;
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Exam Header */}
      <ExamNavbar
        title={examTitle}
        grade={grade}
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answeredCount={answeredCount}
        remainingSeconds={remainingSeconds}
        answersMap={answersMap}
        questions={questions}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
        onSubmit={handleManualSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Main Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        {currentQuestion && (
          <QuestionRenderer
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            currentAnswer={currentAnswer}
            onAnswerChange={handleAnswerChange}
          />
        )}
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="sticky bottom-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={goToPrev}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Câu trước</span>
          </button>

          {/* Quick Indicator */}
          <div className="text-xs md:text-sm font-semibold text-slate-600">
            Câu <strong>{currentIndex + 1}</strong> / {questions.length}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleManualSubmit}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Nộp bài thi</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNext}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Câu tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
