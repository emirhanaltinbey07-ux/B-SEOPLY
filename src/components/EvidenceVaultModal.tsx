import React, { useState } from 'react';
import { BookOpenCheck, CheckCircle2, Trophy, X, XCircle } from 'lucide-react';
import { FIILDE_CATI_SUMMARY, QUESTION_CARDS } from '../game/data';
import { getRankedTeams } from '../game/engine';
import { AnsweredQuestionRecord, Team } from '../game/types';

interface EvidenceVaultModalProps {
  answeredQuestions: AnsweredQuestionRecord[];
  teams: Team[];
  onClose: () => void;
  onAnnounceWinner: () => void;
}

/**
 * Son 5 Dakika: Fiilde Çatı Değerlendirme & Özet Paneli
 * Reviews ONLY the 15 user-provided questions and Fiilde Çatı rules (ZERO new test questions!)
 */
export const EvidenceVaultModal: React.FC<EvidenceVaultModalProps> = ({
  answeredQuestions,
  teams,
  onClose,
  onAnnounceWinner,
}) => {
  const [view, setView] = useState<'summary' | 'questions'>('summary');
  const ranked = getRankedTeams(teams);
  const leader = ranked[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-5"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.66)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-review-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-4 border-[#1a5f8a] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a5f8a] px-6 py-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <BookOpenCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#cfe9fa]">
                SON 5 DAKİKA · FİİLDE ÇATI DEĞERLENDİRME VE FİNAL
              </div>
              <h2 id="final-review-title" className="font-display text-2xl font-extrabold">
                Fiilde Çatı Konu Özeti &amp; Çözülen {QUESTION_CARDS.length} Soru
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Değerlendirme panelini kapat"
            className="rounded-xl bg-white/15 hover:bg-white/25 p-2 text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-[#f2ece0] border-b border-[#dfd3be]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('summary')}
              className={`rounded-xl px-4 py-2 text-xs md:text-sm font-extrabold cursor-pointer ${
                view === 'summary'
                  ? 'bg-[#1a5f8a] text-white'
                  : 'bg-white text-[#28445c] border border-[#d6cbb6]'
              }`}
            >
              Fiilde Çatı Özet Tablosu
            </button>
            <button
              type="button"
              onClick={() => setView('questions')}
              className={`rounded-xl px-4 py-2 text-xs md:text-sm font-extrabold cursor-pointer ${
                view === 'questions'
                  ? 'bg-[#1a5f8a] text-white'
                  : 'bg-white text-[#28445c] border border-[#d6cbb6]'
              }`}
            >
              Çözülen Sorular ({answeredQuestions.length}/{QUESTION_CARDS.length})
            </button>
          </div>

          <div className="text-xs font-extrabold text-[#146c43] bg-[#e8f8ef] border border-[#9fd7b8] rounded-lg px-3 py-1.5">
            Şu An Lider: {leader.name} ({leader.realEstateCount} Gayrimenkul)
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {view === 'summary' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FIILDE_CATI_SUMMARY.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-[#dcd2be] bg-white p-4 shadow-xs space-y-1.5"
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0c6b9a]">
                    {item.group}
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-[#0f2942]">
                    {item.name}
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-[#334e68] leading-relaxed">
                    {item.rule}
                  </p>
                  <div className="rounded-lg bg-[#eef6fb] px-3 py-1.5 text-xs font-bold text-[#0f2942]">
                    Örnek: {item.example}
                  </div>
                </div>
              ))}
            </div>
          ) : answeredQuestions.length === 0 ? (
            <div className="rounded-xl border border-[#dfd3be] bg-white p-6 text-center text-sm font-bold text-[#526d85]">
              Henüz soru kartı çözülmedi. Oyun sırasında çözülen {QUESTION_CARDS.length} sorunun tamamı ve açıklamaları burada listelenir.
            </div>
          ) : (
            <div className="space-y-2.5">
              {answeredQuestions.map((rec) => {
                const q = QUESTION_CARDS.find((c) => c.number === rec.questionNumber);
                return (
                  <div
                    key={rec.questionNumber}
                    className="rounded-xl border border-[#dfd3be] bg-white p-3.5 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a5f8a] text-white font-mono-num text-xs font-black">
                          {rec.questionNumber}
                        </span>
                        <span className="text-xs font-extrabold text-[#0f2942]">
                          {rec.teamName} · {rec.tileName}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                          rec.isCorrect
                            ? 'bg-[#e8f8ef] text-[#146c43]'
                            : 'bg-[#fdeeee] text-[#a82418]'
                        }`}
                      >
                        {rec.isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {rec.timedOut || rec.selectedAnswer === null
                          ? `Süre Doldu · Doğru: ${rec.correctAnswer}`
                          : `Seçilen: ${rec.selectedAnswer} · Doğru: ${rec.correctAnswer}`}
                      </span>
                    </div>
                    {q && (
                      <>
                        <p className="text-xs md:text-sm font-bold text-[#0f2942]">{q.stem}</p>
                        <p className="text-xs font-semibold text-[#3f5970] bg-[#faf7f0] rounded-lg px-3 py-1.5">
                          {q.explanation}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-[#f2ece0] border-t border-[#dfd3be] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-[#3f5970]">
            Final sıralaması yalnızca <span className="text-[#146c43] font-black">Gayrimenkul sayısına</span> göre belirlenir.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#c9bda8] bg-white hover:bg-[#faf7f0] px-4 py-2.5 text-xs md:text-sm font-bold text-[#35556e] cursor-pointer"
            >
              Oyuna Dön
            </button>
            <button
              type="button"
              onClick={onAnnounceWinner}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d49a1a] hover:bg-[#b58110] px-6 py-2.5 text-sm md:text-base font-black text-white shadow-md cursor-pointer"
            >
              <Trophy className="h-5 w-5" />
              Şampiyonu Açıkla!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
