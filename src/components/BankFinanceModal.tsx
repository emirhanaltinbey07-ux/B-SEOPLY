import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Building2,
  Check,
  Coins,
  Handshake,
  Landmark,
  ScrollText,
  X,
} from 'lucide-react';
import {
  BANK_BUYBACK_RATIO,
  BANK_LOAN_PRINCIPAL,
  BANK_LOAN_REPAYMENT,
  MAX_PEER_LOAN_RATIO,
  PROPERTY_ASSETS,
} from '../game/data';
import { FinanceLogEntry, PeerLoan, Team } from '../game/types';

interface BankFinanceModalProps {
  teams: Team[];
  activeTeamIndex: number;
  peerLoans: PeerLoan[];
  financeLog: FinanceLogEntry[];
  onTakeBankLoan: (teamIdx: number) => void;
  onRepayBankLoan: (teamIdx: number) => void;
  onExecutePeerLoan: (
    lenderIdx: number,
    borrowerIdx: number,
    principal: number,
    repaymentAmount: number
  ) => void;
  onRepayPeerLoan: (loanId: string) => void;
  onSellToBank: (sellerIdx: number, assetId: string) => void;
  onTradeBetweenTeams: (
    sellerIdx: number,
    buyerIdx: number,
    assetId: string,
    price: number
  ) => void;
  onClose: () => void;
}

type FinanceTab = 'bank' | 'peer' | 'trade' | 'log';

