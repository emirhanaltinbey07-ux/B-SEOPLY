import React from 'react';
import { AlertTriangle, ArrowRight, Gift, Percent, Sparkles } from 'lucide-react';
import { ChanceCard, Team } from '../game/types';

interface ChanceCardModalProps {
  card: ChanceCard;
  team: Team;
  onApply: () => void;
  onSkipDiscount?: () => void;
}

export const ChanceCardModal: React.FC<ChanceCardModalProps> = ({
  card,
  team,
  onApply,
  onSkipDiscount,
}) => {
  const isPenalty = card.effectType === 'lose_bp' || card.kind === 'ceza';
  const isDiscount = card.effectType === 'property_discount';

  const borderClass = isPenalty
    ? 'border-[#c82828]'
    : isDiscount
      ? 'border-[#0d9475]'
      : 'border-[#d98a0b]';

  const headerBgClass = isPenalty
    ? 'bg-[#c82828]'
    : isDiscount
      ? 'bg-[#0d9475]'
      : 'bg-[#d98a0b]';

  const badgeText = isPenalty
    ? 'SÜRPRİZ CEZA KARTI'
    : isDiscount
      ? 'İNDİRİM KARTI'
      : 'BONUS KARTI';

  return (
    <div
      data-testid="bonus-discount-modal"
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.56)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chance-card-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl border-4 bg-[#fcf9f2] shadow-2xl overflow-hidden ${borderClass}`}
      >
        <div className={`px-6 py-4 text-white flex items-center gap-3 ${headerBgClass}`}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shrink-0">
            {isPenalty ? (
              <AlertTriangle className="h-6 w-6" />
            ) : isDiscount ? (
              <Percent className="h-6 w-6" />
            ) : (
              <Gift className="h-6 w-6" />
            )}
          </span>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider opacity-95">
              {badgeText} · {team.name}
            </div>
            <h2 id="chance-card-title" className="font-display text-2xl font-extrabold">
              {card.title}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              isPenalty
                ? 'border-[#f0b4b4] bg-[#fff2f2]'
                : isDiscount
                  ? 'border-[#b3e5d7] bg-[#f2fbf8]'
                  : 'border-[#e5dac6] bg-white'
            }`}
          >
            <p className="text-base font-bold text-[#0f2942] leading-relaxed">
              {card.description}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onApply}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm md:text-base font-extrabold text-white shadow-md cursor-pointer ${
                isPenalty
                  ? 'bg-[#c82828] hover:bg-[#a61d1d]'
                  : isDiscount
                    ? 'bg-[#0d9475] hover:bg-[#09735b]'
                    : 'bg-[#0c6b9a] hover:bg-[#095378]'
              }`}
            >
              {isPenalty ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isPenalty
                ? `Cezayı Onayla (-${card.value ?? 25} BP)`
                : isDiscount
                  ? 'İndirimi Uygula'
                  : 'Bonus Kartını Uygula'}
            </button>

            {isDiscount && onSkipDiscount && (
              <button
                type="button"
                onClick={onSkipDiscount}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#c7d5e0] bg-white hover:bg-[#f2f6f9] px-5 py-2.5 text-sm font-extrabold text-[#36536b] cursor-pointer"
              >
                Direkt Geç (İndirimsiz Devam Et)
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
