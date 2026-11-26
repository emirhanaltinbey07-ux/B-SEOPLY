import React, { useState } from 'react';
import {
  BookOpenCheck,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  ShieldCheck,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Unlock,
  X,
} from 'lucide-react';
import { OFFICIAL_ANSWER_KEY, QUESTION_CARDS } from '../game/data';
import { GameState } from '../game/types';

interface TeacherPanelModalProps {
  gameState: GameState;
  onOpenFinalReview: () => void;
  onSwitchActiveTeam: (teamIdx: number) => void;
  onAdjustBp: (teamIdx: number, delta: number) => void;
  onClearJail: (teamIdx: number) => void;
  onSkipQuestion: () => void;
  onPrevQuestion: () => void;
  onRestartGame: () => void;
  onClose: () => void;
}

export const TeacherPanelModal: React.FC<TeacherPanelModalProps> = ({
  gameState,
  onOpenFinalReview,
  onSwitchActiveTeam,
  onAdjustBp,
  onClearJail,
  onSkipQuestion,
  onPrevQuestion,
  onRestartGame,
  onClose,
}) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-5"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.68)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-panel-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-4 border-[#5e3fa3] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#3a2863] px-6 py-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#d9c8ff]">
                SINIF YÖNETİMİ VE DERS KONTROLÜ
              </div>
              <h2 id="teacher-panel-title" className="font-display text-2xl font-extrabold">
                Öğretmen Kontrol Paneli
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Öğretmen panelini kapat"
            className="rounded-xl bg-white/15 hover:bg-white/25 p-2 text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Row 1: Question Deck Controls */}
          <div className="rounded-xl border border-[#dfd3be] bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase text-[#3a2863]">
                {QUESTION_CARDS.length} Soruluk Deste Kontrolü
              </span>
              <span className="font-mono-num text-xs font-extrabold text-[#526d85]">
                Kalan: {gameState.questionDeckQueue.length}/{QUESTION_CARDS.length} · Sıradaki: Soru{' '}
                {gameState.questionDeckQueue[0] ?? '-'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPrevQuestion}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef2f6] hover:bg-[#dce4ec] px-3 py-2 text-xs font-bold text-[#0f2942] cursor-pointer"
              >
                <SkipBack className="h-3.5 w-3.5" />
                Önceki Soruya Dön
              </button>
              <button
                type="button"
                onClick={onSkipQuestion}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef2f6] hover:bg-[#dce4ec] px-3 py-2 text-xs font-bold text-[#0f2942] cursor-pointer"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Sıradaki Soruyu Atla
              </button>
              <button
                type="button"
                onClick={onOpenFinalReview}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef5f0] hover:bg-[#dcece1] border border-[#b7dac2] px-3 py-2 text-xs font-extrabold text-[#175838] cursor-pointer"
              >
                <BookOpenCheck className="h-3.5 w-3.5" />
                Özet &amp; Final
              </button>
              <button
                type="button"
                onClick={onRestartGame}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#fdeeee] hover:bg-[#fbdcdc] border border-[#e8a5a5] px-3 py-2 text-xs font-extrabold text-[#a82418] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Oyunu Sıfırla
              </button>
            </div>
          </div>

          {/* Row 2: 3-Team Live Adjustments (Switch Turn, BP +/-, Clear Jail) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {gameState.teams.map((team, idx) => {
              const isActive = idx === gameState.activeTeamIndex;
              return (
                <div
                  key={team.id}
                  className="rounded-xl border-2 bg-white p-3.5 space-y-2.5"
                  style={{ borderColor: team.colorHex }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-extrabold text-[#0f2942] truncate">
                      {team.name}
                    </span>
                    <span className="font-mono-num text-sm font-black text-[#0c6b9a]">
                      {team.bp} TL
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSwitchActiveTeam(idx)}
                      disabled={isActive}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-extrabold cursor-pointer ${
                        isActive
                          ? 'bg-[#e8f8ef] text-[#146c43]'
                          : 'bg-[#0f2942] hover:bg-[#1b3f63] text-white'
                      }`}
                    >
                      {isActive ? 'Aktif Sıra' : 'Sırayı Ver'}
                    </button>

                    {team.jailTurnsRemaining > 0 && (
                      <button
                        type="button"
                        onClick={() => onClearJail(idx)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#d97706] hover:bg-[#b45309] px-2 py-1.5 text-[11px] font-extrabold text-white cursor-pointer"
                      >
                        <Unlock className="h-3 w-3" />
                        Beklemeyi Kaldır
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {[50, 10, -10, -25].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => onAdjustBp(idx, delta)}
                        className={`rounded-lg py-1 font-mono-num text-[11px] font-extrabold cursor-pointer ${
                          delta > 0
                            ? 'bg-[#e8f8ef] hover:bg-[#d2f1df] text-[#146c43]'
                            : 'bg-[#fdeeee] hover:bg-[#fbdcdc] text-[#a82418]'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 3: Official Teacher Answer Key (1..15) — Hidden by default for projector safety! */}
          <div className="rounded-xl border-2 border-[#cfc5e3] bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#5e3fa3]" />
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#0f2942]">
                    Resmî Öğretmen Cevap Anahtarı (1–{QUESTION_CARDS.length})
                  </h3>
                  <p className="text-[11px] font-semibold text-[#5b6f82]">
                    Öğrencilere cevap vermeden önce gösterilmez; yalnızca öğretmen kontrolü içindir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5e3fa3] hover:bg-[#492f82] px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showKey ? 'Cevap Anahtarını Gizle' : 'Cevap Anahtarını Göster'}
              </button>
            </div>

            {showKey && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {QUESTION_CARDS.map((q) => {
                  const ansRecord = gameState.answeredQuestions.find(
                    (r) => r.questionNumber === q.number
                  );
                  return (
                    <div
                      key={q.number}
                      className={`rounded-lg border px-2.5 py-2 text-xs flex items-center justify-between ${
                        ansRecord
                          ? 'bg-[#eef6fb] border-[#b8d8eb]'
                          : 'bg-[#faf7f0] border-[#e5dfd2]'
                      }`}
                    >
                      <span className="font-bold text-[#35556e]">Soru {q.number}</span>
                      <span className="inline-flex items-center gap-1 font-mono-num font-black text-[#3a2863]">
                        {OFFICIAL_ANSWER_KEY[q.number]}
                        {ansRecord && <ShieldCheck className="h-3.5 w-3.5 text-[#198754]" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