export const BankFinanceModal: React.FC<BankFinanceModalProps> = ({
  teams,
  activeTeamIndex,
  peerLoans,
  financeLog,
  onTakeBankLoan,
  onRepayBankLoan,
  onExecutePeerLoan,
  onRepayPeerLoan,
  onSellToBank,
  onTradeBetweenTeams,
  onClose,
}) => {
  const [tab, setTab] = useState<FinanceTab>('bank');

  // Peer loan proposal state
  const [lenderIdx, setLenderIdx] = useState<number>((activeTeamIndex + 1) % teams.length);
  const [borrowerIdx, setBorrowerIdx] = useState<number>(activeTeamIndex);
  const [principalInput, setPrincipalInput] = useState<number>(30);
  const [repaymentInput, setRepaymentInput] = useState<number>(35);
  const [pendingPeerProposal, setPendingPeerProposal] = useState<{
    lenderIdx: number;
    borrowerIdx: number;
    principal: number;
    repayment: number;
  } | null>(null);
  const [peerError, setPeerError] = useState<string | null>(null);

  // Asset sale / inter-team trade state
  const [sellerIdx, setSellerIdx] = useState<number>(activeTeamIndex);
  const [buyerIdx, setBuyerIdx] = useState<number>((activeTeamIndex + 1) % teams.length);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [tradePrice, setTradePrice] = useState<number>(50);
  const [pendingTrade, setPendingTrade] = useState<{
    sellerIdx: number;
    buyerIdx: number;
    assetId: string;
    price: number;
  } | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const lenderTeam = teams[lenderIdx];
  const borrowerTeam = teams[borrowerIdx];
  const maxRepayment = Math.floor(principalInput * MAX_PEER_LOAN_RATIO);

  const sellerTeam = teams[sellerIdx];
  const sellerAssets = sellerTeam.ownedAssetIds
    .map((id) => PROPERTY_ASSETS.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const effectiveAssetId = sellerAssets.some((a) => a.id === selectedAssetId)
    ? selectedAssetId
    : sellerAssets[0]?.id ?? '';
  const selectedAsset = sellerAssets.find((a) => a.id === effectiveAssetId);

  const handleProposePeerLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setPeerError(null);
    if (lenderIdx === borrowerIdx) {
      setPeerError('Borç veren ve alan takım farklı olmalıdır.');
      return;
    }
    if (principalInput <= 0 || principalInput > lenderTeam.bp) {
      setPeerError(`${lenderTeam.name} kasasında yeterli BP yok (En fazla ${lenderTeam.bp} BP).`);
      return;
    }
    if (repaymentInput < principalInput || repaymentInput > maxRepayment) {
      setPeerError(
        `Geri ödeme tutarı en az ${principalInput} BP, en fazla ${maxRepayment} BP (%120) olabilir.`
      );
      return;
    }
    setPendingPeerProposal({
      lenderIdx,
      borrowerIdx,
      principal: principalInput,
      repayment: repaymentInput,
    });
  };

  const handleProposeTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError(null);
    if (!selectedAsset) {
      setTradeError('Satış için önce bir varlık seçiniz.');
      return;
    }
    if (sellerIdx === buyerIdx) {
      setTradeError('Satıcı ve alıcı takım farklı olmalıdır.');
      return;
    }
    const buyer = teams[buyerIdx];
    if (tradePrice <= 0 || buyer.bp < tradePrice) {
      setTradeError(`${buyer.name} bakiyesi (${buyer.bp} BP) teklif tutarı için yetersiz.`);
      return;
    }
    setPendingTrade({
      sellerIdx,
      buyerIdx,
      assetId: selectedAsset.id,
      price: tradePrice,
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-5"
      style={{ backgroundColor: 'rgba(12, 30, 48, 0.65)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-4 border-[#c88a1e] bg-[#fcf9f2] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#163854] px-6 py-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d49a1a] text-[#163854]">
              <Landmark className="h-6 w-6" />
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#ffe39c]">
                İSTANBUL FİNANS MERKEZİ · BANKA
              </div>
              <h2 id="bank-modal-title" className="font-display text-2xl font-extrabold">
                Banka Kredisi, Takım Borcu ve Mülk Satışı
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Banka penceresini kapat"
            className="rounded-xl bg-white/15 hover:bg-white/25 p-2 text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 px-5 pt-3 pb-2 bg-[#f2ece0] border-b border-[#dfd3be]">
          {(
            [
              { id: 'bank', label: 'Banka Kredisi (+50 BP)', icon: Landmark },
              { id: 'peer', label: 'Takımlar Arası Borç', icon: Handshake },
              { id: 'trade', label: 'Mülk Satışı & Devir', icon: ArrowLeftRight },
              { id: 'log', label: `İşlem Geçmişi (${financeLog.length})`, icon: ScrollText },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#163854] text-white shadow-sm'
                    : 'bg-white text-[#28445c] border border-[#d6cbb6] hover:border-[#163854]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BANKA KREDİSİ (+50 BP / -60 BP) */}
          {tab === 'bank' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#fef6e2] border border-[#e3c274] p-3.5 text-xs md:text-sm font-bold text-[#784e07]">
                Kural: Her takım oyun boyunca bankadan <span className="font-black">sadece 1 kere</span> kredi
                çekebilir. Kredi alındığında kasaya hemen{' '}
                <span className="font-black">+{BANK_LOAN_PRINCIPAL} BP</span> eklenir; geri ödeme tutarı{' '}
                <span className="font-black">{BANK_LOAN_REPAYMENT} BP</span>’dir.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {teams.map((team, idx) => {
                  const hasLoan = Boolean(team.activeBankLoan);
                  const alreadyUsedLifetimeLoan = team.hasUsedBankLoan && !hasLoan;
                  const canRepay = hasLoan && team.bp >= BANK_LOAN_REPAYMENT;

                  return (
                    <div
                      key={team.id}
                      className="rounded-xl border-2 bg-white p-4 shadow-sm flex flex-col justify-between gap-3"
                      style={{ borderColor: team.colorHex }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-base font-extrabold text-[#0f2942]">
                            {team.name}
                          </span>
                          <span className="font-mono-num text-sm font-black text-[#0c6b9a]">
                            {team.bp} BP
                          </span>
                        </div>

                        <div className="mt-2 text-xs font-bold">
                          {hasLoan ? (
                            <span className="inline-block rounded-lg bg-[#fdeeee] text-[#a82418] px-2.5 py-1">
                              Aktif Kredi Borcu: {team.activeBankLoan?.repaymentDue} BP
                            </span>
                          ) : alreadyUsedLifetimeLoan ? (
                            <span className="inline-block rounded-lg bg-[#eef2f6] text-[#475569] px-2.5 py-1">
                              Tek Seferlik Kredi Hakkı Kullanıldı (1/1)
                            </span>
                          ) : (
                            <span className="inline-block rounded-lg bg-[#e8f8ef] text-[#146c43] px-2.5 py-1">
                              1 Kerelik Kredi Hakkı Mevcut
                            </span>
                          )}
                        </div>
                      </div>

                      {!hasLoan ? (
                        <button
                          type="button"
                          onClick={() => onTakeBankLoan(idx)}
                          disabled={alreadyUsedLifetimeLoan}
                          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs md:text-sm font-extrabold ${
                            alreadyUsedLifetimeLoan
                              ? 'bg-[#e3ddd2] text-[#7c8994] cursor-not-allowed'
                              : 'bg-[#c88a1e] hover:bg-[#a67114] text-white cursor-pointer'
                          }`}
                        >
                          <Coins className="h-4 w-4" />
                          {alreadyUsedLifetimeLoan ? 'Kredi Hakkı Doldu' : '+50 BP Kredi Çek'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRepayBankLoan(idx)}
                          disabled={!canRepay}
                          className={`w-full rounded-xl px-3 py-2.5 text-xs md:text-sm font-extrabold cursor-pointer ${
                            canRepay
                              ? 'bg-[#198754] hover:bg-[#146c43] text-white'
                              : 'bg-[#e3ddd2] text-[#7c8994] cursor-not-allowed'
                          }`}
                        >
                          60 BP Krediyi Öde
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TAKIMLAR ARASI BORÇ (MAX %120) */}
          {tab === 'peer' && (
            <div className="space-y-4">
              <form
                onSubmit={handleProposePeerLoan}
                className="rounded-xl border-2 border-[#d4c3a3] bg-white p-4 space-y-3"
              >
                <h3 className="font-display text-base font-extrabold text-[#0f2942]">
                  Yeni Takımlar Arası Borç Teklifi (En Fazla %120 Geri Ödeme)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="peer-lender" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Borç Veren Takım
                    </label>
                    <select
                      id="peer-lender"
                      value={lenderIdx}
                      onChange={(e) => setLenderIdx(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-2.5 py-2 text-xs font-bold text-[#0f2942]"
                    >
                      {teams.map((t, i) => (
                        <option key={t.id} value={i}>
                          {t.name} ({t.bp} BP)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="peer-borrower" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Borç Alan Takım
                    </label>
                    <select
                      id="peer-borrower"
                      value={borrowerIdx}
                      onChange={(e) => setBorrowerIdx(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-2.5 py-2 text-xs font-bold text-[#0f2942]"
                    >
                      {teams.map((t, i) => (
                        <option key={t.id} value={i}>
                          {t.name} ({t.bp} BP)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="peer-principal" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Anapara (BP)
                    </label>
                    <input
                      id="peer-principal"
                      type="number"
                      min={5}
                      max={Math.max(5, lenderTeam.bp)}
                      step={5}
                      value={principalInput}
                      onChange={(e) => {
                        const val = Math.max(5, Number(e.target.value) || 0);
                        setPrincipalInput(val);
                        setRepaymentInput(Math.min(Math.floor(val * MAX_PEER_LOAN_RATIO), Math.max(val, repaymentInput)));
                      }}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-2.5 py-2 text-sm font-mono-num font-bold text-[#0f2942]"
                    />
                  </div>

                  <div>
                    <label htmlFor="peer-repay" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Geri Ödeme (Maks {maxRepayment} BP)
                    </label>
                    <input
                      id="peer-repay"
                      type="number"
                      min={principalInput}
                      max={maxRepayment}
                      step={1}
                      value={repaymentInput}
                      onChange={(e) => setRepaymentInput(Number(e.target.value) || principalInput)}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-2.5 py-2 text-sm font-mono-num font-bold text-[#0f2942]"
                    />
                  </div>
                </div>

                {peerError && (
                  <div className="rounded-lg bg-[#fdeeee] border border-[#e23b26] px-3 py-2 text-xs font-bold text-[#a82418]">
                    {peerError}
                  </div>
                )}

                {!pendingPeerProposal ? (
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0c6b9a] hover:bg-[#095378] px-5 py-2.5 text-xs md:text-sm font-extrabold text-white cursor-pointer"
                  >
                    Borç Teklifi Oluştur
                  </button>
                ) : (
                  <div className="rounded-xl bg-[#fef6e2] border-2 border-[#c88a1e] p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs md:text-sm font-extrabold text-[#6b4605]">
                      Karşılıklı Onay: {teams[pendingPeerProposal.lenderIdx].name} →{' '}
                      {teams[pendingPeerProposal.borrowerIdx].name} ({pendingPeerProposal.principal} BP borç,{' '}
                      {pendingPeerProposal.repayment} BP geri ödeme)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingPeerProposal(null)}
                        className="rounded-lg bg-white border border-[#c9bda8] px-3 py-1.5 text-xs font-bold text-[#475569] cursor-pointer"
                      >
                        Reddet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onExecutePeerLoan(
                            pendingPeerProposal.lenderIdx,
                            pendingPeerProposal.borrowerIdx,
                            pendingPeerProposal.principal,
                            pendingPeerProposal.repayment
                          );
                          setPendingPeerProposal(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#198754] hover:bg-[#146c43] px-4 py-1.5 text-xs font-extrabold text-white cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Kabul Et ve Aktar
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Active Peer Loans Tracker */}
              <div className="rounded-xl border border-[#dfd3be] bg-white p-4 space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4b677f]">
                  Takımlar Arası Borç Defteri
                </h3>
                {peerLoans.length === 0 ? (
                  <p className="text-xs font-semibold text-[#64748b]">
                    Henüz takımlar arası borç kaydı bulunmuyor.
                  </p>
                ) : (
                  peerLoans.map((loan) => {
                    const lTeam = teams[loan.lenderTeamId];
                    const bTeam = teams[loan.borrowerTeamId];
                    const canPay = !loan.paid && bTeam.bp >= loan.repaymentAmount;
                    return (
                      <div
                        key={loan.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e5dfd2] bg-[#faf7f0] px-3.5 py-2.5 text-xs font-bold"
                      >
                        <div>
                          <span className="text-[#0f2942]">
                            {bTeam.name} → {lTeam.name}
                          </span>
                          <span className="ml-2 font-mono-num text-[#0c6b9a]">
                            Anapara: {loan.principal} BP · Ödenecek: {loan.repaymentAmount} BP
                          </span>
                        </div>
                        {loan.paid ? (
                          <span className="rounded bg-[#e8f8ef] px-2.5 py-1 text-[#146c43]">
                            Ödendi
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!canPay}
                            onClick={() => onRepayPeerLoan(loan.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
                              canPay
                                ? 'bg-[#198754] hover:bg-[#146c43] text-white'
                                : 'bg-[#dcd5c9] text-[#7c8994] cursor-not-allowed'
                            }`}
                          >
                            {loan.repaymentAmount} BP Borcu Öde
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GAYRİMENKUL / ARAÇ SATIŞI (BANKAYA %70 VEYA TAKIMA SATIŞ) */}
          {tab === 'trade' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-[#d4c3a3] bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="trade-seller" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Satıcı Takım
                    </label>
                    <select
                      id="trade-seller"
                      value={sellerIdx}
                      onChange={(e) => setSellerIdx(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-3 py-2 text-xs md:text-sm font-bold text-[#0f2942]"
                    >
                      {teams.map((t, i) => (
                        <option key={t.id} value={i}>
                          {t.name} ({t.ownedAssetIds.length} Varlık · {t.bp} BP)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="trade-asset" className="block text-xs font-bold text-[#4b677f] mb-1">
                      Satılacak Gayrimenkul
                    </label>
                    <select
                      id="trade-asset"
                      value={effectiveAssetId}
                      onChange={(e) => {
                        setSelectedAssetId(e.target.value);
                        const found = PROPERTY_ASSETS.find((a) => a.id === e.target.value);
                        if (found) setTradePrice(found.price);
                      }}
                      disabled={sellerAssets.length === 0}
                      className="w-full rounded-lg border border-[#c7d5e0] bg-[#fbfaf7] px-3 py-2 text-xs md:text-sm font-bold text-[#0f2942]"
                    >
                      {sellerAssets.length === 0 ? (
                        <option value="">Bu takımın henüz satılık gayrimenkulü yok</option>
                      ) : (
                        sellerAssets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Gayrimenkul · {a.price} BP)
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {selectedAsset && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Option A: Instant 70% Sale to Bank */}
                    <div className="rounded-xl border border-[#e3c274] bg-[#fef9ec] p-3.5 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#855809]">
                          <Landmark className="h-4 w-4" />
                          Bankaya Geri Satış (%70)
                        </div>
                        <p className="mt-1 text-xs font-semibold text-[#5c4820]">
                          {selectedAsset.name} varlığını anında Bankaya satarak{' '}
                          <span className="font-mono-num font-black text-[#146c43]">
                            +{Math.round(selectedAsset.price * BANK_BUYBACK_RATIO)} BP
                          </span>{' '}
                          nakit alın.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSellToBank(sellerIdx, selectedAsset.id)}
                        className="w-full rounded-xl bg-[#c88a1e] hover:bg-[#a67114] px-4 py-2.5 text-xs md:text-sm font-extrabold text-white cursor-pointer"
                      >
                        Bankaya Sat (+{Math.round(selectedAsset.price * BANK_BUYBACK_RATIO)} BP)
                      </button>
                    </div>

                    {/* Option B: Inter-team Agreed Sale */}
                    <form
                      onSubmit={handleProposeTrade}
                      className="rounded-xl border border-[#bedbef] bg-[#f2f8fc] p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#0c6b9a]">
                        <Building2 className="h-4 w-4" />
                        Başka Takıma Satış / Devir
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          aria-label="Alıcı Takım"
                          value={buyerIdx}
                          onChange={(e) => setBuyerIdx(Number(e.target.value))}
                          className="rounded-lg border border-[#c7d5e0] bg-white px-2 py-1.5 text-xs font-bold text-[#0f2942]"
                        >
                          {teams.map((t, i) => (
                            <option key={t.id} value={i}>
                              {t.name} ({t.bp} BP)
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label="Anlaşılan Satış Fiyatı BP"
                          type="number"
                          min={5}
                          step={5}
                          value={tradePrice}
                          onChange={(e) => setTradePrice(Math.max(5, Number(e.target.value) || 0))}
                          className="rounded-lg border border-[#c7d5e0] bg-white px-2 py-1.5 text-xs font-mono-num font-bold text-[#0f2942]"
                        />
                      </div>

                      {!pendingTrade ? (
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-[#0c6b9a] hover:bg-[#095378] px-4 py-2.5 text-xs md:text-sm font-extrabold text-white cursor-pointer"
                        >
                          Satış Teklifi Oluştur
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-2 border border-[#0c6b9a]">
                          <span className="text-[11px] font-bold text-[#0f2942]">
                            {teams[pendingTrade.buyerIdx].name} {pendingTrade.price} BP onaylıyor mu?
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPendingTrade(null)}
                              className="rounded bg-[#ece6da] px-2 py-1 text-[11px] font-bold text-[#475569] cursor-pointer"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTradeBetweenTeams(
                                  pendingTrade.sellerIdx,
                                  pendingTrade.buyerIdx,
                                  pendingTrade.assetId,
                                  pendingTrade.price
                                );
                                setPendingTrade(null);
                              }}
                              className="rounded bg-[#198754] px-2.5 py-1 text-[11px] font-extrabold text-white cursor-pointer"
                            >
                              Devret
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {tradeError && (
                  <div className="rounded-lg bg-[#fdeeee] border border-[#e23b26] px-3 py-2 text-xs font-bold text-[#a82418]">
                    {tradeError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FİNANS İŞLEM GEÇMİŞİ */}
          {tab === 'log' && (
            <div className="rounded-xl border border-[#dfd3be] bg-white p-4 space-y-2">
              {financeLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg bg-[#faf7f0] border border-[#ebe3d3] px-3 py-2 text-xs font-semibold text-[#1d3549]"
                >
                  <span className="font-mono-num font-extrabold text-[#0c6b9a] shrink-0">
                    Tur {entry.turn}
                  </span>
                  <span>{entry.summary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
