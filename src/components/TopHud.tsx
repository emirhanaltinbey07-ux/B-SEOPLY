import React from 'react';
import { Building2, Clock, Compass, MapPin, Pause, Volume2, VolumeX } from 'lucide-react';
import { BOARD_TILES, CHARACTER_OPTIONS, FINAL_PHASE_THRESHOLD_SECONDS, QUESTIONS_PER_TEAM } from '../game/data';
import { formatCountdown, getTeamRealEstateCount } from '../game/engine';
import { Team } from '../game/types';

interface TopHudProps {
  teams: Team[];
  activeTeamIndex: number;
  remainingSeconds: number;
  questionsSolved: number;
  totalQuestions: number;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResetCamera: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  teams,
  activeTeamIndex,
  remainingSeconds,
  questionsSolved,
  totalQuestions,
  muted,
  onToggleMute,
  onPause,
  onResetCamera,
}) => {
  const isFinal5Min = remainingSeconds <= FINAL_PHASE_THRESHOLD_SECONDS;

  return (
    <header className="fixed top-2.5 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      {/* Brand + 15:00 Timer + Question Progress */}
      <div
        className="flex items-center gap-2.5 rounded-xl border-2 border-[#d4c3a3] px-3 py-1.5 shadow-lg pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        <div className="flex items-center gap-1.5 pr-2 border-r border-[#dfd3be]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#e23b26] text-white font-display font-black text-sm shadow-sm">
            B
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-black text-[#0f2942] tracking-tight">
              BİSEOPLY
            </div>
            <div className="text-[10px] font-bold text-[#526d85]">
              Soru {questionsSolved}/{totalQuestions}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono-num text-sm font-extrabold border ${
            isFinal5Min
              ? 'bg-[#fff0ec] text-[#c42d2d] border-[#e5928c]'
              : 'bg-[#edf6fb] text-[#0f2942] border-[#c5dfee]'
          }`}
          aria-label={`Kalan süre ${formatCountdown(remainingSeconds)}`}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <span>{formatCountdown(remainingSeconds)}</span>
          {isFinal5Min && (
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide ml-1">
              Son 5 Dk
            </span>
          )}
        </div>
      </div>

      {/* 3 Live Team Scoreboards (Distinct Bold Team Colors, BP, Gayrimenkul, Quota, Location) */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {teams.map((team, idx) => {
          const isActive = idx === activeTeamIndex;
          const realEstate = getTeamRealEstateCount(team);
          const charName =
            CHARACTER_OPTIONS.find((c) => c.id === team.characterId)?.name ?? 'Etken';
          const tileLabel = BOARD_TILES[team.position]?.shortLabel ?? 'BAŞLANGIÇ';

          return (
            <div
              key={team.id}
              data-testid={`team-hud-${team.id}`}
              className={`rounded-xl border-2 overflow-hidden shadow-lg transition-transform ${
                isActive ? 'scale-[1.04] ring-3 ring-[#facc15] shadow-xl' : 'opacity-95'
              }`}
              style={{
                borderColor: team.colorHex,
                backgroundColor: '#ffffff',
              }}
            >
              {/* Solid Distinct Team-Color Header Banner */}
              <div
                className="px-3 py-1 flex items-center justify-between gap-2 text-white"
                style={{ backgroundColor: team.colorHex }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-black tracking-tight truncate max-w-[118px] drop-shadow-xs">
                    {team.name}
                  </span>
                  <span className="rounded bg-black/22 px-1.5 py-0.5 text-[10px] font-extrabold text-white shrink-0">
                    {charName}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fde047] text-[#1c1917] shadow-xs shrink-0">
                    Sıra
                  </span>
                )}
              </div>

              {/* Soft Color-Tinted Metrics Strip */}
              <div
                className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono-num"
                style={{ backgroundColor: `${team.colorHex}14` }}
              >
                <span className="font-black text-[#0a4f78]">{team.bp} BP</span>
                <span className="text-[#b8ab96]">|</span>
                <span
                  className="inline-flex items-center gap-0.5 font-extrabold text-[#117044]"
                  title="Gayrimenkul sayısı (Şampiyonluk ölçütü)"
                >
                  <Building2 className="h-3 w-3" />
                  {realEstate} Mülk
                </span>
                <span className="text-[#b8ab96]">|</span>
                <span className="text-[11px] font-bold text-[#334e66]">
                  {team.questionsAnswered}/{QUESTIONS_PER_TEAM}S
                </span>
                <span className="text-[#b8ab96]">|</span>
                <span
                  className="inline-flex items-center gap-0.5 font-sans text-[10px] font-extrabold text-[#1e3a52] truncate max-w-[92px]"
                  title={`Konum: ${BOARD_TILES[team.position]?.name ?? tileLabel}`}
                >
                  <MapPin className="h-3 w-3 shrink-0" style={{ color: team.colorHex }} />
                  <span className="truncate">{tileLabel}</span>
                </span>
                {team.jailTurnsRemaining > 0 && (
                  <span className="rounded bg-[#334155] px-1.5 py-0.5 text-[10px] font-sans font-extrabold text-white">
                    HAPİS
                  </span>
                )}
                {team.activeBankLoan && (
                  <span className="rounded bg-[#b45309] px-1.5 py-0.5 text-[10px] font-sans font-extrabold text-white">
                    BORÇ
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Utility Buttons */}
      <div
        className="flex items-center gap-1.5 rounded-xl border-2 border-[#d4c3a3] p-1.5 shadow-lg pointer-events-auto"
        style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
      >
        <button
          type="button"
          onClick={onResetCamera}
          aria-label="Genel İstanbul Görünümü"
          title="Genel İstanbul Görünümü"
          className="inline-flex items-center gap-1 rounded-lg bg-[#edf6fb] hover:bg-[#d8ecf8] px-2.5 py-1.5 text-xs font-bold text-[#0f2942] cursor-pointer"
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
    </header>
  );
};
