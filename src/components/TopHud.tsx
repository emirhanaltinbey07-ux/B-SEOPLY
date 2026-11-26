import React from 'react';
import { BookOpen, Building2, Compass, MapPin, Pause, Volume2, VolumeX } from 'lucide-react';
import { BOARD_TILES, CHARACTER_OPTIONS, QUESTIONS_PER_TEAM } from '../game/data';
import { getTeamRealEstateCount } from '../game/engine';
import { Team } from '../game/types';

interface TopHudProps {
  teams: Team[];
  activeTeamIndex: number;
  questionsSolved: number;
  totalQuestions: number;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResetCamera: () => void;
  onOpenLesson: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  teams,
  activeTeamIndex,
  questionsSolved,
  totalQuestions,
  muted,
  onToggleMute,
  onPause,
  onResetCamera,
  onOpenLesson,
}) => {
  return (
    <header className="fixed top-[max(0.5rem,env(safe-area-inset-top))] left-2 right-2 sm:left-3 sm:right-3 z-20 flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-between gap-1.5 lg:gap-2 pointer-events-none">
      {/* Mobile Row 1 (Brand + Utilities) / Desktop Left Block (Brand) */}
      <div className="flex items-center justify-between gap-1.5 lg:contents">
        {/* Brand + Question Progress */}
        <div
          className="flex items-center gap-2 sm:gap-2.5 rounded-xl border-2 border-[#d4c3a3] px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg pointer-events-auto lg:order-1"
          style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-[#6d44a6] text-white font-display font-black text-xs sm:text-sm shadow-sm">
              S
            </span>
            <div className="leading-tight">
              <div className="font-display text-xs sm:text-sm font-black text-[#0f2942] tracking-tight">
                SÖZOPLY
              </div>
              <div className="text-[10px] font-bold text-[#526d85]">
                Soru {questionsSolved}/{totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Utility Buttons */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 rounded-xl border-2 border-[#d4c3a3] p-1 sm:p-1.5 shadow-lg pointer-events-auto lg:order-3"
          style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
        >
          <button
            type="button"
            onClick={onOpenLesson}
            aria-label="1. Kısım: Konu Anlatımı"
            title="1. Kısım: Konu Anlatımı"
            className="inline-flex items-center gap-1 rounded-lg bg-[#f4eefb] hover:bg-[#e8ddf7] px-2 sm:px-2.5 py-1.5 text-xs font-extrabold text-[#552d8c] cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#6d44a6]" />
            <span className="hidden xl:inline">Konu</span>
          </button>

          <button
            type="button"
            onClick={onResetCamera}
            aria-label="Genel İstanbul Görünümü"
            title="Genel İstanbul Görünümü"
            className="inline-flex items-center gap-1 rounded-lg bg-[#edf6fb] hover:bg-[#d8ecf8] px-2 sm:px-2.5 py-1.5 text-xs font-bold text-[#0f2942] cursor-pointer"
          >
            <Compass className="h-4 w-4 text-[#0c6b9a]" />
            <span className="hidden xl:inline">Genel</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Sesi Aç' : 'Sesi Kapat'}
            title={muted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="rounded-lg bg-[#f4f1ea] hover:bg-[#e7e0d2] p-1.5 text-[#0f2942] cursor-pointer"
          >
            {muted ? <VolumeX className="h-4 w-4 text-[#b42318]" /> : <Volume2 className="h-4 w-4 text-[#0c6b9a]" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            aria-label="Oyunu Duraklat"
            title="Oyunu Duraklat"
            className="rounded-lg bg-[#f4f1ea] hover:bg-[#e7e0d2] p-1.5 text-[#0f2942] cursor-pointer"
          >
            <Pause className="h-4 w-4 text-[#0f2942]" />
          </button>
        </div>
      </div>

      {/* 3 Live Team Scoreboards: compact 3-column grid on mobile, rich cards on desktop */}
      <div className="grid grid-cols-3 lg:flex lg:flex-wrap items-stretch lg:items-center gap-1.5 lg:gap-2 pointer-events-auto lg:order-2">
        {teams.map((team, idx) => {
          const isActive = idx === activeTeamIndex;
          const realEstate = getTeamRealEstateCount(team);
          const charName =
            CHARACTER_OPTIONS.find((c) => c.id === team.characterId)?.name ?? 'Benzetme';
          const tileLabel = BOARD_TILES[team.position]?.shortLabel ?? 'BAŞLANGIÇ';

          return (
            <div
              key={team.id}
              data-testid={`team-hud-${team.id}`}
              className={`rounded-lg sm:rounded-xl border-2 overflow-hidden shadow-md lg:shadow-lg transition-transform min-w-0 ${
                isActive ? 'lg:scale-[1.04] ring-2 lg:ring-3 ring-[#facc15] shadow-xl' : 'opacity-95'
              }`}
              style={{
                borderColor: team.colorHex,
                backgroundColor: '#ffffff',
              }}
            >
              {/* Solid Distinct Team-Color Header Banner */}
              <div
                className="px-1.5 sm:px-3 py-0.5 sm:py-1 flex items-center justify-between gap-1 sm:gap-2 text-white"
                style={{ backgroundColor: team.colorHex }}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-xs font-black tracking-tight truncate max-w-[74px] sm:max-w-[118px] drop-shadow-xs">
                    {team.name}
                  </span>
                  <span className="hidden sm:inline-block rounded bg-black/22 px-1.5 py-0.5 text-[10px] font-extrabold text-white shrink-0">
                    {charName}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-[#fde047] text-[#1c1917] shadow-xs shrink-0">
                    Sıra
                  </span>
                )}
              </div>

              {/* Soft Color-Tinted Metrics Strip */}
              <div
                className="px-1.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono-num"
                style={{ backgroundColor: `${team.colorHex}14` }}
              >
                <span className="font-black text-[#0a4f78] whitespace-nowrap">{team.bp} TL</span>
                <span className="hidden sm:inline text-[#b8ab96]">|</span>
                <span
                  className="inline-flex items-center gap-0.5 font-extrabold text-[#117044] whitespace-nowrap"
                  title="İlçe sayısı (En çok ilçe alan kazanır)"
                >
                  <Building2 className="h-3 w-3 shrink-0" />
                  {realEstate}
                  <span className="hidden sm:inline"> İlçe</span>
                </span>
                <span className="hidden lg:inline text-[#b8ab96]">|</span>
                <span className="hidden lg:inline text-[11px] font-bold text-[#334e66]">
                  {team.questionsAnswered}/{QUESTIONS_PER_TEAM}S
                </span>
                <span className="hidden md:inline text-[#b8ab96]">|</span>
                <span
                  className="hidden md:inline-flex items-center gap-0.5 font-sans text-[10px] font-extrabold text-[#1e3a52] truncate max-w-[92px]"
                  title={`Konum: ${BOARD_TILES[team.position]?.name ?? tileLabel}`}
                >
                  <MapPin className="h-3 w-3 shrink-0" style={{ color: team.colorHex }} />
                  <span className="truncate">{tileLabel}</span>
                </span>
                {team.jailTurnsRemaining > 0 && (
                  <span className="rounded bg-[#334155] px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-sans font-extrabold text-white">
                    BEKLE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
