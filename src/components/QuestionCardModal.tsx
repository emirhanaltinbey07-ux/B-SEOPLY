import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Clock, HelpCircle, Sparkles, XCircle } from 'lucide-react';
import { CORRECT_ANSWER_BP, QUESTION_CARDS, QUESTION_TIME_LIMIT_SECONDS } from '../game/data';
import { OptionLetter, QuestionCard, Team } from '../game/types';

interface QuestionCardModalProps {
  question: QuestionCard;
  team: Team;
  tileName: string;
  outcome: {
    questionNumber: number;
    selectedAnswer: OptionLetter | null;
    correctAnswer: OptionLetter;
    correct: boolean;
    timedOut?: boolean;
    deltaBp: number;
    explanation: string;
  } | null;
  onSubmitAnswer: (selected: OptionLetter) => void;
  onTimeout: () => void;
  onContinue: () => void;
  onSkipBonusCard: () => void;
}

export const QuestionCardModal: React.FC<QuestionCardModalProps> = ({
  question,
  team,
  tileName,
  outcome,
  onSubmitAnswer,
  onTimeout,
  onContinue,
  onSkipBonusCard,
}) => {
  const [selected, setSelected] = useState<OptionLetter | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(QUESTION_TIME_LIMIT_SECONDS);
  const timeoutFiredRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const isAnswered = outcome !== null && outcome.questionNumber === question.number;

  // Reset timer and selection whenever a new question card opens
  useEffect(() => {
    setSelected(null);
    setSecondsLeft(QUESTION_TIME_LIMIT_SECONDS);
    timeoutFiredRef.current = false;
  }, [question.number]);

  // Live 15-second countdown while unanswered
  useEffect(() => {
    if (isAnswered) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          if (!timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            onTimeoutRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isAnswered, question.number]);

  const handleConfirm = () => {
    if (!selected || isAnswered) return;
    timeoutFiredRef.current = true;
    onSubmitAnswer(selected);
  };

  const timePct = Math.max(0, Math.min(100, (secondsLeft / QUESTION_TIME_LIMIT_SECONDS) * 100));
  const isUrgent = !isAnswered && secondsLeft <= 5;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-5"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.62)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-card-title"
    >
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border-4 border-[#f27b1a] bg-[#fcf9f2] shadow-2xl">
        {/* Card Header */}
        <div className="bg-[#f27b1a] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#d95b0c] font-display text-xl font-black shadow-sm">
              {question.number}
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider opacity-95">
                SORU KARTI {question.number} / {QUESTION_CARDS.length} · {tileName}
              </div>
              <h2 id="question-card-title" className="font-display text-xl md:text-2xl font-extrabold">
                Fiilde Çatı Görevi · {team.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 15-Second Live Countdown Badge */}
            <div
              data-testid="question-timer-badge"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono-num text-sm font-black shadow-sm transition-colors ${
                isAnswered
                  ? 'bg-white/20 text-white'
                  : isUrgent
                    ? 'bg-[#b91c1c] text-white animate-pulse'
                    : 'bg-white text-[#0f2942]'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{secondsLeft} sn</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-extrabold">
              <HelpCircle className="h-4 w-4" />
              <span>Doğru: +{CORRECT_ANSWER_BP} BP · Yanlış / Süre: -25 BP</span>
            </div>
          </div>
        </div>

        {/* Visual 15-Second Countdown Bar */}
        <div className="h-2 w-full bg-[#eedcc8] overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 linear ${
              isUrgent ? 'bg-[#d93025]' : isAnswered ? 'bg-[#198754]' : 'bg-[#0c6b9a]'
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Question Body */}
        <div className="p-5 md:p-6 space-y-4">
          {question.quoteBlock && (
            <blockquote className="rounded-xl border-l-4 border-[#0c6b9a] bg-[#eef6fb] px-5 py-3.5 text-base md:text-lg font-bold text-[#0f2942] whitespace-pre-line leading-relaxed">
              {question.quoteBlock}
            </blockquote>
          )}

          <p className="text-lg md:text-xl font-extrabold text-[#0f2942] leading-snug">
            {question.stem}
          </p>

          {/* 4 Large Smartboard-Friendly A/B/C/D Option Buttons */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {question.options.map((opt) => {
              const isChosen = (isAnswered ? outcome.selectedAnswer : selected) === opt.letter;
              const isCorrectOpt = isAnswered && outcome.correctAnswer === opt.letter;
              const isWrongChosen = isAnswered && isChosen && !outcome.correct;

              let btnStyle =
                'bg-white border-[#d2dce4] text-[#0f2942] hover:border-[#f27b1a] hover:bg-[#fff8f1]';
              if (!isAnswered && isChosen) {
                btnStyle =
                  'bg-[#fff3e4] border-[#f27b1a] text-[#0f2942] ring-2 ring-[#f27b1a]/40 shadow-sm';
              } else if (isCorrectOpt) {
                btnStyle = 'bg-[#e8f8ef] border-[#198754] text-[#0d4d2f] ring-2 ring-[#198754]/40';
              } else if (isWrongChosen) {
                btnStyle = 'bg-[#fdeeee] border-[#c83737] text-[#7c1919] ring-2 ring-[#c83737]/30';
              }

              return (
                <button
                  key={opt.letter}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelected(opt.letter)}
                  aria-pressed={isChosen}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 text-left transition-all flex items-center gap-3.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono-num text-base font-black ${
                      isCorrectOpt
                        ? 'bg-[#198754] text-white'
                        : isWrongChosen
                          ? 'bg-[#c83737] text-white'
                          : isChosen
                            ? 'bg-[#f27b1a] text-white'
                            : 'bg-[#edf2f7] text-[#1d3549]'
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-base md:text-lg font-bold leading-snug flex-1">
                    {opt.text}
                  </span>
                  {isCorrectOpt && <CheckCircle2 className="h-6 w-6 text-[#198754] shrink-0" />}
                  {isWrongChosen && <XCircle className="h-6 w-6 text-[#c83737] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Post-Submission Outcome Box */}
          {isAnswered && (
            <div
              role="status"
              className={`rounded-xl border-2 p-4 flex items-start gap-3 ${
                outcome.correct
                  ? 'bg-[#e8f8ef] border-[#198754] text-[#0f4c2f]'
                  : 'bg-[#fdeeee] border-[#c83737] text-[#7c1919]'
              }`}
            >
              {outcome.correct ? (
                <Award className="h-7 w-7 text-[#198754] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-7 w-7 text-[#c83737] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-base font-black">
                  {outcome.correct
                    ? `Tebrikler ${team.name}! Doğru Cevap (+${outcome.deltaBp} BP)`
                    : outcome.timedOut
                      ? `Süre Doldu (${QUESTION_TIME_LIMIT_SECONDS} sn)! (${outcome.deltaBp} BP) · Doğru Seçenek: ${outcome.correctAnswer}`
                      : `Yanlış Cevap (${outcome.deltaBp} BP) · Doğru Seçenek: ${outcome.correctAnswer}`}
                </div>
                <p className="text-sm font-semibold leading-relaxed opacity-95">
                  {outcome.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e5dac6]">
            <div className="text-xs font-bold text-[#526d85] max-w-sm">
              {isAnswered
                ? outcome.correct
                  ? 'İsterseniz sürpriz Bonus/İndirim/Ceza kartı çekebilir veya direkt geçebilirsiniz.'
                  : 'Yanlış veya süresi dolan sorularda bonus kartı verilmez.'
                : `${QUESTION_TIME_LIMIT_SECONDS} saniye içinde doğru seçeneği işaretleyip onaylayınız (${secondsLeft} sn kaldı).`}
            </div>

            {!isAnswered ? (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selected}
                className={`rounded-xl px-7 py-3 text-base font-extrabold shadow-md transition-all cursor-pointer ${
                  selected
                    ? 'bg-[#0c6b9a] hover:bg-[#095378] text-white'
                    : 'bg-[#d8d1c5] text-[#838f99] cursor-not-allowed'
                }`}
              >
                Cevabı Onayla
              </button>
            ) : outcome.correct ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onSkipBonusCard}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0c6b9a] bg-white hover:bg-[#edf6fb] px-4 py-2.5 text-sm md:text-base font-extrabold text-[#0c6b9a] shadow-sm cursor-pointer"
                >
                  Direkt Geç
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#149a7c] hover:bg-[#0f7d64] px-5 py-2.5 text-sm md:text-base font-extrabold text-white shadow-md cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Bonus / İndirim Kartı Çek
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b9a] hover:bg-[#095378] px-6 py-3 text-base font-extrabold text-white shadow-md cursor-pointer"
              >
                Devam Et
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

