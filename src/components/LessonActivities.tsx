import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  MousePointerClick,
  PencilLine,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import {
  BenzetmeElementsTableActivity,
  SentenceCheckActivity,
} from '../game/lessonData';

interface SentenceCheckboxActivityProps {
  activity: SentenceCheckActivity;
  accentHex: string;
  accentSoftBg: string;
  accentBorder: string;
}

export const SentenceCheckboxActivity: React.FC<SentenceCheckboxActivityProps> = ({
  activity,
  accentHex,
  accentSoftBg,
  accentBorder,
}) => {
  const [revealed, setRevealed] = useState<number[]>([]);

  const toggleReveal = (num: number) => {
    setRevealed((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleShowAll = () => {
    setRevealed(activity.items.map((item) => item.number));
  };

  const handleReset = () => {
    setRevealed([]);
  };

  const totalCorrectTargets = activity.items.filter((i) => i.isCorrect).length;
  const revealedCorrectTargets = activity.items.filter(
    (i) => i.isCorrect && revealed.includes(i.number)
  ).length;
  const allRevealed = revealed.length === activity.items.length;

  return (
    <section
      data-testid={`activity-${activity.code.toLowerCase()}`}
      className="rounded-2xl border-2 bg-white shadow-xs overflow-hidden"
      style={{ borderColor: accentBorder }}
    >
      {/* Activity Header */}
      <div
        className="px-5 py-4 border-b flex flex-wrap items-start justify-between gap-3"
        style={{ backgroundColor: accentSoftBg, borderColor: accentBorder }}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em]">
            <ClipboardCheck className="h-4 w-4 shrink-0" style={{ color: accentHex }} />
            <span style={{ color: accentHex }}>ETKİNLİK {activity.code} · {activity.title}</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-[#142236] leading-snug">
            {activity.instruction}
          </h3>
          <p className="text-xs font-semibold text-[#526580]">
            Bir cümleye tıkladığında doğru cevabı anında görürsün.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShowAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfd8e6] bg-white hover:bg-[#f5f7fb] px-3 py-1.5 text-xs font-extrabold text-[#364b68] cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Tüm Cevapları Göster</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfd8e6] bg-white hover:bg-[#f5f7fb] px-3 py-1.5 text-xs font-extrabold text-[#364b68] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* Instant-Reveal Sentence Cards */}
      <div className="p-5 space-y-2.5">
        {activity.items.map((item) => {
          const isRevealed = revealed.includes(item.number);
          const isPositive = isRevealed && item.isCorrect;
          const isNegative = isRevealed && !item.isCorrect;

          return (
            <button
              key={item.number}
              type="button"
              onClick={() => toggleReveal(item.number)}
              aria-pressed={isRevealed}
              className={`w-full text-left block rounded-xl border-2 px-4 py-3 transition-all cursor-pointer select-none ${
                isPositive
                  ? 'border-[#16a34a] bg-[#f0fdf4]'
                  : isNegative
                    ? 'border-[#e11d48] bg-[#fff1f2]'
                    : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafbfe]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Check / Cross / Empty Box */}
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isPositive
                      ? 'border-[#16a34a] bg-[#16a34a] text-white'
                      : isNegative
                        ? 'border-[#e11d48] bg-[#e11d48] text-white'
                        : 'border-[#cbd5e1] bg-white text-transparent'
                  }`}
                >
                  {isPositive ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isNegative ? (
                    <X className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-[#142236] leading-snug">
                      <span
                        className="font-mono-num mr-1.5 font-black"
                        style={{ color: accentHex }}
                      >
                        {item.number}.
                      </span>
                      {item.sentence}
                    </span>

                    {isRevealed ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-extrabold shrink-0 ${
                          item.isCorrect
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : 'bg-[#ffe4e6] text-[#be123c]'
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {activity.positiveLabel}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            {activity.negativeLabel}
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#f3f6fb] px-2.5 py-0.5 text-[11px] font-bold text-[#64748b] shrink-0">
                        <MousePointerClick className="h-3 w-3" />
                        Cevabı gör
                      </span>
                    )}
                  </div>

                  {isRevealed && (
                    <p
                      className={`mt-1.5 text-xs sm:text-sm font-semibold ${
                        item.isCorrect ? 'text-[#166534]' : 'text-[#9f1239]'
                      }`}
                    >
                      {item.explanation}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Footer Live Counter */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8edf5]">
          <div
            role="status"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs sm:text-sm font-extrabold ${
              allRevealed
                ? 'border-[#86efac] bg-[#f0fdf4] text-[#15803d]'
                : 'border-[#dce5f0] bg-[#f8fafd] text-[#364b68]'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Açılan Cümle: {revealed.length} / {activity.items.length} · Bulunan Doğru Örnek:{' '}
              {revealedCorrectTargets} / {totalCorrectTargets}
            </span>
          </div>

          {!allRevealed && (
            <button
              type="button"
              onClick={handleShowAll}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentHex }}
            >
              <Eye className="h-4 w-4" />
              <span>Tüm Cevapları Göster</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

interface BenzetmeElementsTableActivityProps {
  activity: BenzetmeElementsTableActivity;
  accentHex: string;
  accentSoftBg: string;
  accentBorder: string;
}

type CellKey = `${number}-benzeyen` | `${number}-benzetilen`;

export const BenzetmeElementsTableActivityCard: React.FC<BenzetmeElementsTableActivityProps> = ({
  activity,
  accentHex,
  accentSoftBg,
  accentBorder,
}) => {
  const [revealedCells, setRevealedCells] = useState<Record<CellKey, boolean>>({});

  const toggleCell = (rowNum: number, field: 'benzeyen' | 'benzetilen') => {
    const key: CellKey = `${rowNum}-${field}`;
    setRevealedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleRow = (rowNum: number) => {
    const bKey: CellKey = `${rowNum}-benzeyen`;
    const tKey: CellKey = `${rowNum}-benzetilen`;
    setRevealedCells((prev) => {
      const bothOpen = Boolean(prev[bKey] && prev[tKey]);
      return {
        ...prev,
        [bKey]: !bothOpen,
        [tKey]: !bothOpen,
      };
    });
  };

  const handleShowAll = () => {
    const all: Record<CellKey, boolean> = {};
    for (const row of activity.rows) {
      all[`${row.number}-benzeyen`] = true;
      all[`${row.number}-benzetilen`] = true;
    }
    setRevealedCells(all);
  };

  const handleReset = () => {
    setRevealedCells({});
  };

  const totalCells = activity.rows.length * 2;
  const revealedCount = activity.rows.reduce(
    (sum, row) =>
      sum +
      (revealedCells[`${row.number}-benzeyen`] ? 1 : 0) +
      (revealedCells[`${row.number}-benzetilen`] ? 1 : 0),
    0
  );
  const allRevealed = revealedCount === totalCells;

  return (
    <section
      data-testid="activity-d"
      className="rounded-2xl border-2 bg-white shadow-xs overflow-hidden"
      style={{ borderColor: accentBorder }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex flex-wrap items-start justify-between gap-3"
        style={{ backgroundColor: accentSoftBg, borderColor: accentBorder }}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em]">
            <PencilLine className="h-4 w-4 shrink-0" style={{ color: accentHex }} />
            <span style={{ color: accentHex }}>ETKİNLİK {activity.code} · {activity.title}</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-[#142236] leading-snug">
            {activity.instruction}
          </h3>
          <p className="text-xs font-semibold text-[#526580]">
            Kutuların veya cümlenin üstüne bas, doğru cevap anında yazılsın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShowAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfd8e6] bg-white hover:bg-[#f5f7fb] px-3 py-1.5 text-xs font-extrabold text-[#364b68] cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Tüm Cevapları Göster</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfd8e6] bg-white hover:bg-[#f5f7fb] px-3 py-1.5 text-xs font-extrabold text-[#364b68] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* Tap-to-Write Table */}
      <div className="p-5 space-y-4">
        <div className="overflow-x-auto rounded-xl border border-[#dce6f0]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f3f8fc] border-b border-[#dce6f0]">
                <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[#142236] w-[46%]">
                  Cümleler
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[#6d44a6] w-[27%]">
                  Benzeyen
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[#d81b75] w-[27%]">
                  Benzetilen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6edf5]">
              {activity.rows.map((row) => {
                const showBenzeyen = Boolean(revealedCells[`${row.number}-benzeyen`]);
                const showBenzetilen = Boolean(revealedCells[`${row.number}-benzetilen`]);
                const rowAnyRevealed = showBenzeyen || showBenzetilen;

                return (
                  <tr key={row.number} className="bg-white hover:bg-[#fbfdff] align-top">
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.number)}
                        className="w-full text-left cursor-pointer group"
                        aria-label={`${row.number}. cümle cevabını göster`}
                      >
                        <div className="text-sm sm:text-base font-extrabold text-[#142236] group-hover:text-[#0d86a8] transition-colors leading-snug">
                          <span
                            className="font-mono-num mr-1.5 font-black"
                            style={{ color: accentHex }}
                          >
                            {row.number}.
                          </span>
                          {row.sentence}
                        </div>
                        {rowAnyRevealed && (
                          <p className="mt-1 text-xs font-semibold text-[#475d78]">
                            {row.explanation}
                          </p>
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleCell(row.number, 'benzeyen')}
                        aria-label={`${row.number}. cümle Benzeyen cevabını göster`}
                        aria-pressed={showBenzeyen}
                        className={`w-full min-w-[140px] rounded-xl border-2 px-3 py-2.5 text-left text-sm font-extrabold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          showBenzeyen
                            ? 'border-[#16a34a] bg-[#f0fdf4] text-[#14532d]'
                            : 'border-dashed border-[#c9b3e8] bg-[#faf7ff] text-[#6d44a6] hover:bg-[#f2ebff]'
                        }`}
                      >
                        {showBenzeyen ? (
                          <>
                            <span>{row.benzeyen}</span>
                            <CheckCircle2 className="h-4 w-4 text-[#16a34a] shrink-0" />
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold opacity-85">Bas · Cevabı Yaz</span>
                            <MousePointerClick className="h-3.5 w-3.5 shrink-0 opacity-75" />
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleCell(row.number, 'benzetilen')}
                        aria-label={`${row.number}. cümle Benzetilen cevabını göster`}
                        aria-pressed={showBenzetilen}
                        className={`w-full min-w-[140px] rounded-xl border-2 px-3 py-2.5 text-left text-sm font-extrabold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          showBenzetilen
                            ? 'border-[#16a34a] bg-[#f0fdf4] text-[#14532d]'
                            : 'border-dashed border-[#f2b5d2] bg-[#fff7fb] text-[#c21869] hover:bg-[#ffeaf4]'
                        }`}
                      >
                        {showBenzetilen ? (
                          <>
                            <span>{row.benzetilen}</span>
                            <CheckCircle2 className="h-4 w-4 text-[#16a34a] shrink-0" />
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold opacity-85">Bas · Cevabı Yaz</span>
                            <MousePointerClick className="h-3.5 w-3.5 shrink-0 opacity-75" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Live Counter */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8edf5]">
          <div
            role="status"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs sm:text-sm font-extrabold ${
              allRevealed
                ? 'border-[#86efac] bg-[#f0fdf4] text-[#15803d]'
                : 'border-[#dce5f0] bg-[#f8fafd] text-[#364b68]'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Açılan Cevap: {revealedCount} / {totalCells}
              {allRevealed ? ' · Tüm tablo tamamlandı!' : ''}
            </span>
          </div>

          {!allRevealed && (
            <button
              type="button"
              onClick={handleShowAll}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentHex }}
            >
              <Eye className="h-4 w-4" />
              <span>Tüm Cevapları Göster</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
