import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Compass, Play, Users } from 'lucide-react';
import { CHARACTER_OPTIONS, DEFAULT_TEAMS_SETUP, PAWN_COLORS } from '../game/data';
import { TeamSetupInput } from '../game/engine';
import { CharacterAvatarId } from '../game/types';

interface TeamSetupScreenProps {
  onStartGame: (teams: TeamSetupInput[]) => void;
  onOpenLesson: () => void;
}

function CharacterPortraitSvg({
  characterId,
  accentHex,
}: {
  characterId: CharacterAvatarId;
  accentHex: string;
}) {
  if (characterId === 'etken') {
    // Benzetme: Cesur Aslan Maskotu
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#fff7e6" stroke={accentHex} strokeWidth="3" />
        {/* Fluffy sunburst lion mane */}
        <circle cx="32" cy="14" r="7.5" fill="#d96b1f" />
        <circle cx="43" cy="18" r="7.2" fill="#c75614" />
        <circle cx="48" cy="29" r="7.2" fill="#d96b1f" />
        <circle cx="44" cy="40" r="7" fill="#c75614" />
        <circle cx="32" cy="44" r="7.2" fill="#d96b1f" />
        <circle cx="20" cy="40" r="7" fill="#c75614" />
        <circle cx="16" cy="29" r="7.2" fill="#d96b1f" />
        <circle cx="21" cy="18" r="7.2" fill="#c75614" />
        {/* Round lion ears */}
        <circle cx="20" cy="18" r="5" fill="#f4b94c" />
        <circle cx="20" cy="18" r="2.7" fill="#ffe1c2" />
        <circle cx="44" cy="18" r="5" fill="#f4b94c" />
        <circle cx="44" cy="18" r="2.7" fill="#ffe1c2" />
        {/* Warm golden lion face */}
        <circle cx="32" cy="29" r="12" fill="#f8c96b" />
        {/* Cream muzzle pad */}
        <ellipse cx="32" cy="33.5" rx="6.2" ry="4.4" fill="#fff1d6" />
        {/* Eyes, rosy cheeks, button nose & happy smile */}
        <circle cx="27.5" cy="27.5" r="2.1" fill="#181a20" />
        <circle cx="28.1" cy="26.9" r="0.7" fill="#ffffff" />
        <circle cx="36.5" cy="27.5" r="2.1" fill="#181a20" />
        <circle cx="37.1" cy="26.9" r="0.7" fill="#ffffff" />
        <ellipse cx="23.5" cy="31.5" rx="2.2" ry="1.3" fill="#f58a7a" opacity="0.75" />
        <ellipse cx="40.5" cy="31.5" rx="2.2" ry="1.3" fill="#f58a7a" opacity="0.75" />
        <polygon points="30,31.2 34,31.2 32,33.6" fill="#5c2e16" />
        <path d="M29 35.4 Q32 37.8 35 35.4" fill="none" stroke="#8a3c16" strokeWidth="1.7" strokeLinecap="round" />
        {/* Team explorer vest & scarf */}
        <path d="M17 58 C19 45, 45 45, 47 58 Z" fill={accentHex} />
        <path d="M27 46 L37 46 L35 58 L29 58 Z" fill="#fff1d6" />
        <path d="M23 45 Q32 50 41 45" fill="none" stroke="#f6c945" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  // Kişileştirme: Neşeli Bulut Maskotu
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#e8f6ff" stroke={accentHex} strokeWidth="3" />
      {/* Mini rainbow & gold star charm on top */}
      <path d="M16 20 A9 9 0 0 1 28 14" fill="none" stroke="#ff5a7a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 21 A7 7 0 0 1 27 16" fill="none" stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round" />
      <polygon
        points="45,10 46.6,13.4 50.4,13.9 47.6,16.5 48.3,20.2 45,18.4 41.7,20.2 42.4,16.5 39.6,13.9 43.4,13.4"
        fill="#ffca28"
        stroke="#d98b00"
        strokeWidth="0.9"
      />
      {/* Fluffy layered cloud head */}
      <circle cx="21" cy="29" r="9.5" fill="#d8eeff" />
      <circle cx="43" cy="29" r="9.5" fill="#d8eeff" />
      <circle cx="25" cy="21" r="9.5" fill="#f7fcff" />
      <circle cx="39" cy="21" r="9.5" fill="#f7fcff" />
      <circle cx="32" cy="19" r="10" fill="#ffffff" />
      <circle cx="32" cy="30" r="12" fill="#ffffff" />
      <circle cx="22" cy="30" r="8.5" fill="#ffffff" />
      <circle cx="42" cy="30" r="8.5" fill="#ffffff" />
      {/* Expressive face */}
      <circle cx="27.2" cy="28.5" r="2.2" fill="#182235" />
      <circle cx="27.9" cy="27.8" r="0.75" fill="#ffffff" />
      <circle cx="36.8" cy="28.5" r="2.2" fill="#182235" />
      <circle cx="37.5" cy="27.8" r="0.75" fill="#ffffff" />
      <ellipse cx="22.8" cy="32.2" rx="2.4" ry="1.4" fill="#f79bb2" opacity="0.85" />
      <ellipse cx="41.2" cy="32.2" rx="2.4" ry="1.4" fill="#f79bb2" opacity="0.85" />
      <path d="M28.5 33.8 Q32 37.5 35.5 33.8" fill="none" stroke="#2563eb" strokeWidth="1.9" strokeLinecap="round" />
      {/* Sky-blue tunic + team scarf */}
      <path d="M18 58 C20 46, 44 46, 46 58 Z" fill="#38bdf8" />
      <path d="M23 46 Q32 52 41 46" fill="none" stroke={accentHex} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({
  onStartGame,
  onOpenLesson,
}) => {
  const [teams, setTeams] = useState<TeamSetupInput[]>(
    DEFAULT_TEAMS_SETUP.map((t) => ({ ...t }))
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollInfo, setScrollInfo] = useState({ canScrollUp: false, canScrollDown: false });

  const updateScrollInfo = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const canScrollUp = el.scrollTop > 12;
    const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 12;
    setScrollInfo((prev) =>
      prev.canScrollUp === canScrollUp && prev.canScrollDown === canScrollDown
        ? prev
        : { canScrollUp, canScrollDown }
    );
  }, []);

  useEffect(() => {
    updateScrollInfo();
    const raf = window.requestAnimationFrame(updateScrollInfo);
    window.addEventListener('resize', updateScrollInfo);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateScrollInfo);
    };
  }, [updateScrollInfo, errorMsg]);

  const scrollByStep = (direction: 'up' | 'down') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientHeight * 0.55));
    el.scrollBy({ top: direction === 'down' ? step : -step, behavior: 'smooth' });
  };

  const handleNameChange = (idx: number, value: string) => {
    setErrorMsg(null);
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name: value } : t)));
  };

  const handleColorSelect = (idx: number, colorId: string) => {
    setErrorMsg(null);
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, colorId } : t)));
  };

  const handleCharacterSelect = (idx: number, characterId: CharacterAvatarId) => {
    setErrorMsg(null);
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, characterId } : t)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teams.some((t) => t.name.trim().length === 0)) {
      setErrorMsg('Lütfen üç takımın da adını yazınız.');
      return;
    }
    const colorSet = new Set(teams.map((t) => t.colorId));
    if (colorSet.size < 3) {
      setErrorMsg('Her takım farklı bir renk seçmelidir.');
      return;
    }
    onStartGame(teams);
  };

  const isScrollable = scrollInfo.canScrollUp || scrollInfo.canScrollDown;

  return (
    <div
      ref={scrollContainerRef}
      onScroll={updateScrollInfo}
      data-testid="setup-scroll-container"
      className={`fixed inset-0 z-20 overflow-y-auto overscroll-contain touch-pan-y mobile-scroll screen-fade-in ${
        isScrollable ? 'pointer-events-auto' : 'pointer-events-auto md:pointer-events-none'
      }`}
    >
      <div
        className={`min-h-full flex flex-col justify-between gap-4 sm:gap-5 px-3 pt-4 sm:p-5 md:p-6 ${
          isScrollable
            ? 'pb-[max(5.25rem,calc(4.5rem+env(safe-area-inset-bottom)))]'
            : 'pb-[max(2rem,env(safe-area-inset-bottom))]'
        }`}
      >
        {/* Top Title Hero floating over the live sunlit 3D Istanbul Diorama */}
        <header className="mx-auto w-full max-w-5xl pointer-events-auto pt-[env(safe-area-inset-top)]">
          <div className="flex justify-start mb-2">
            <button
              type="button"
              onClick={onOpenLesson}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-[#6d44a6] px-3.5 py-1.5 text-xs font-extrabold text-[#4c2b7a] shadow-md hover:bg-white transition-colors cursor-pointer"
              style={{ backgroundColor: 'rgba(255, 252, 255, 0.96)' }}
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#6d44a6]" />
              <span>1. Kısım: Konu Anlatımına Dön</span>
            </button>
          </div>

          <div className="mx-auto text-center max-w-2xl">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border-2 border-[#6d44a6] px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#552d8c] shadow-md mb-2"
              style={{ backgroundColor: 'rgba(255, 251, 255, 0.96)' }}
            >
              <Compass className="h-3.5 w-3.5 shrink-0 text-[#d81b75]" />
              5. Sınıf Türkçe · Söz Sanatları · 2. Kısım: 3D İstanbul Oyunu
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white"
              style={{
                textShadow: '0 4px 18px rgba(15, 41, 66, 0.62), 0 1px 2px rgba(15, 41, 66, 0.85)',
              }}
            >
              SÖZOPLY
            </h1>
            <p
              className="mt-1 font-display text-base sm:text-lg md:text-2xl font-bold text-[#fff5d6]"
              style={{ textShadow: '0 2px 10px rgba(15, 41, 66, 0.72)' }}
            >
              Söz Sanatları ile İstanbul Senin, Oyun Senin
            </p>
          </div>
        </header>

        {/* Bottom 3-Team Setup Panel (fully scrollable vertically on phones & compact screens) */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[#d4c3e6] p-3.5 sm:p-4 md:p-5 shadow-2xl pointer-events-auto"
          style={{ backgroundColor: 'rgba(252, 250, 255, 0.97)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 shrink-0 text-[#6d44a6]" />
              <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-[#142236]">
                Takımları ve Karakterleri Seç
              </h2>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-[#4a3569] bg-[#f4eefb] border border-[#dccdf0] rounded-lg px-2.5 sm:px-3 py-1">
              Başlangıç: 100 TL · 20 Türkçe Sorusu (2 dk) · 25 Dakika · En Çok İlçe Alan Kazanır
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
          {teams.map((team, idx) => {
            const activeColor =
              PAWN_COLORS.find((c) => c.id === team.colorId) ?? PAWN_COLORS[idx];

            return (
              <div
                key={idx}
                className="rounded-xl border-2 p-3 bg-white shadow-sm flex flex-col gap-2.5"
                style={{ borderColor: activeColor.hex }}
              >
                <div className="flex items-center gap-2.5">
                  <CharacterPortraitSvg
                    characterId={team.characterId}
                    accentHex={activeColor.hex}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`team-name-${idx}`}
                      className="block text-[11px] font-extrabold uppercase tracking-wider text-[#4b677f] mb-1"
                    >
                      {idx + 1}. Takım Adı
                    </label>
                    <input
                      id={`team-name-${idx}`}
                      type="text"
                      value={team.name}
                      maxLength={24}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Takım ${idx + 1} adını yazın`}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-2.5 py-1.5 text-sm font-bold text-[#0f2942] focus:border-[#0c6b9a] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3D Student Character Picker */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#4b677f] mb-1">
                    <span>Karakter Seçimi</span>
                    <span className="text-[10px] font-semibold text-[#0c6b9a]">
                      {CHARACTER_OPTIONS.find((c) => c.id === team.characterId)?.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CHARACTER_OPTIONS.map((charOpt) => {
                      const selected = team.characterId === charOpt.id;
                      return (
                        <button
                          key={charOpt.id}
                          type="button"
                          onClick={() => handleCharacterSelect(idx, charOpt.id)}
                          className={`rounded-lg border px-2 py-2 text-xs font-extrabold transition-all cursor-pointer text-center ${
                            selected
                              ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-sm'
                              : 'bg-[#f6f8fa] text-[#28445c] border-[#d7e1e8] hover:border-[#6d44a6]'
                          }`}
                        >
                          {charOpt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Color Picker */}
                <div>
                  <div className="text-[11px] font-bold text-[#4b677f] mb-1">
                    Takım Rengi ({activeColor.name})
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PAWN_COLORS.map((color) => {
                      const isSelected = team.colorId === color.id;
                      const usedByOther = teams.some(
                        (other, oIdx) => oIdx !== idx && other.colorId === color.id
                      );
                      return (
                        <button
                          key={color.id}
                          type="button"
                          aria-label={`${idx + 1}. Takım için ${color.name}`}
                          onClick={() => handleColorSelect(idx, color.id)}
                          disabled={usedByOther}
                          className={`h-8 w-8 sm:h-7 sm:w-7 rounded-full border-2 transition-transform cursor-pointer ${
                            isSelected
                              ? 'scale-110 ring-2 ring-offset-1 ring-[#0f2942] border-white'
                              : usedByOther
                                ? 'opacity-25 cursor-not-allowed border-transparent'
                                : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-3 rounded-lg bg-[#fdecec] border border-[#e23b26] px-3 py-2 text-xs font-bold text-[#a82418]"
          >
            {errorMsg}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-[#476075]">
            İpucu: 3D tahtayı döndürebilir, ortadaki Soru, Ödül ya da Ceza ve İlçe kartlarına tıklayabilirsin.
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#d81b75] hover:bg-[#b81462] text-white font-extrabold px-7 py-3.5 sm:py-3 text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-current" />
            SÖZOPLY’ye Başla
          </button>
        </div>
        </form>
      </div>

      {/* Clean non-overlapping Yukarı / Aşağı Scroll Bar whenever setup content overflows (phones & compact screens) */}
      {isScrollable && (
        <div
          data-testid="setup-scroll-controls"
          className="fixed bottom-[max(0.65rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border-2 border-[#d4c3a3] px-2.5 py-1.5 shadow-2xl pointer-events-auto"
          style={{ backgroundColor: 'rgba(252, 249, 242, 0.97)' }}
        >
          <button
            type="button"
            onClick={() => scrollByStep('up')}
            disabled={!scrollInfo.canScrollUp}
            aria-label="Yukarı kaydır"
            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
              scrollInfo.canScrollUp
                ? 'bg-[#0f2942] hover:bg-[#193d5e] text-white shadow-sm active:scale-95'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            <ChevronUp className="h-4 w-4 shrink-0" />
            Yukarı
          </button>
          <button
            type="button"
            onClick={() => scrollByStep('down')}
            disabled={!scrollInfo.canScrollDown}
            aria-label="Aşağı kaydır"
            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
              scrollInfo.canScrollDown
                ? 'bg-[#d81b75] hover:bg-[#b81462] text-white shadow-sm active:scale-95'
                : 'bg-[#e6dfd2] text-[#83919e] cursor-not-allowed'
            }`}
          >
            Aşağı
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};
