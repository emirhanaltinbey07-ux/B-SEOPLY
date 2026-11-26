import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  Gamepad2,
  Info,
  Lightbulb,
} from 'lucide-react';
import {
  BENZETME_ACTIVITY_A,
  BENZETME_ELEMENT_LABELS,
  BENZETME_ELEMENTS_ACTIVITY_D,
  BENZETME_FOUR_ELEMENTS_SLIDE,
  BENZETME_SLIDE,
  BenzetmeElementKey,
  getNextLessonTopic,
  getPrevLessonTopic,
  KISILESTIRME_ACTIVITY_B,
  KISILESTIRME_SLIDE,
  LESSON_TOPICS,
  LessonTopicId,
} from '../game/lessonData';
import {
  BenzetmeElementsTableActivityCard,
  SentenceCheckboxActivity,
} from './LessonActivities';

interface LessonSectionProps {
  onStartGameSection: () => void;
}

const ELEMENT_ORDER: BenzetmeElementKey[] = [
  'benzeyen',
  'kendisine_benzetilen',
  'benzetme_yonu',
  'benzetme_edati',
];

export const LessonSection: React.FC<LessonSectionProps> = ({ onStartGameSection }) => {
  const [activeTopic, setActiveTopic] = useState<LessonTopicId>('benzetme');
  const [expandedBenzetme, setExpandedBenzetme] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
  });
  const [expandedKisilestirme, setExpandedKisilestirme] = useState<Record<string, boolean>>({});
  const [activeElementFilter, setActiveElementFilter] = useState<BenzetmeElementKey | 'all'>('all');

  const topicMeta = useMemo(
    () => LESSON_TOPICS.find((t) => t.id === activeTopic) ?? LESSON_TOPICS[0],
    [activeTopic]
  );

  const prevTopic = getPrevLessonTopic(activeTopic);
  const nextTopic = getNextLessonTopic(activeTopic);

  const toggleBenzetmeCard = (num: string) => {
    setExpandedBenzetme((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const toggleKisilestirmeCard = (num: string) => {
    setExpandedKisilestirme((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const allBenzetmeOpen = BENZETME_SLIDE.examples.every((ex) => expandedBenzetme[ex.number]);
  const allKisilestirmeOpen = KISILESTIRME_SLIDE.examples.every(
    (ex) => expandedKisilestirme[ex.number]
  );

  const handleToggleAllBenzetme = () => {
    const nextVal = !allBenzetmeOpen;
    const nextState: Record<string, boolean> = {};
    BENZETME_SLIDE.examples.forEach((ex) => {
      nextState[ex.number] = nextVal;
    });
    setExpandedBenzetme(nextState);
  };

  const handleToggleAllKisilestirme = () => {
    const nextVal = !allKisilestirmeOpen;
    const nextState: Record<string, boolean> = {};
    KISILESTIRME_SLIDE.examples.forEach((ex) => {
      nextState[ex.number] = nextVal;
    });
    setExpandedKisilestirme(nextState);
  };

  const handleSelectTopic = (id: LessonTopicId) => {
    setActiveTopic(id);
  };

  return (
    <div
      data-testid="lesson-section"
      className="fixed inset-0 z-30 flex flex-col bg-[#f7f8fc] text-[#142236] screen-fade-in"
    >
      {/* Clean 3-Zone Top Bar */}
      <header className="shrink-0 border-b border-[#dde3ee] bg-white/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Left: SÖZOPLY Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6d44a6] text-white font-display text-lg font-black shadow-xs">
              S
            </span>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-black tracking-tight text-[#142236]">
                  SÖZOPLY
                </span>
                <span className="hidden sm:inline text-xs font-bold text-[#6d44a6]">
                  · 1. Kısım: Konu Anlatımı
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#526580] truncate">
                5. Sınıf Türkçe · Söz Sanatları
              </div>
            </div>
          </div>

          {/* Center: Topic Tabs (Desktop) */}
          <nav
            aria-label="Konu başlıkları"
            className="hidden lg:flex items-center gap-1 rounded-xl bg-[#f1f3f9] p-1 border border-[#e2e7f2]"
          >
            {LESSON_TOPICS.map((topic) => {
              const isActive = topic.id === activeTopic;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#142236] shadow-xs ring-1 ring-[#d6ddeb]'
                      : 'text-[#526580] hover:text-[#142236]'
                  }`}
                  style={isActive ? { color: topic.accentHex } : undefined}
                >
                  {topic.shortLabel}
                </button>
              );
            })}
          </nav>

          {/* Right: Single Primary Action -> Jump to Part 2 (SÖZOPLY 3D Game) */}
          <button
            type="button"
            onClick={onStartGameSection}
            className="inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl bg-[#d81b75] hover:bg-[#b81462] px-3 sm:px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Gamepad2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">2. Kısım: SÖZOPLY Oyunu</span>
            <span className="sm:hidden">SÖZOPLY Oyunu</span>
          </button>
        </div>

        {/* Mobile/Tablet Topic Tabs */}
        <nav
          aria-label="Mobil konu başlıkları"
          className="flex lg:hidden items-center gap-1.5 overflow-x-auto border-t border-[#eef1f7] px-4 py-2"
        >
          {LESSON_TOPICS.map((topic) => {
            const isActive = topic.id === activeTopic;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer border ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'bg-[#f5f7fb] text-[#475973] border-[#e2e7f2]'
                }`}
                style={
                  isActive
                    ? { backgroundColor: topic.accentHex, borderColor: topic.accentHex }
                    : undefined
                }
              >
                {topic.shortLabel}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Scrollable Illustrated Educational Workspace */}
      <div className="flex-1 overflow-y-auto overscroll-contain mobile-scroll">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-6">
          {/* Topic Hero Banner */}
          <section
            key={activeTopic}
            className="rounded-2xl border bg-white p-5 sm:p-6 shadow-xs screen-fade-in space-y-3"
            style={{ borderColor: topicMeta.accentBorder }}
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
              <BookOpen className="h-4 w-4 shrink-0" style={{ color: topicMeta.accentHex }} />
              <span style={{ color: topicMeta.accentHex }}>
                5. SINIF TÜRKÇE · SÖZ SANATLARI · BÖLÜM {topicMeta.stepNumber} / {LESSON_TOPICS.length}
              </span>
            </div>

            <h1
              className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: topicMeta.accentHex }}
            >
              {topicMeta.title}
            </h1>

            {activeTopic === 'benzetme' && (
              <>
                <p className="text-sm sm:text-base md:text-lg font-bold leading-relaxed text-[#1d2f47]">
                  {BENZETME_SLIDE.definition}
                </p>
                <div className="rounded-xl bg-[#f5f0fb] border border-[#dfd2f3] px-4 py-2.5 flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#4a2b78]">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-[#6d44a6]" />
                  <span>{BENZETME_SLIDE.kidSummary}</span>
                </div>
              </>
            )}

            {activeTopic === 'kisilestirme' && (
              <>
                <p className="text-sm sm:text-base md:text-lg font-bold leading-relaxed text-[#1d2f47]">
                  {KISILESTIRME_SLIDE.definition}
                </p>
                <div className="rounded-xl bg-[#fdf0f6] border border-[#f2c4da] px-4 py-2.5 flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#8a144c]">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-[#d81b75]" />
                  <span>{KISILESTIRME_SLIDE.kidSummary}</span>
                </div>
              </>
            )}

            {activeTopic === 'benzetme_ogeleri' && (
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-[#354c66]">
                Aşağıdaki renkli ögelere dokunarak resimlerle birlikte{' '}
                <strong className="text-[#6d44a6]">benzeyen</strong>,{' '}
                <strong className="text-[#d81b75]">kendisine benzetilen</strong>,{' '}
                <strong className="text-[#0d94b2]">benzetme yönü</strong> ve{' '}
                <strong className="text-[#c96210]">benzetme edatı</strong> bölümlerini kolayca öğrenebilirsin.
              </p>
            )}
          </section>

          {/* TOPIC 1: BENZETME (7 Illustrated Example Cards) */}
          {activeTopic === 'benzetme' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142236]">
                  Resimli Örnekler ({BENZETME_SLIDE.examples.length})
                </h2>
                <button
                  type="button"
                  onClick={handleToggleAllBenzetme}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d6ddeb] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#364b68] hover:border-[#6d44a6] hover:text-[#6d44a6] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{allBenzetmeOpen ? 'Tüm Ögeleri Gizle' : 'Tüm Ögeleri Göster'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BENZETME_SLIDE.examples.map((item) => {
                  const isOpen = !!expandedBenzetme[item.number];
                  return (
                    <article
                      key={item.number}
                      className="rounded-2xl border bg-white shadow-xs overflow-hidden flex flex-col transition-all"
                      style={{ borderColor: isOpen ? '#b79be2' : '#dfe5f0' }}
                    >
                      {/* Illustrated Picture Banner */}
                      <div className="relative aspect-[16/10] w-full bg-[#f3eef9] overflow-hidden border-b border-[#ebe5f5]">
                        <img
                          src={item.imagePath}
                          alt={item.imageAlt}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-3 left-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#6d44a6] font-mono-num text-xs font-black text-white shadow-md">
                          {item.number}
                        </span>
                      </div>

                      {/* Sentence & Kid-Friendly Explanation */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-[#142236] leading-snug">
                            {item.sentence}
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-[#475d78] leading-relaxed">
                            {item.kidExplanation}
                          </p>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleBenzetmeCard(item.number)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between rounded-xl border border-[#e3d9f3] bg-[#faf7fe] hover:bg-[#f2eafc] px-3.5 py-2 text-xs font-extrabold text-[#5a3590] transition-colors cursor-pointer"
                          >
                            <span>{isOpen ? 'Benzetme Ögelerini Gizle' : 'Benzetme Ögelerini Gör'}</span>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="mt-2.5 grid grid-cols-2 gap-2">
                              <div className="rounded-lg border border-[#dfd3f3] bg-[#faf8fd] px-2.5 py-2">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d44a6]">
                                  Benzeyen
                                </div>
                                <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                  {item.benzeyen}
                                </div>
                              </div>
                              <div className="rounded-lg border border-[#f2c8de] bg-[#fef7fa] px-2.5 py-2">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#d81b75]">
                                  Benzetilen
                                </div>
                                <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                  {item.kendisineBenzetilen}
                                </div>
                              </div>
                              <div className="rounded-lg border border-[#bce4ee] bg-[#f4fbfd] px-2.5 py-2">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d94b2]">
                                  Benzetme Yönü
                                </div>
                                <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                  {item.benzetmeYonu}
                                </div>
                              </div>
                              <div className="rounded-lg border border-[#f5d2ae] bg-[#fffaf4] px-2.5 py-2">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#c96210]">
                                  Benzetme Edatı
                                </div>
                                <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                  {item.benzetmeEdati}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Etkinlik A: Benzetme Kullanılan Cümleleri İşaretleme */}
              <div className="pt-2">
                <SentenceCheckboxActivity
                  activity={BENZETME_ACTIVITY_A}
                  accentHex="#6d44a6"
                  accentSoftBg="#f5f0fb"
                  accentBorder="#d8c7ef"
                />
              </div>
            </section>
          )}

          {/* TOPIC 2: BENZETMENİN DÖRT ÖGESİ (2 Illustrated Analyzed Cards + Element Guide) */}
          {activeTopic === 'benzetme_ogeleri' && (
            <section className="space-y-5">
              {/* Four Elements Quick Kid Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ELEMENT_ORDER.map((key) => {
                  const meta = BENZETME_ELEMENT_LABELS[key];
                  const isSelected = activeElementFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setActiveElementFilter(activeElementFilter === key ? 'all' : key)
                      }
                      aria-pressed={isSelected}
                      className="rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer shadow-xs"
                      style={
                        isSelected
                          ? {
                              backgroundColor: meta.colorHex,
                              borderColor: meta.colorHex,
                              color: '#ffffff',
                            }
                          : {
                              backgroundColor: meta.bgHex,
                              borderColor: meta.borderHex,
                              color: '#142236',
                            }
                      }
                    >
                      <div
                        className="text-xs font-black uppercase tracking-wider"
                        style={{ color: isSelected ? '#ffffff' : meta.colorHex }}
                      >
                        {meta.label}
                      </div>
                      <div
                        className="mt-1 text-xs font-extrabold"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.95)' : '#142236' }}
                      >
                        {meta.questionHint}
                      </div>
                      <div
                        className="mt-0.5 text-[11px] font-semibold"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : '#4c627c' }}
                      >
                        {meta.hint}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Filter Reset Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142236]">
                  Örnek Cümleleri İncele
                </h2>
                {activeElementFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveElementFilter('all')}
                    className="rounded-lg bg-[#142236] hover:bg-[#233856] px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer"
                  >
                    Tüm Ögeleri Göster
                  </button>
                )}
              </div>

              {/* Two Illustrated Analyzed Examples */}
              <div className="space-y-4">
                {BENZETME_FOUR_ELEMENTS_SLIDE.examples.map((ex) => (
                  <article
                    key={ex.number}
                    className="rounded-2xl border border-[#d6e5ee] bg-white shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12"
                  >
                    {/* Illustration Left */}
                    <div className="md:col-span-5 relative aspect-[16/11] md:aspect-auto bg-[#eef8fb] border-b md:border-b-0 md:border-r border-[#dceaf0]">
                      <img
                        src={ex.imagePath}
                        alt={ex.imageAlt}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d94b2] font-mono-num text-sm font-black text-white shadow-md">
                        {ex.number}
                      </span>
                    </div>

                    {/* Interactive Highlighted Sentence + 4 Element Boxes Right */}
                    <div className="md:col-span-7 p-5 space-y-4 flex flex-col justify-center">
                      <div className="space-y-2">
                        <p className="text-base sm:text-lg md:text-xl font-extrabold leading-relaxed text-[#142236]">
                          {ex.segments.map((seg, idx) => {
                            if (!seg.element) {
                              return <span key={idx}>{seg.text}</span>;
                            }
                            const meta = BENZETME_ELEMENT_LABELS[seg.element];
                            const isHighlighted =
                              activeElementFilter === 'all' || activeElementFilter === seg.element;
                            return (
                              <span
                                key={idx}
                                className="inline-block rounded-md px-1.5 py-0.5 mx-0.5 transition-all"
                                style={
                                  isHighlighted
                                    ? {
                                        backgroundColor: meta.bgHex,
                                        color: meta.colorHex,
                                        boxShadow: `inset 0 0 0 1px ${meta.borderHex}`,
                                      }
                                    : {
                                        color: '#6b7b92',
                                        opacity: 0.5,
                                      }
                                }
                              >
                                {seg.text}
                              </span>
                            );
                          })}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#475d78]">
                          {ex.kidExplanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ELEMENT_ORDER.map((key) => {
                          const meta = BENZETME_ELEMENT_LABELS[key];
                          const isHighlighted =
                            activeElementFilter === 'all' || activeElementFilter === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                setActiveElementFilter(activeElementFilter === key ? 'all' : key)
                              }
                              className="rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer"
                              style={{
                                backgroundColor: isHighlighted ? meta.bgHex : '#f8f9fc',
                                borderColor: isHighlighted ? meta.borderHex : '#e4e9f2',
                                opacity: isHighlighted ? 1 : 0.55,
                              }}
                            >
                              <div
                                className="text-[11px] font-extrabold uppercase tracking-wider"
                                style={{ color: meta.colorHex }}
                              >
                                {meta.label}:
                              </div>
                              <div className="mt-0.5 text-sm sm:text-base font-extrabold text-[#142236]">
                                {ex.elements[key]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Important Note */}
              <div className="rounded-xl border-2 border-[#f2c897] bg-[#fff9f0] p-4 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e67717] text-white mt-0.5">
                  <Info className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#b45309]">
                    Unutma!
                  </div>
                  <p className="mt-0.5 text-sm sm:text-base font-extrabold text-[#451a03]">
                    {BENZETME_FOUR_ELEMENTS_SLIDE.importantNote}
                  </p>
                </div>
              </div>

              {/* Etkinlik D: Benzetme Unsurları (Benzeyen - Benzetilen) Tablosu */}
              <div className="pt-2">
                <BenzetmeElementsTableActivityCard
                  activity={BENZETME_ELEMENTS_ACTIVITY_D}
                  accentHex="#0d94b2"
                  accentSoftBg="#eef8fb"
                  accentBorder="#bae3ee"
                />
              </div>
            </section>
          )}

          {/* TOPIC 3: KİŞİLEŞTİRME (8 Illustrated Example Cards) */}
          {activeTopic === 'kisilestirme' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142236]">
                  Resimli Örnekler ({KISILESTIRME_SLIDE.examples.length})
                </h2>
                <button
                  type="button"
                  onClick={handleToggleAllKisilestirme}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d6ddeb] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#364b68] hover:border-[#d81b75] hover:text-[#d81b75] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>
                    {allKisilestirmeOpen ? 'Tüm Açıklamaları Gizle' : 'Tüm Açıklamaları Göster'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KISILESTIRME_SLIDE.examples.map((item) => {
                  const isOpen = !!expandedKisilestirme[item.number];
                  return (
                    <article
                      key={item.number}
                      className="rounded-2xl border bg-white shadow-xs overflow-hidden flex flex-col transition-all"
                      style={{ borderColor: isOpen ? '#ed9fc6' : '#dfe5f0' }}
                    >
                      {/* Illustrated Picture Banner */}
                      <div className="relative aspect-[16/10] w-full bg-[#fdf1f7] overflow-hidden border-b border-[#f5d8e7]">
                        <img
                          src={item.imagePath}
                          alt={item.imageAlt}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-3 left-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#d81b75] font-mono-num text-xs font-black text-white shadow-md">
                          {item.number}
                        </span>
                      </div>

                      {/* Sentence & Click-to-Reveal Kişileştirme Analysis */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-extrabold text-[#142236] leading-snug">
                          {item.sentence}
                        </h3>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleKisilestirmeCard(item.number)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between rounded-xl border border-[#f5cde1] bg-[#fef6fa] hover:bg-[#fceaf3] px-3.5 py-2 text-xs font-extrabold text-[#b31360] transition-colors cursor-pointer"
                          >
                            <span>
                              {isOpen ? 'Kişileştirme İncelemesini Gizle' : 'Kişileştirme İncelemesini Gör'}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="mt-2.5 space-y-2.5">
                              <p className="rounded-lg border border-[#f2d6e5] bg-[#fff9fc] px-3 py-2 text-xs sm:text-sm font-semibold text-[#475d78] leading-relaxed">
                                {item.kidExplanation}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="rounded-lg border border-[#bce4ee] bg-[#f4fbfd] px-3 py-2">
                                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d94b2]">
                                    Kişileştirilen Varlık
                                  </div>
                                  <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                    {item.varlik}
                                  </div>
                                </div>
                                <div className="rounded-lg border border-[#f2c8de] bg-[#fef7fa] px-3 py-2">
                                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#d81b75]">
                                    Verilen İnsan Özelliği
                                  </div>
                                  <div className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#142236]">
                                    {item.insanOzelligi}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Etkinlik B: Kişileştirme Bulunan Cümleleri İşaretleme */}
              <div className="pt-2">
                <SentenceCheckboxActivity
                  activity={KISILESTIRME_ACTIVITY_B}
                  accentHex="#d81b75"
                  accentSoftBg="#fdf0f6"
                  accentBorder="#f2bfd8"
                />
              </div>
            </section>
          )}

          {/* Bottom Stepper Navigation */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#dde3ee]">
            {prevTopic ? (
              <button
                type="button"
                onClick={() => handleSelectTopic(prevTopic)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#cfd8e6] bg-white hover:bg-[#f1f4fa] px-4 py-2.5 text-sm font-extrabold text-[#22344d] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>
                  {LESSON_TOPICS.find((t) => t.id === prevTopic)?.shortLabel ?? 'Önceki'}
                </span>
              </button>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <button
                type="button"
                onClick={() => handleSelectTopic(nextTopic)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
                style={{ backgroundColor: topicMeta.accentHex }}
              >
                <span>
                  Sonraki: {LESSON_TOPICS.find((t) => t.id === nextTopic)?.shortLabel}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartGameSection}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#15984b] hover:bg-[#117e3e] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Konuyu Bitirdim · SÖZOPLY Oyuna Başla!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
