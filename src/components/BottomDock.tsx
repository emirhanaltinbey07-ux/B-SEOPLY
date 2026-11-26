import React from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  Building2,
  Dices,
  Gift,
  HelpCircle,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { Team, TurnPhase } from '../game/types';

interface BottomDockProps {
  activeTeam: Team;
  turnPhase: TurnPhase;
  lastDiceValue: number | null;
  bannerMessage: string;
  allQuestionsCompleted?: boolean;
  onRollDice: () => void;
  onDrawQuestionCard: () => void;
  onDrawChanceCard: () => void;
  onDrawPropertyCard: () => void;
  onNextTeam: () => void;
  onOpenInventory: () => void;
  onOpenTeacherPanel: () => void;
  onOpenFinalReview: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTeam,
  turnPhase,
  lastDiceValue,
  bannerMessage,
  allQuestionsCompleted = false,
  onRollDice,
  onDrawQuestionCard,
  onDrawChanceCard,
  onDrawPropertyCard,
  onNextTeam,
  onOpenInventory,
  onOpenTeacherPanel,
  onOpenFinalReview,
}) => {
  const isBusy =
    turnPhase === 'rolling_dice' ||
    turnPhase === 'showing_dice_result' ||
    turnPhase === 'running_student' ||
    turnPhase === 'jail_decision' ||
    turnPhase === 'drawing_question_card' ||
    turnPhase === 'drawing_property_card' ||
    turnPhase === 'drawing_chance_card';

  const canRoll =
    !allQuestionsCompleted && turnPhase === 'ready_to_roll' && activeTeam.jailTurnsRemaining === 0;
  const canDrawQuestion = !allQuestionsCompleted && turnPhase === 'ready_to_draw_question';
  const canDrawChance = turnPhase === 'ready_to_draw_chance';
  const canDrawProperty = turnPhase === 'ready_to_draw_property';
  const canPassTurn =
    allQuestionsCompleted ||
    turnPhase === 'turn_complete' ||
    turnPhase === 'ready_to_draw_property' ||
    (turnPhase === 'ready_to_draw_question' &&
      activeTeam.jailTurnsRemaining === 0 &&
      lastDiceValue === null);

  return (
    <div className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 sm:left-3 sm:right-3 z-20 flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-none">
      {/* Compact turn announcement bar */}
      <div
        className="w-full max-w-md lg:max-w-3xl rounded-xl border border-[#d4c3a3] px-3 sm:px-4 py-1 sm:py-1.5 text-center shadow-md pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-bold text-[#0f2942]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeTeam.colorHex }}
          />
          <span className="line-clamp-2 sm:line-clamp-1">{bannerMessage}</span>
          {lastDiceValue !== null && (
            <span className="ml-1 rounded bg-[#0f2942] px-1.5 sm:px-2 py-0.5 font-mono-num text-[11px] sm:text-xs font-extrabold text-white shrink-0">
              Zar: {lastDiceValue}
            </span>
          )}
        </div>
      </div>

      {/* Responsive Command Dock: Clean 2-row grid on mobile, single row on desktop */}
      <nav
        aria-label="Oyun Kontrolleri"
        className="w-full max-w-md lg:max-w-none lg:w-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-1.5 lg:gap-2 rounded-2xl border-2 border-[#d4c3a3] p-2 lg:px-3 lg:py-2 shadow-xl pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        {/* Row 1: Primary Turn Progression Buttons (Zar, Soru, Ödül/Ceza, İlçe, Sıra Geç) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:flex items-center gap-1.5 lg:gap-2">
          <button
            type="button"
            onClick={onRollDice}
            disabled={!canRoll || isBusy}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              canRoll && !isBusy
                ? 'bg-[#e23b26] hover:bg-[#c32d1b] text-white ring-2 ring-[#f7b5a8]'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            <Dices className="h-4 w-4 shrink-0" />
            Zar At
          </button>

          <button
            type="button"
            onClick={onDrawQuestionCard}
            disabled={!canDrawQuestion || isBusy}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              canDrawQuestion && !isBusy
                ? 'bg-[#6d44a6] hover:bg-[#573389] text-white ring-2 ring-[#d4bff2]'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Soru Çek</span>
            <span className="hidden sm:inline">Soru Kartı</span>
          </button>

          <button
            type="button"
            onClick={onDrawChanceCard}
            disabled={!canDrawChance || isBusy}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              canDrawChance && !isBusy
                ? 'bg-[#d81b75] hover:bg-[#b51460] text-white ring-2 ring-[#f6b1d3]'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            <Gift className="h-4 w-4 shrink-0" />
            <span>Ödül ya da Ceza</span>
          </button>

          <button
            type="button"
            onClick={onDrawPropertyCard}
            disabled={!canDrawProperty || isBusy}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              canDrawProperty && !isBusy
                ? 'bg-[#149a7c] hover:bg-[#0f7d64] text-white ring-2 ring-[#9de5d3]'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">İlçe Çek</span>
            <span className="hidden sm:inline">İlçe Kartı</span>
          </button>

          <button
            type="button"
            onClick={onNextTeam}
            disabled={!canPassTurn || isBusy}
            className={`col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              canPassTurn && !isBusy
                ? allQuestionsCompleted
                  ? 'bg-[#d49a1a] hover:bg-[#b58110] text-white ring-2 ring-[#f4cf6a]'
                  : 'bg-[#0c6b9a] hover:bg-[#095378] text-white'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            {allQuestionsCompleted ? (
              <>
                <Trophy className="h-4 w-4 shrink-0" />
                {turnPhase === 'ready_to_draw_property' ? 'Oyunu Bitir' : 'Şampiyonu Gör'}
              </>
            ) : (
              <>
                <span className="sm:hidden">Sıra Geç</span>
                <span className="hidden sm:inline">Sonraki Takım</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </>
            )}
          </button>
        </div>

        <div className="hidden lg:block h-7 w-px bg-[#dfd3be] mx-0.5" aria-hidden="true" />

        {/* Row 2: Classroom Tools (Bank removed!) */}
        <div className="grid grid-cols-3 lg:flex items-center gap-1.5 lg:gap-2">
          <button
            type="button"
            onClick={onOpenInventory}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-[#edf6fb] hover:bg-[#d8ecf8] border border-[#bedbef] px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-bold text-[#0f2942] whitespace-nowrap cursor-pointer"
          >
            <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0c6b9a] shrink-0" />
            <span>İlçeler</span>
          </button>

          <button
            type="button"
            onClick={onOpenTeacherPanel}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-[#f3f0f8] hover:bg-[#e5dff0] border border-[#cfc5e3] px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-bold text-[#3a2863] whitespace-nowrap cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5e3fa3] shrink-0" />
            <span>Öğretmen</span>
          </button>

          <button
            type="button"
            onClick={onOpenFinalReview}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-extrabold whitespace-nowrap cursor-pointer ${
              allQuestionsCompleted
                ? 'bg-[#1a5f8a] hover:bg-[#134768] text-white border-[#1a5f8a] ring-2 ring-[#93c5e6]'
                : 'bg-[#eef5f0] hover:bg-[#dcece1] text-[#175838] border-[#b7dac2]'
            }`}
          >
            <BookOpenCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="sm:hidden">Özet</span>
            <span className="hidden sm:inline">Özet &amp; Final</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
