import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Compass, Play, Users } from 'lucide-react';
import { CHARACTER_OPTIONS, DEFAULT_TEAMS_SETUP, PAWN_COLORS } from '../game/data';
import { TeamSetupInput } from '../game/engine';
import { CharacterAvatarId } from '../game/types';

interface TeamSetupScreenProps {
  onStartGame: (teams: TeamSetupInput[]) => void;
}

function CharacterPortraitSvg({
  characterId,
  accentHex,
}: {
  characterId: CharacterAvatarId;
  accentHex: string;
}) {
  if (characterId === 'etken') {
    // Etken: Kız, turuncu saçlı, beyaz tenli
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#fff4eb" stroke={accentHex} strokeWidth="3" />
        {/* Wavy orange hair back & sides */}
        <circle cx="19" cy="30" r="10" fill="#f26e1d" />
        <circle cx="45" cy="30" r="10" fill="#f26e1d" />
        <circle cx="18" cy="40" r="7" fill="#e86214" />
        <circle cx="46" cy="40" r="7" fill="#e86214" />
        <circle cx="32" cy="22" r="13.5" fill="#f26e1d" />
        {/* Hairband */}
        <path d="M20 22 Q32 13 44 22" fill="none" stroke={accentHex} strokeWidth="2.8" strokeLinecap="round" />
        {/* Fair pale-white skin face */}
        <circle cx="32" cy="31" r="11.5" fill="#ffeae0" />
        {/* Orange bangs */}
        <path d="M21 26 Q28 20 34 25 Q39 21 43 27 Q36 22 21 26 Z" fill="#f88a36" />
        {/* Eyes, rosy cheeks, smile */}
        <circle cx="27.8" cy="30.5" r="1.8" fill="#181a20" />
        <circle cx="36.2" cy="30.5" r="1.8" fill="#181a20" />
        <ellipse cx="24" cy="34" rx="2.3" ry="1.3" fill="#f7a8a3" opacity="0.8" />
        <ellipse cx="40" cy="34" rx="2.3" ry="1.3" fill="#f7a8a3" opacity="0.8" />
        <path d="M29 35.5 Q32 38 35 35.5" fill="none" stroke="#c85a53" strokeWidth="1.7" strokeLinecap="round" />
        {/* Blouse & cardigan */}
        <path d="M16 58 C18 44, 46 44, 48 58 Z" fill={accentHex} />
        <path d="M27 45 L37 45 L35 58 L29 58 Z" fill="#fffaf2" />
      </svg>
    );
  }
  if (characterId === 'edilgen') {
    // Edilgen: Erkek, siyah kısa saçlı
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#eef5fc" stroke={accentHex} strokeWidth="3" />
        {/* Short sculpted black hair */}
        <path d="M19 29 C19 15, 45 15, 45 29 Z" fill="#16181f" />
        <path d="M23 19 Q32 12 41 19 Q36 21 26 21 Z" fill="#16181f" />
        {/* Face */}
        <circle cx="32" cy="31" r="11.5" fill="#f1c5a8" />
        {/* Short black hairline + eyebrows */}
        <path d="M21 26 Q32 20 43 26 L42 22 Q32 16 22 22 Z" fill="#16181f" />
        <line x1="25" y1="27.5" x2="30" y2="27.5" stroke="#16181f" strokeWidth="1.7" strokeLinecap="round" />
        <line x1="34" y1="27.5" x2="39" y2="27.5" stroke="#16181f" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="27.8" cy="31" r="1.8" fill="#16181f" />
        <circle cx="36.2" cy="31" r="1.8" fill="#16181f" />
        <path d="M29 36 Q32 38 35 36" fill="none" stroke="#9e5a46" strokeWidth="1.7" strokeLinecap="round" />
        {/* Varsity jacket */}
        <path d="M16 58 C18 44, 46 44, 48 58 Z" fill="#224c78" />
        <rect x="28" y="45" width="8" height="13" fill="#faf8f2" />
        <rect x="19" y="52" width="26" height="4" fill={accentHex} />
      </svg>
    );
  }
  // Dönüşlü: Kız, siyah uzun saçlı
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#eaf7f1" stroke={accentHex} strokeWidth="3" />
      {/* Long flowing black hair draping down both sides past shoulders */}
      <path d="M15 56 L17 24 C18 13, 46 13, 47 24 L49 56 Z" fill="#14161c" />
      {/* Face */}
      <circle cx="32" cy="31" r="11.5" fill="#f6ccb4" />
      {/* Side-parted black bangs */}
      <path d="M20 26 Q27 21 32 24 Q37 21 44 26 Q38 18 20 26 Z" fill="#14161c" />
      <circle cx="27.8" cy="31" r="1.8" fill="#14161c" />
      <circle cx="36.2" cy="31" r="1.8" fill="#14161c" />
      <ellipse cx="24" cy="34.5" rx="2.1" ry="1.2" fill="#f6a3a0" opacity="0.75" />
      <ellipse cx="40" cy="34.5" rx="2.1" ry="1.2" fill="#f6a3a0" opacity="0.75" />
      <path d="M29 35.8 Q32 38 35 35.8" fill="none" stroke="#c05750" strokeWidth="1.7" strokeLinecap="round" />
      {/* Sweater + team scarf */}
      <path d="M19 58 C21 45, 43 45, 45 58 Z" fill="#f4ece1" />
      <path d="M23 45 Q32 51 41 45" fill="none" stroke={accentHex} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({ onStartGame }) => {
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
      className={`fixed inset-0 z-20 overflow-y-auto overscroll-contain touch-pan-y mobile-scroll ${
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
        <header className="mx-auto text-center max-w-2xl pointer-events-auto pt-[env(safe-area-inset-top)]">
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border-2 border-[#e23b26] px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#b72818] shadow-md mb-2"
            style={{ backgroundColor: 'rgba(255, 250, 242, 0.95)' }}
          >
            <Compass className="h-3.5 w-3.5 shrink-0 text-[#e23b26]" />
            8. Sınıf Türkçe · Fiilde Çatı · 3D İstanbul Masa Oyunu
          </div>
          <h1
            className="font-display text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white"
            style={{
              textShadow: '0 4px 18px rgba(15, 41, 66, 0.62), 0 1px 2px rgba(15, 41, 66, 0.85)',
            }}
          >
            BİSEOPLY
          </h1>
          <p
            className="mt-1 font-display text-base sm:text-lg md:text-2xl font-bold text-[#fff5d6]"
            style={{ textShadow: '0 2px 10px rgba(15, 41, 66, 0.72)' }}
          >
            İstanbul Senin, Oyun Senin
          </p>
        </header>

        {/* Bottom 3-Team Setup Panel (fully scrollable vertically on phones & compact screens) */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[#d4c3a3] p-3.5 sm:p-4 md:p-5 shadow-2xl pointer-events-auto"
          style={{ backgroundColor: 'rgba(252, 249, 242, 0.96)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 shrink-0 text-[#0c6b9a]" />
              <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-[#0f2942]">
                Üç Takımı ve 3D Öğrenci Karakterlerini Hazırla
              </h2>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-[#35556e] bg-[#eef5fa] border border-[#cde0ed] rounded-lg px-2.5 sm:px-3 py-1">
              Başlangıç: 100 BP · 20 Türkçe Sorusu (20 sn) · 25 Dakika · En Çok Gayrimenkul Kazanır
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
                  <div className="grid grid-cols-3 gap-1.5">
                    {CHARACTER_OPTIONS.map((charOpt) => {
                      const selected = team.characterId === charOpt.id;
                      return (
                        <button
                          key={charOpt.id}
                          type="button"
                          onClick={() => handleCharacterSelect(idx, charOpt.id)}
                          className={`rounded-lg border px-1.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer text-center ${
                            selected
                              ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-sm'
                              : 'bg-[#f6f8fa] text-[#28445c] border-[#d7e1e8] hover:border-[#0c6b9a]'
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
            İpucu: 3D tahtayı parmağınızla veya fareyle döndürebilir, Taksim, Galata ve BANKA binasına tıklayabilirsiniz.
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#e23b26] hover:bg-[#c32d1b] text-white font-extrabold px-7 py-3.5 sm:py-3 text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-current" />
            İstanbul Turuna Başla
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
                ? 'bg-[#e23b26] hover:bg-[#c32d1b] text-white shadow-sm active:scale-95'
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
