import React from 'react';
import {
  Briefcase,
  Building2,
  Coins,
  Crown,
  Eye,
  Landmark,
  MapPin,
  Plane,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { CHARACTER_OPTIONS, JAIL_BAIL_BP, PROPERTY_ASSETS } from '../game/data';
import { getRankedTeams } from '../game/engine';
import { BoardTile, PeerLoan, SpecialEventToast, Team } from '../game/types';

/* 1. Inspected Istanbul Tile / Landmark Floating Card */
interface LandmarkInfoCardProps {
  tile: BoardTile;
  onClose: () => void;
}

export const LandmarkInfoCard: React.FC<LandmarkInfoCardProps> = ({ tile, onClose }) => {
  return (
    <aside
      aria-label={`${tile.name} lokasyon bilgisi`}
      className="fixed top-20 right-4 z-20 w-80 max-w-[92vw] rounded-2xl border-2 bg-[#fcf9f2] shadow-2xl overflow-hidden"
      style={{ borderColor: tile.accentColor }}
    >
      <div
        className="px-4 py-3 text-white flex items-center justify-between gap-2"
        style={{ backgroundColor: tile.accentColor }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
              {tile.districtTag}
            </div>
            <h3 className="font-display text-base font-extrabold truncate">{tile.name}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Durak bilgisini kapat"
          className="rounded-lg bg-white/20 hover:bg-white/30 p-1 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-2 text-xs font-semibold text-[#1f3b52] leading-relaxed">
        {tile.architectureNote && <p>{tile.architectureNote}</p>}
        {tile.historicalFact && (
          <p className="rounded-lg bg-[#eef6fb] border border-[#cde0ed] p-2.5 text-[#0f2942]">
            {tile.historicalFact}
          </p>
        )}
        {!tile.architectureNote && !tile.historicalFact && (
          <p>
            {tile.type === 'question'
              ? 'Bu kareye gelen takım ortadaki SORU KARTLARI destesinden bir Türkçe sorusu çeker.'
              : tile.type === 'reward'
                ? 'Hediye Ödül Karesi! Bu kareye gelen takım otomatik olarak +10 BP kazanır.'
                : 'Hapis Karesi: Gelen takım 50 BP kefalet ödeyerek sorusuna devam edebilir; ödemezse bu el soru çözmez ve 1 tur bekler.'}
          </p>
        )}
      </div>
    </aside>
  );
};

/* 2. Floating Special Event Toast (+50 BP Start Bonus, +10 BP Reward, Jail, Bank, Purchase) */
interface SpecialEventToastBannerProps {
  toast: SpecialEventToast;
  onDismiss: () => void;
}

export const SpecialEventToastBanner: React.FC<SpecialEventToastBannerProps> = ({
  toast,
  onDismiss,
}) => {
  const palette: Record<SpecialEventToast['kind'], string> = {
    start_bonus: 'border-[#e6a817] bg-[#fff9e6] text-[#7a4f04]',
    reward: 'border-[#198754] bg-[#e9f8ef] text-[#0f4d2f]',
    jail: 'border-[#475569] bg-[#eef2f6] text-[#1e293b]',
    bank: 'border-[#c88a1e] bg-[#fef6e2] text-[#784e07]',
    purchase: 'border-[#0c6b9a] bg-[#ebf6fc] text-[#0f2942]',
    info: 'border-[#94a3b8] bg-[#fcf9f2] text-[#0f2942]',
  };

  return (
    <div
      role="status"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92vw] rounded-2xl border-2 px-4 py-3 shadow-2xl flex items-start justify-between gap-3 ${palette[toast.kind]}`}
    >
      <div className="flex items-start gap-2.5">
        <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <div className="font-display text-sm md:text-base font-black">{toast.title}</div>
          <div className="text-xs font-bold opacity-90">{toast.subtitle}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Bildirimi kapat"
        className="rounded-lg p-1 hover:bg-black/10 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/* 3. Team Inventory Modal (Clearly separates Gayrimenkuller vs Araçlar & Active Debts) */
interface TeamInventoryModalProps {
  teams: Team[];
  peerLoans: PeerLoan[];
  onClose: () => void;
}

export const TeamInventoryModal: React.FC<TeamInventoryModalProps> = ({
  teams,
  peerLoans,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.62)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-title"
    >
      <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border-4 border-[#0c6b9a] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        <div className="bg-[#0c6b9a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-6 w-6" />
            <h2 id="inventory-title" className="font-display text-2xl font-extrabold">
              Takım Envanteri, Tapular ve Borçlar
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Envanteri kapat"
            className="rounded-xl bg-white/15 hover:bg-white/25 p-2 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map((team) => {
            const realEstate = team.ownedAssetIds
              .map((id) => PROPERTY_ASSETS.find((a) => a.id === id))
              .filter((a): a is NonNullable<typeof a> => Boolean(a));
            const activeDebts = peerLoans.filter((l) => !l.paid && l.borrowerTeamId === team.id);

            return (
              <div
                key={team.id}
                className="rounded-xl border-2 bg-white p-4 flex flex-col gap-3 shadow-xs"
                style={{ borderColor: team.colorHex }}
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ebe3d3]">
                  <span className="font-display text-base font-extrabold text-[#0f2942] truncate">
                    {team.name}
                  </span>
                  <span className="font-mono-num text-sm font-black text-[#0c6b9a]">
                    {team.bp} BP
                  </span>
                </div>

                {/* Gayrimenkuller (Counts toward Victory!) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#146c43] mb-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Gayrimenkuller ({realEstate.length})
                  </div>
                  {realEstate.length === 0 ? (
                    <p className="text-xs text-[#64748b] italic">Henüz gayrimenkul alınmadı.</p>
                  ) : (
                    <ul className="space-y-1">
                      {realEstate.map((a) => (
                        <li
                          key={a.id}
                          className="rounded-lg bg-[#e8f8ef] border border-[#b4e2c8] px-2.5 py-1 text-xs font-bold text-[#0f4c2f] flex justify-between"
                        >
                          <span>{a.name}</span>
                          <span className="font-mono-num">{a.price} BP</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Active Debts */}
                {(team.activeBankLoan || activeDebts.length > 0) && (
                  <div className="rounded-lg bg-[#fff4eb] border border-[#e7b48a] p-2.5 text-[11px] font-bold text-[#8a3b0c] space-y-1">
                    <div className="flex items-center gap-1 uppercase">
                      <Landmark className="h-3.5 w-3.5" />
                      Aktif Borçlar
                    </div>
                    {team.activeBankLoan && (
                      <div>Banka Kredisi: {team.activeBankLoan.repaymentDue} BP</div>
                    )}
                    {activeDebts.map((d) => (
                      <div key={d.id}>
                        {teams[d.lenderTeamId]?.name} borcu: {d.repaymentAmount} BP
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* 4. Pause Modal */
interface PauseModalProps {
  onResume: () => void;
  onReturnToSetup: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onReturnToSetup }) => {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.62)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm rounded-2xl border-4 border-[#0c6b9a] bg-[#fcf9f2] p-6 shadow-2xl text-center space-y-4">
        <h2 id="pause-title" className="font-display text-2xl font-black text-[#0f2942]">
          Oyun Duraklatıldı
        </h2>
        <p className="text-sm font-semibold text-[#486581]">
          Süre durduruldu. Hazır olduğunuzda İstanbul turuna kaldığınız yerden devam edebilirsiniz.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c6b9a] hover:bg-[#095378] px-5 py-3 text-sm font-extrabold text-white cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Oyuna Devam Et
          </button>
          <button
            type="button"
            onClick={onReturnToSetup}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#d4c3a3] bg-white hover:bg-[#f4f1ea] px-5 py-3 text-sm font-bold text-[#35556e] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Takım Kurulumuna Dön
          </button>
        </div>
      </div>
    </div>
  );
};

/* 5. Official Championship Victory Modal (Section 18 — Strict Real Estate Count Winner!) */
interface VictoryModalProps {
  teams: Team[];
  allQuestionsCompleted?: boolean;
  onRestart: () => void;
  onInspectBoard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  teams,
  allQuestionsCompleted = false,
  onRestart,
  onInspectBoard,
}) => {
  const ranked = getRankedTeams(teams);
  const champion = ranked[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.36)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-banner-title"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border-4 border-[#e6a817] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        {/* Grand Championship Header */}
        <div className="bg-gradient-to-r from-[#b72818] via-[#d95b0c] to-[#d49a1a] px-6 py-6 text-white text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-extrabold uppercase tracking-widest">
            <Crown className="h-4 w-4 text-[#fff3b0]" />
            {allQuestionsCompleted
              ? 'TÜM 20 SORU TAMAMLANDI · BİSEOPLY FİNAL SONUCU'
              : 'BİSEOPLY FİNAL SONUCU'}
          </div>
          <h2
            id="victory-banner-title"
            className="font-display text-2xl md:text-4xl font-black tracking-tight"
          >
            İSTANBUL&apos;UN EMLAK KRALI / EMLAK KRALİÇESİ BELLİ OLDU!
          </h2>
          <div className="pt-1 flex items-center justify-center gap-2.5 text-lg md:text-2xl font-extrabold text-[#fff6c2]">
            <Trophy className="h-7 w-7 text-[#ffe46b]" />
            <span>
              Şampiyon: {champion.name} ({champion.realEstateCount} Gayrimenkul)
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-1 text-xs font-bold text-white">
            <Plane className="h-4 w-4" />
            <span>Şampiyonluk uçağı İstanbul gökyüzünde &quot;{champion.name}&quot; flamasını dalgalandırıyor!</span>
          </div>
        </div>

        {/* All 3 Teams Ranked Strictly by Gayrimenkul Count -> Correct Answers -> BP */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ranked.map((team) => {
              const realEstateItems = team.ownedAssetIds
                .map((id) => PROPERTY_ASSETS.find((a) => a.id === id))
                .filter((a): a is NonNullable<typeof a> => a?.kind === 'emlak');
              const isFirst = team.rank === 1;

              return (
                <div
                  key={team.id}
                  className={`rounded-2xl border-2 p-4 flex flex-col justify-between gap-3 ${
                    isFirst
                      ? 'bg-[#fffcf0] border-[#e6a817] shadow-lg ring-2 ring-[#f4cf6a]'
                      : 'bg-white border-[#dcd2be]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl font-display font-black text-base ${
                          isFirst
                            ? 'bg-[#e6a817] text-white'
                            : 'bg-[#e7eef4] text-[#1d3549]'
                        }`}
                      >
                        #{team.rank}
                      </span>
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: team.colorHex }}
                      />
                    </div>

                    <h3 className="font-display text-xl font-black text-[#0f2942]">
                      {team.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono-num text-xs">
                      <div className="rounded-xl bg-[#e8f8ef] border border-[#a8dec0] p-2.5 text-center">
                        <div className="text-[10px] font-sans font-extrabold uppercase text-[#146c43]">
                          Gayrimenkul
                        </div>
                        <div className="text-2xl font-black text-[#0f4c2f]">
                          {team.realEstateCount}
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#eef6fb] border border-[#c1dff0] p-2.5 text-center">
                        <div className="text-[10px] font-sans font-extrabold uppercase text-[#0c6b9a]">
                          Kasa BP
                        </div>
                        <div className="text-2xl font-black text-[#0f2942]">{team.bp}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#486581] pt-1">
                      <span>Doğru / Yanlış:</span>
                      <span className="font-mono-num">
                        <strong className="text-[#146c43]">{team.correctAnswers}D</strong> ·{' '}
                        <strong className="text-[#b42318]">{team.wrongAnswers}Y</strong>
                      </span>
                    </div>

                    {realEstateItems.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {realEstateItems.map((m) => (
                          <span
                            key={m.id}
                            className="rounded-md bg-[#f4efe3] border border-[#dcd2be] px-2 py-0.5 text-[11px] font-bold text-[#1d3549]"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs font-bold text-[#526d85]">
            Sıralama Ölçütü: 1) En Çok Gayrimenkul · 2) Doğru Soru Sayısı · 3) Kasa BP Puanı
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onInspectBoard}
              className="rounded-xl border-2 border-[#c9bda8] bg-white hover:bg-[#f4f1ea] px-6 py-3 text-sm font-extrabold text-[#35556e] cursor-pointer"
            >
              3D İstanbul Tahtasını Gör
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e23b26] hover:bg-[#c32d1b] px-7 py-3 text-sm md:text-base font-extrabold text-white shadow-lg cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Yeni Oyun Başlat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 6. Prominent Dice Result Reveal Overlay (shown after 3D die lands, BEFORE FPS movement begins!) */
const DIE_PIPS: Record<number, [number, number][]> = {
  1: [[32, 32]],
  2: [
    [18, 18],
    [46, 46],
  ],
  3: [
    [18, 18],
    [32, 32],
    [46, 46],
  ],
  4: [
    [18, 18],
    [46, 18],
    [18, 46],
    [46, 46],
  ],
  5: [
    [18, 18],
    [46, 18],
    [32, 32],
    [18, 46],
    [46, 46],
  ],
  6: [
    [18, 16],
    [46, 16],
    [18, 32],
    [46, 32],
    [18, 48],
    [46, 48],
  ],
};

interface DiceResultBannerProps {
  diceValue: number;
  team: Team;
}

export const DiceResultBanner: React.FC<DiceResultBannerProps> = ({ diceValue, team }) => {
  const charName = CHARACTER_OPTIONS.find((c) => c.id === team.characterId)?.name ?? 'Etken';
  const pips = DIE_PIPS[diceValue] ?? DIE_PIPS[1];

  return (
    <div
      data-testid="dice-result-banner"
      role="status"
      aria-live="assertive"
      className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
    >
      <div
        className="flex items-center gap-4 rounded-2xl border-4 px-6 py-4 shadow-2xl"
        style={{
          backgroundColor: 'rgba(252, 249, 242, 0.98)',
          borderColor: team.colorHex,
        }}
      >
        <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 drop-shadow-md" aria-hidden="true">
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="12"
            fill="#ffffff"
            stroke="#0f2942"
            strokeWidth="3.5"
          />
          {pips.map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="5.5" fill={diceValue === 6 ? '#e23b26' : '#0f2942'} />
          ))}
        </svg>

        <div className="text-left">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#526d85]">
            ZAR SONUCU
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-4xl font-black leading-none"
              style={{ color: team.colorHex }}
            >
              {diceValue}
            </span>
            <span className="font-display text-lg font-extrabold text-[#0f2942]">
              ADIM GELDİ!
            </span>
          </div>
          <div className="mt-1 text-xs font-bold text-[#35556e]">
            <strong>{charName}</strong> ({team.name}) FPS kamerayla ilerliyor...
          </div>
        </div>
      </div>
    </div>
  );
};

/* 7. Sleek Minimal First-Person (FPS) Camera Indicator during Slow Character Walk */
interface FpsCameraHudBadgeProps {
  team: Team;
  currentStep: number;
  totalSteps: number;
}

export const FpsCameraHudBadge: React.FC<FpsCameraHudBadgeProps> = ({
  team,
  currentStep,
  totalSteps,
}) => {
  const charName = CHARACTER_OPTIONS.find((c) => c.id === team.characterId)?.name ?? 'Etken';
  const shownStep = Math.min(totalSteps, currentStep + 1);
  const progressPct = Math.min(100, Math.round((shownStep / Math.max(1, totalSteps)) * 100));

  return (
    <div
      data-testid="fps-camera-badge"
      role="status"
      className="fixed top-22 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
    >
      <div
        className="flex items-center gap-3 rounded-xl border-2 px-4 py-2 shadow-xl"
        style={{
          backgroundColor: 'rgba(15, 41, 66, 0.92)',
          borderColor: team.colorHex,
        }}
      >
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white shrink-0"
          style={{ backgroundColor: team.colorHex }}
        >
          <Eye className="h-4 w-4" />
        </span>
        <div className="min-w-[160px]">
          <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-white">
            <span>FPS KAMERA · {charName}</span>
            <span className="font-mono-num text-[#ffd678]">
              Adım {shownStep}/{totalSteps}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: team.colorHex }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* 8. Jail Bail vs 1-Turn Wait Decision Modal (50 BP Öde veya Ödeme -> 1 Tur Bekle & Soru Çözme) */
interface JailDecisionModalProps {
  team: Team;
  tileName: string;
  onPayBail: () => void;
  onWaitTurn: () => void;
}

export const JailDecisionModal: React.FC<JailDecisionModalProps> = ({
  team,
  tileName,
  onPayBail,
  onWaitTurn,
}) => {
  const canPay = team.bp >= JAIL_BAIL_BP;

  return (
    <div
      data-testid="jail-decision-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.62)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jail-decision-title"
    >
      <div className="w-full max-w-md rounded-2xl border-4 border-[#475569] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        <div className="bg-[#334155] px-6 py-4 text-white flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shrink-0">
            <ShieldAlert className="h-6 w-6 text-[#ffd166]" />
          </span>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#cbd5e1]">
              {tileName} · {team.name}
            </div>
            <h2 id="jail-decision-title" className="font-display text-2xl font-extrabold">
              Hapis Karesine Geldiniz!
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm md:text-base font-bold text-[#1e293b] leading-relaxed">
            Hapisten hemen çıkıp bu eldeki Türkçe sorusunu çözmek için{' '}
            <span className="font-mono-num font-black text-[#b91c1c]">{JAIL_BAIL_BP} BP</span>{' '}
            ödeyebilirsiniz. Ödemezseniz bu el soru çözmeden <span className="font-black">1 tur beklersiniz</span>.
          </p>

          <div className="rounded-xl bg-[#f4efe4] border border-[#ded3be] px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-bold text-[#35556e]">{team.name} Kasası:</span>
            <span
              className={`font-mono-num text-base font-black ${
                canPay ? 'text-[#147a4b]' : 'text-[#c42d2d]'
              }`}
            >
              {team.bp} BP
            </span>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={onPayBail}
              disabled={!canPay}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm md:text-base font-extrabold shadow-md ${
                canPay
                  ? 'bg-[#c88a1e] hover:bg-[#a67114] text-white cursor-pointer'
                  : 'bg-[#d8d1c5] text-[#838f99] cursor-not-allowed'
              }`}
            >
              <Coins className="h-4 w-4" />
              {canPay
                ? `${JAIL_BAIL_BP} BP Öde ve Soruya Devam Et`
                : `Yetersiz Bakiye (${JAIL_BAIL_BP} BP Gerekli)`}
            </button>

            <button
              type="button"
              onClick={onWaitTurn}
              className="w-full rounded-xl border-2 border-[#64748b] bg-white hover:bg-[#f1f5f9] px-5 py-3 text-sm font-extrabold text-[#334155] cursor-pointer"
            >
              Ödeme (Soru Çözme · 1 Tur Bekle)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


