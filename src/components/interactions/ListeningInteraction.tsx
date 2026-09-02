import React, { useState, useRef } from 'react';
import { SanitizedQuestion, UserAnswerPayload } from '../../shared/types/ioe';
import { ChoiceInteraction } from './ChoiceInteraction';
import { TextEntryInteraction } from './TextEntryInteraction';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

interface ListeningInteractionProps {
  question: SanitizedQuestion;
  currentAnswer?: UserAnswerPayload;
  onAnswerChange: (answer: UserAnswerPayload) => void;
  disabled?: boolean;
}

export const ListeningInteraction: React.FC<ListeningInteractionProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  disabled
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [playCount, setPlayCount] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAudio = () => {
    // If has audio URL, play it; else synthesize with WebSpeech
    if (question.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(question.audioUrl);
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          // Fallback to speech synthesis
          fallbackSpeech();
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setPlayCount(prev => prev + 1);
          })
          .catch(() => fallbackSpeech());
      }
    } else {
      fallbackSpeech();
    }
  };

  const fallbackSpeech = () => {
    soundEngine.speakWord(question.prompt || 'Listen carefully');
    setPlayCount(prev => prev + 1);
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const isChoiceVariant = Boolean(question.options && question.options.length > 0);

  return (
    <div className="w-full space-y-6">
      {/* Audio Player Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-indigo-700/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={togglePlayAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg transform active:scale-95 cursor-pointer
                ${isPlaying ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-300/40 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-400 text-white ring-4 ring-indigo-400/30'}
              `}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-indigo-300" />
                <span className="font-bold text-lg text-white">Bài nghe IOE</span>
                <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full">
                  Đã nghe: {playCount} lần
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Bấm vào nút Play để nghe đoạn băng phát âm chuẩn
              </p>
            </div>
          </div>

          {/* Playback speed selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 px-1 font-medium">Tốc độ:</span>
            {[0.8, 1.0, 1.2].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => changeSpeed(speed)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors
                  ${playbackRate === speed ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}
                `}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Answer Section */}
      <div className="pt-2">
        {isChoiceVariant ? (
          <ChoiceInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        ) : (
          <TextEntryInteraction
            question={question}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
