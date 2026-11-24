import React from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  Building2,
  Dices,
  HelpCircle,
  Landmark,
  SlidersHorizontal,
} from 'lucide-react';
import { Team, TurnPhase } from '../game/types';

interface BottomDockProps {
  activeTeam: Team;
  turnPhase: TurnPhase;
  lastDiceValue: number | null;
  bannerMessage: string;
  isFinalPhase: boolean;
  onRollDice: () => void;
  onDrawQuestionCard: () => void;
  onDrawPropertyCard: () => void;
  onNextTeam: () => void;
  onOpenBank: () => void;
  onOpenInventory: () => void;
  onOpenTeacherPanel: () => void;
  onOpenFinalReview: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTeam,
  turnPhase,
  lastDiceValue,
  bannerMessage,
  isFinalPhase,
  onRollDice,
  onDrawQuestionCard,
  onDrawPropertyCard,
  onNextTeam,
  onOpenBank,
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

  const canRoll = turnPhase === 'ready_to_roll' && activeTeam.jailTurnsRemaining === 0;
  const canDrawQuestion = turnPhase === 'ready_to_draw_question';
  const canDrawProperty = turnPhase === 'ready_to_draw_property';
  const canPassTurn =
    turnPhase === 'turn_complete' ||
    turnPhase === 'ready_to_draw_property' ||
    (turnPhase === 'ready_to_draw_question' && activeTeam.jailTurnsRemaining === 0 && lastDiceValue === null);

  return (
    <div className="fixed bottom-3 left-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-none">
      {/* Compact 1-line turn announcement bar */}
      <div
        className="max-w-3xl rounded-xl border border-[#d4c3a3] px-4 py-1.5 text-center shadow-md pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-[#0f2942]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeTeam.colorHex }}
          />
          <span>{bannerMessage}</span>
          {lastDiceValue !== null && (
            <span className="ml-1 rounded bg-[#0f2942] px-2 py-0.5 font-mono-num text-xs font-extrabold text-white">
              Zar: {lastDiceValue}
            </span>
          )}
        </div>
      </div>

      {/* Single-row tactile desktop command dock */}
      <nav
        aria-label="Oyun Kontrolleri"
        className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-2 rounded-2xl border-2 border-[#d4c3a3] px-3 py-2 shadow-xl pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        {/* 1. Primary Turn Progression Button */}
        <button
          type="button"
          onClick={onRollDice}
          disabled={!canRoll || isBusy}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
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
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
            canDrawQuestion && !isBusy
              ? 'bg-[#f27b1a] hover:bg-[#d6660e] text-white ring-2 ring-[#fbd4a8]'
              : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
          }`}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Soru Kartı Çek
        </button>

        <button
          type="button"
          onClick={onDrawPropertyCard}
          disabled={!canDrawProperty || isBusy}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
            canDrawProperty && !isBusy
              ? 'bg-[#149a7c] hover:bg-[#0f7d64] text-white ring-2 ring-[#9de5d3]'
              : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
          }`}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          Emlak Kartı Çek
        </button>

        <button
          type="button"
          onClick={onNextTeam}
          disabled={!canPassTurn || isBusy}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer ${
            canPassTurn && !isBusy
              ? 'bg-[#0c6b9a] hover:bg-[#095378] text-white'
              : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
          }`}
        >
          Sonraki Takım
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>

        <div className="hidden lg:block h-7 w-px bg-[#dfd3be] mx-0.5" aria-hidden="true" />

        {/* 2. Economic & Classroom Management Tools */}
        <button
          type="button"
          onClick={onOpenBank}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#fef6e2] hover:bg-[#fceac2] border border-[#dfc078] px-3 py-2.5 text-xs md:text-sm font-extrabold text-[#7d5208] whitespace-nowrap cursor-pointer"
        >
          <Landmark className="h-4 w-4 text-[#c88a1e] shrink-0" />
          Banka & Ticaret
        </button>

        <button
          type="button"
          onClick={onOpenInventory}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#edf6fb] hover:bg-[#d8ecf8] border border-[#bedbef] px-3 py-2.5 text-xs md:text-sm font-bold text-[#0f2942] whitespace-nowrap cursor-pointer"
        >
          <Briefcase className="h-4 w-4 text-[#0c6b9a] shrink-0" />
          Envanter
        </button>

        <button
          type="button"
          onClick={onOpenTeacherPanel}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#f3f0f8] hover:bg-[#e5dff0] border border-[#cfc5e3] px-3 py-2.5 text-xs md:text-sm font-bold text-[#3a2863] whitespace-nowrap cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#5e3fa3] shrink-0" />
          Öğretmen
        </button>

        <button
          type="button"
          onClick={onOpenFinalReview}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs md:text-sm font-extrabold whitespace-nowrap cursor-pointer ${
            isFinalPhase
              ? 'bg-[#1a5f8a] hover:bg-[#134768] text-white border-[#1a5f8a] ring-2 ring-[#93c5e6]'
              : 'bg-[#eef5f0] hover:bg-[#dcece1] text-[#175838] border-[#b7dac2]'
          }`}
        >
          <BookOpenCheck className="h-4 w-4 shrink-0" />
          Final & Değerlendirme
        </button>
      </nav>
    </div>
  );
};
