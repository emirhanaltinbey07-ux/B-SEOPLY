import React from 'react';
import { Building2, MapPin, Tag } from 'lucide-react';
import { BOARD_TILES } from '../game/data';
import { computeEffectiveAssetPrice } from '../game/engine';
import { PropertyAsset, Team } from '../game/types';

interface PropertyCardModalProps {
  asset: PropertyAsset;
  team: Team;
  onPurchase: () => void;
  onSkip: () => void;
}

export const PropertyCardModal: React.FC<PropertyCardModalProps> = ({
  asset,
  team,
  onPurchase,
  onSkip,
}) => {
  const effectivePrice = computeEffectiveAssetPrice(team, asset);
  const canAfford = team.bp >= effectivePrice;
  const district = BOARD_TILES[asset.districtTileIndex];
  const discountTl = Math.round(team.nextPropertyDiscount);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.58)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-card-title"
    >
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain mobile-scroll rounded-2xl border-4 border-[#149a7c] bg-[#fcf9f2] shadow-2xl">
        <div
          className="px-6 py-4 text-white flex items-center justify-between gap-3"
          style={{ backgroundColor: asset.color }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider opacity-95">
                İSTANBUL İLÇE KARTI
              </div>
              <h2 id="property-card-title" className="font-display text-2xl font-extrabold">
                {asset.name}
              </h2>
            </div>
          </div>

          <div className="rounded-xl bg-white/20 px-3 py-1.5 text-right font-mono-num">
            <div className="text-[10px] font-sans uppercase font-bold opacity-90">Fiyat</div>
            <div className="text-xl font-black">{effectivePrice} TL</div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf6fb] border border-[#c5dfee] px-3 py-1.5 text-[#0f2942]">
              <MapPin className="h-3.5 w-3.5 text-[#0c6b9a]" />
              Bölge: {district?.name ?? 'İstanbul'}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 border bg-[#e8f8ef] border-[#9fd7b8] text-[#125e3b]">
              <Tag className="h-3.5 w-3.5" />
              En Çok İlçe Alan Kazanır!
            </span>
          </div>

          <p className="text-sm md:text-base font-semibold text-[#1d3549] leading-relaxed bg-white rounded-xl border border-[#e3d9c6] p-4">
            {asset.marketInfo}
          </p>

          {discountTl > 0 && (
            <div className="rounded-xl bg-[#fef6e2] border border-[#e5c16c] px-4 py-2 text-xs font-extrabold text-[#855809]">
              İndirim kartın uygulandı ({discountTl} TL indirim kazandınız)! Normal fiyat{' '}
              {asset.price} TL → {effectivePrice} TL.
            </div>
          )}

          <div className="rounded-xl bg-[#f4efe4] border border-[#ded3be] px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-bold text-[#35556e]">{team.name} Parası:</span>
            <span
              className={`font-mono-num text-base font-black ${
                canAfford ? 'text-[#147a4b]' : 'text-[#c42d2d]'
              }`}
            >
              {team.bp} TL
            </span>
          </div>

          {!canAfford && (
            <div className="rounded-xl bg-[#fff4eb] border border-[#e5a87a] p-3 text-xs font-bold text-[#8c3d0c]">
              Bu ilçe için {effectivePrice - team.bp} TL daha gerekiyor. Soruları doğru bilerek ve
              ödül karelerinden TL kazanabilirsin!
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 rounded-xl border-2 border-[#c9bda8] bg-white hover:bg-[#f4f1ea] px-4 py-3 text-sm font-extrabold text-[#35556e] cursor-pointer"
            >
              Pas Geç
            </button>
            <button
              type="button"
              onClick={onPurchase}
              disabled={!canAfford}
              className={`flex-[2] rounded-xl px-5 py-3 text-sm md:text-base font-extrabold shadow-md cursor-pointer ${
                canAfford
                  ? 'bg-[#149a7c] hover:bg-[#0f7d64] text-white'
                  : 'bg-[#d8d1c5] text-[#838f99] cursor-not-allowed'
              }`}
            >
              {effectivePrice} TL ile İlçeyi Al
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
