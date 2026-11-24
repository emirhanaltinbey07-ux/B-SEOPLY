import {
  BANK_BUYBACK_RATIO,
  BANK_LOAN_PRINCIPAL,
  BANK_LOAN_REPAYMENT,
  BOARD_TILES,
  CHANCE_CARDS,
  CORRECT_ANSWER_BP,
  DEFAULT_TEAMS_SETUP,
  INITIAL_TEAM_BP,
  JAIL_BAIL_BP,
  MAX_PEER_LOAN_RATIO,
  OFFICIAL_ANSWER_KEY,
  PAWN_COLORS,
  PROPERTY_ASSETS,
  QUESTION_CARDS,
  QUESTION_TIME_LIMIT_SECONDS,
  QUESTIONS_PER_TEAM,
  REWARD_TILE_BP,
  START_PASS_BONUS_BP,
  TOTAL_GAME_SECONDS,
  WRONG_ANSWER_BP,
} from './data';
import {
  ChanceCard,
  CharacterAvatarId,
  GameState,
  OptionLetter,
  PropertyAsset,
  QuestionCard,
  Team,
} from './types';

export interface TeamSetupInput {
  name: string;
  colorId: string;
  characterId: CharacterAvatarId;
}

let toastSeq = 1;

export function getPawnColorHex(colorId: string): string {
  const found = PAWN_COLORS.find((c) => c.id === colorId);
  return found ? found.hex : PAWN_COLORS[0].hex;
}

export function secureRandomInt(maxExclusive: number): number {
  const bound = Math.floor(maxExclusive);
  if (bound <= 1) return 0;

  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / bound) * bound;
    let value = 0;
    do {
      globalThis.crypto.getRandomValues(arr);
      value = arr[0];
    } while (value >= limit);
    return value % bound;
  }

  return Math.floor(Math.random() * bound);
}

export function shuffleSecure<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Cryptographic Shuffled 6-Bag Fair Dice Roller:
 * - Uniform 1/6 distribution over every 6 throws (all values 1..6 appear fairly).
 * - Prevents frustrating back-to-back duplicate rolls (never repeats the same number twice in a row).
 */
export interface FairDiceRoller {
  roll: () => number;
  reset: () => void;
}

export function createFairDiceRoller(): FairDiceRoller {
  let bag: number[] = [];
  let lastValue: number | null = null;

  const refillBag = () => {
    bag = shuffleSecure([1, 2, 3, 4, 5, 6]);
    if (lastValue !== null && bag[0] === lastValue) {
      const swapIdx = 1 + secureRandomInt(bag.length - 1);
      const tmp = bag[0];
      bag[0] = bag[swapIdx];
      bag[swapIdx] = tmp;
    }
  };

  return {
    roll() {
      if (bag.length === 0) {
        refillBag();
      }
      const next = bag.shift()!;
      lastValue = next;
      return next;
    },
    reset() {
      bag = [];
      lastValue = null;
    },
  };
}

/**
 * Pick distinct random starting tile indices across the 24-tile Istanbul track.
 * Excludes jail tiles so no team starts trapped in jail; never grants unearned BP.
 */
export function pickRandomStartPositions(teamCount = 3): number[] {
  const eligibleTileIndices = BOARD_TILES.filter((t) => t.type !== 'jail').map((t) => t.index);
  return shuffleSecure(eligibleTileIndices).slice(0, teamCount);
}

export function createQuestionDeckQueue(shuffle = false, seed = 42): number[] {
  const nums = QUESTION_CARDS.map((q) => q.number);
  if (!shuffle) return nums;
  const arr = [...nums];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function createInitialTeams(
  setup: TeamSetupInput[] = DEFAULT_TEAMS_SETUP
): Team[] {
  const teamSlice = setup.slice(0, 3);

  return teamSlice.map((item, idx) => {
    const trimmed = item.name.trim();
    const fallback = DEFAULT_TEAMS_SETUP[idx];
    const colorId = item.colorId || fallback?.colorId || PAWN_COLORS[idx].id;
    return {
      id: idx,
      name: trimmed.length > 0 ? trimmed : fallback?.name ?? `Takım ${idx + 1}`,
      colorId,
      colorHex: getPawnColorHex(colorId),
      characterId: item.characterId || fallback?.characterId || 'etken',
      position: 0, // All 3 teams always start together at BAŞLANGIÇ (tile 0)
      hasLeftStart: false, // Initial departure from BAŞLANGIÇ gives 0 BP; full lap gives +50 BP
      bp: INITIAL_TEAM_BP, // Exactly 100 BP at game start
      ownedAssetIds: [],
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      jailTurnsRemaining: 0,
      nextPropertyDiscount: 0,
      extraRollPending: false,
      activeBankLoan: null,
      hasUsedBankLoan: false,
    };
  });
}

export function createInitialGameState(
  setup: TeamSetupInput[] = DEFAULT_TEAMS_SETUP,
  autostart = false,
  shuffleDeck = false
): GameState {
  const teams = createInitialTeams(setup);

  return {
    screen: autostart ? 'playing' : 'title',
    teams,
    activeTeamIndex: 0,
    turnNumber: 1,
    turnPhase: 'ready_to_roll',
    lastDiceValue: null,
    questionDeckQueue: createQuestionDeckQueue(shuffleDeck, Date.now() % 10000),
    answeredQuestions: [],
    activeQuestionNumber: null,
    activePropertyAssetId: null,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    inspectedTileIndex: null,
    peerLoans: [],
    financeLog: [
      {
        id: 'fin-init',
        turn: 1,
        summary: `Her takım ${INITIAL_TEAM_BP} BP başlangıç sermayesi ile BAŞLANGIÇ noktasından oyuna başladı.`,
      },
    ],
    specialToast: null,
    remainingSeconds: TOTAL_GAME_SECONDS,
    timerPaused: false,
    bannerMessage: `${teams[0].name} (${INITIAL_TEAM_BP} BP · BAŞLANGIÇ) sırasına başladı. Zar atarak İstanbul turuna çıkın!`,
    lastQuestionOutcome: null,
  };
}

export function getActiveTeam(state: GameState): Team {
  return state.teams[state.activeTeamIndex];
}

export function getQuestionByNumber(questionNumber: number): QuestionCard | undefined {
  return QUESTION_CARDS.find((q) => q.number === questionNumber);
}

/**
 * Count ONLY Real Estate ('emlak' = gayrimenkul) owned by a team!
 * Vehicles ('arac') are STRICTLY EXCLUDED per Section 18.
 */
export function getTeamRealEstateCount(team: Team): number {
  return team.ownedAssetIds.reduce((count, id) => {
    const asset = PROPERTY_ASSETS.find((a) => a.id === id);
    return count + (asset?.kind === 'emlak' ? 1 : 0);
  }, 0);
}

export function getTeamVehicleCount(_team: Team): number {
  return 0;
}

export function getAvailablePropertyAssets(state: GameState): PropertyAsset[] {
  const owned = new Set<string>();
  for (const team of state.teams) {
    for (const id of team.ownedAssetIds) {
      owned.add(id);
    }
  }
  return PROPERTY_ASSETS.filter((asset) => !owned.has(asset.id));
}

export function getAssetOwnerTeam(state: GameState, assetId: string): Team | null {
  return state.teams.find((t) => t.ownedAssetIds.includes(assetId)) ?? null;
}

export function computeEffectiveAssetPrice(team: Team, asset: PropertyAsset): number {
  let price = asset.price;
  if (team.nextPropertyDiscount > 0) {
    price = Math.round(price * (1 - team.nextPropertyDiscount));
  }
  return Math.max(10, price);
}

function pushFinanceLog(state: GameState, summary: string): GameState['financeLog'] {
  return [
    { id: `fin-${state.turnNumber}-${state.financeLog.length}-${Date.now()}`, turn: state.turnNumber, summary },
    ...state.financeLog,
  ].slice(0, 25);
}

export function pickChanceCard(seed?: number): ChanceCard {
  const idx =
    typeof seed === 'number'
      ? Math.abs(seed) % CHANCE_CARDS.length
      : secureRandomInt(CHANCE_CARDS.length);
  return CHANCE_CARDS[idx];
}

/**
 * Resolve landing on a tile on the 24-tile Istanbul track after rolling dice (1..6).
 * Enforces:
 * - Start pass/land bonus: +50 BP ONLY after team has left tile 0 (once per lap).
 * - Reward tile ('reward'): automatic +10 BP.
 * - Jail tile ('jail'): sets jailTurnsRemaining = 1, NO BP penalty, preserves 5-question quota.
 * - 15-question deck: Every team solves up to 5 questions; draws from central SORU KARTLARI deck!
 */
export function resolveDiceRoll(
  state: GameState,
  diceValue: number,
  chanceIndexSeed?: number
): GameState {
  const clampedDice = Math.max(1, Math.min(6, Math.round(diceValue)));
  const team = getActiveTeam(state);

  // Guard: jailed team cannot roll/move this turn
  if (team.jailTurnsRemaining > 0) {
    return state;
  }

  const prevPos = team.position;
  const rawPos = prevPos + clampedDice;
  const passedOrLandedStart = rawPos >= BOARD_TILES.length && (team.hasLeftStart || prevPos > 0);
  const newPos = rawPos % BOARD_TILES.length;
  const landedTile = BOARD_TILES[newPos];

  let bonusBp = 0;
  let toast: GameState['specialToast'] = null;
  let logNotes: string[] = [];

  // 1. Start Point (+50 BP) when completing a lap (never on initial departure from 0)
  if (passedOrLandedStart) {
    bonusBp += START_PASS_BONUS_BP;
    toast = {
      id: ++toastSeq,
      kind: 'start_bonus',
      title: 'BAŞLANGIÇ TURU +50 BP!',
      subtitle: `${team.name} başlangıç noktasına döndü ve +50 BP kazandı!`,
    };
    logNotes.push(`${team.name} BAŞLANGIÇ turu ödülü aldı (+50 BP).`);
  }

  // 2. Reward Tile (+10 BP) — separate from +50 BP start bonus
  if (landedTile.type === 'reward') {
    bonusBp += REWARD_TILE_BP;
    toast = {
      id: ++toastSeq,
      kind: 'reward',
      title: passedOrLandedStart ? 'BAŞLANGIÇ +50 BP & ÖDÜL +10 BP!' : 'ÖDÜL KARESİ +10 BP!',
      subtitle: `${team.name} ödül karesinden +10 BP kazandı!`,
    };
    logNotes.push(`${team.name} ÖDÜL karesinden +10 BP kazandı.`);
  }

  // 3. Jail / Wait Tile -> Player decides: Pay 50 BP bail OR skip question & wait 1 turn!
  const updatedTeams = state.teams.map((t, idx) =>
    idx === state.activeTeamIndex
      ? {
          ...t,
          position: newPos,
          hasLeftStart: true,
          bp: t.bp + bonusBp,
          extraRollPending: false,
        }
      : t
  );

  let nextFinanceLog = state.financeLog;
  for (const note of logNotes) {
    nextFinanceLog = pushFinanceLog({ ...state, financeLog: nextFinanceLog }, note);
  }

  if (landedTile.type === 'jail') {
    toast = {
      id: ++toastSeq,
      kind: 'jail',
      title: 'HAPİS ALANINA GİRDİNİZ!',
      subtitle: `${team.name}: ${JAIL_BAIL_BP} BP ödeyerek hemen devam edin veya ödemeyip 1 tur bekleyin (soru çözülmez).`,
    };
    nextFinanceLog = pushFinanceLog(
      { ...state, financeLog: nextFinanceLog },
      `${team.name} HAPİS alanına geldi (50 BP kefalet veya 1 tur bekleme seçimi).`
    );
    return {
      ...state,
      teams: updatedTeams,
      lastDiceValue: clampedDice,
      turnPhase: 'jail_decision',
      activeQuestionNumber: null,
      activeChanceCardId: null,
      pendingPropertyDrawAfterBonus: false,
      lastQuestionOutcome: null,
      specialToast: toast,
      financeLog: nextFinanceLog,
      bannerMessage: `${team.name} HAPİS karesinde! ${JAIL_BAIL_BP} BP ödeyebilir veya 1 tur soru çözmeden bekleyebilirsiniz.`,
    };
  }

  const canDrawQuestion =
    state.questionDeckQueue.length > 0 && team.questionsAnswered < QUESTIONS_PER_TEAM;

  if (!canDrawQuestion) {
    const chosenChance = pickChanceCard(chanceIndexSeed);
    return {
      ...state,
      teams: updatedTeams,
      lastDiceValue: clampedDice,
      turnPhase: 'drawing_chance_card',
      activeChanceCardId: chosenChance.id,
      activeQuestionNumber: null,
      pendingPropertyDrawAfterBonus: false,
      lastQuestionOutcome: null,
      specialToast: toast,
      financeLog: nextFinanceLog,
      bannerMessage: `${team.name}, ${landedTile.name} karesine geldi (soru kotası tamamlandı). Bonus & İndirim kartı açılıyor!`,
    };
  }

  const nextCardNumber = state.questionDeckQueue[0];
  const tilePrefix =
    landedTile.type === 'question'
      ? `SORU KARTI karesine geldi! `
      : landedTile.type === 'reward'
        ? `ÖDÜL karesinden +10 BP aldı! `
        : `${landedTile.name} lokasyonuna ulaştı! `;

  return {
    ...state,
    teams: updatedTeams,
    lastDiceValue: clampedDice,
    turnPhase: 'ready_to_draw_question',
    activeQuestionNumber: nextCardNumber,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    lastQuestionOutcome: null,
    specialToast: toast,
    financeLog: nextFinanceLog,
    bannerMessage: `${team.name} ${tilePrefix}Ortadaki SORU KARTLARI destesinden Soru ${nextCardNumber} kartını çekin!`,
  };
}

/**
 * Resolve Jail Decision:
 * - action === 'pay': Deduct 50 BP (requires team.bp >= 50), clear jail, proceed to question card!
 * - action === 'wait': No BP deducted, set jailTurnsRemaining = 1, DO NOT solve a question this turn, wait 1 turn!
 */
export function resolveJailDecision(
  state: GameState,
  action: 'pay' | 'wait'
): GameState {
  if (state.turnPhase !== 'jail_decision') return state;
  const team = getActiveTeam(state);

  if (action === 'pay') {
    if (team.bp < JAIL_BAIL_BP) return state;
    const updatedTeams = state.teams.map((t, idx) =>
      idx === state.activeTeamIndex
        ? { ...t, bp: t.bp - JAIL_BAIL_BP, jailTurnsRemaining: 0 }
        : t
    );

    const canDrawQuestion =
      state.questionDeckQueue.length > 0 && team.questionsAnswered < QUESTIONS_PER_TEAM;
    const nextCardNumber = canDrawQuestion ? state.questionDeckQueue[0] : null;

    return {
      ...state,
      teams: updatedTeams,
      turnPhase: canDrawQuestion ? 'ready_to_draw_question' : 'turn_complete',
      activeQuestionNumber: nextCardNumber,
      specialToast: {
        id: ++toastSeq,
        kind: 'bank',
        title: `HAPİS KEFALETİ ÖDENDİ (-${JAIL_BAIL_BP} BP)`,
        subtitle: `${team.name} ${JAIL_BAIL_BP} BP ödedi ve turuna kesintisiz devam ediyor!`,
      },
      financeLog: pushFinanceLog(
        state,
        `${team.name} hapisten çıkmak için ${JAIL_BAIL_BP} BP ödedi.`
      ),
      bannerMessage: canDrawQuestion
        ? `${team.name} ${JAIL_BAIL_BP} BP ödedi! Şimdi Soru ${nextCardNumber} kartını çekebilirsiniz.`
        : `${team.name} ${JAIL_BAIL_BP} BP ödedi ve hapisten çıktı.`,
    };
  }

  // action === 'wait': 1 turn wait, NO question solved!
  const updatedTeams = state.teams.map((t, idx) =>
    idx === state.activeTeamIndex ? { ...t, jailTurnsRemaining: 1 } : t
  );

  return {
    ...state,
    teams: updatedTeams,
    turnPhase: 'turn_complete',
    activeQuestionNumber: null,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    specialToast: {
      id: ++toastSeq,
      kind: 'jail',
      title: 'HAPİS: 1 TUR BEKLEME',
      subtitle: `${team.name} 50 BP ödemedi; bu tur soru çözmeyecek ve 1 tur bekleyecek.`,
    },
    financeLog: pushFinanceLog(
      state,
      `${team.name} hapis kefaletini ödemedi; 1 tur soru çözmeden bekleyecek.`
    ),
    bannerMessage: `${team.name} 50 BP ödemedi (soru çözmeden 1 tur bekleyecek). Sırayı sonraki takıma geçirin.`,
  };
}

/**
 * Evaluate submitted option (A/B/C/D) against Official Teacher Key (1..21).
 * After EVERY question, queues a Bonus & İndirim Card!
 */
export function submitQuestionAnswer(
  state: GameState,
  questionNumber: number,
  selectedAnswer: OptionLetter
): GameState {
  const card = getQuestionByNumber(questionNumber);
  if (!card) return state;

  const team = getActiveTeam(state);

  if (state.answeredQuestions.some((r) => r.questionNumber === questionNumber)) {
    return {
      ...state,
      turnPhase: 'turn_complete',
      activeQuestionNumber: null,
      bannerMessage: `Soru ${questionNumber} daha önce çözüldüğü için tekrar puan verilmedi.`,
    };
  }

  const officialCorrect = OFFICIAL_ANSWER_KEY[questionNumber] ?? card.correctAnswer;
  const isCorrect = selectedAnswer === officialCorrect;
  const deltaBp = isCorrect ? CORRECT_ANSWER_BP : WRONG_ANSWER_BP;
  const nextBp = Math.max(0, team.bp + deltaBp);

  const updatedTeams = state.teams.map((t, idx) =>
    idx === state.activeTeamIndex
      ? {
          ...t,
          bp: nextBp,
          questionsAnswered: t.questionsAnswered + 1,
          correctAnswers: t.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: t.wrongAnswers + (isCorrect ? 0 : 1),
        }
      : t
  );

  const remainingDeck = state.questionDeckQueue.filter((n) => n !== questionNumber);
  const tileName = BOARD_TILES[team.position]?.name ?? 'İstanbul';

  const record = {
    questionNumber,
    teamId: team.id,
    teamName: team.name,
    selectedAnswer,
    correctAnswer: officialCorrect,
    isCorrect,
    timedOut: false,
    tileName,
  };

  const availableAssets = getAvailablePropertyAssets({ ...state, teams: updatedTeams });
  const earnedPropertyDraw = isCorrect && availableAssets.length > 0;
  // ONLY correct answers may draw an optional Bonus / İndirim / Ceza card!
  const bonusCard = isCorrect ? pickChanceCard() : null;

  const bannerMessage = isCorrect
    ? `Doğru cevap! +${CORRECT_ANSWER_BP} BP kazandınız. İsterseniz Bonus / İndirim Kartı çekebilir veya direkt geçebilirsiniz!`
    : `Yanlış cevap (${WRONG_ANSWER_BP} BP). Doğru seçenek ${officialCorrect} şıkkıydı (yanlış cevapta bonus kartı verilmez).`;

  return {
    ...state,
    teams: updatedTeams,
    questionDeckQueue: remainingDeck,
    answeredQuestions: [...state.answeredQuestions, record],
    activeChanceCardId: bonusCard ? bonusCard.id : null,
    pendingPropertyDrawAfterBonus: earnedPropertyDraw,
    lastQuestionOutcome: {
      questionNumber,
      selectedAnswer,
      correctAnswer: officialCorrect,
      correct: isCorrect,
      timedOut: false,
      deltaBp,
      explanation: card.explanation,
    },
    financeLog: pushFinanceLog(
      state,
      isCorrect
        ? `${team.name} Soru ${questionNumber} doğru bildi (+${CORRECT_ANSWER_BP} BP).`
        : `${team.name} Soru ${questionNumber} yanlış yanıtladı (${WRONG_ANSWER_BP} BP).`
    ),
    bannerMessage,
  };
}

/**
 * Called automatically when the 20-second question timer expires:
 * Deducts -25 BP, marks question answered, and grants NO bonus card!
 */
export function timeoutQuestion(state: GameState, questionNumber: number): GameState {
  const card = getQuestionByNumber(questionNumber);
  if (!card) return state;
  if (state.answeredQuestions.some((r) => r.questionNumber === questionNumber)) {
    return state;
  }

  const team = getActiveTeam(state);
  const officialCorrect = OFFICIAL_ANSWER_KEY[questionNumber] ?? card.correctAnswer;
  const deltaBp = WRONG_ANSWER_BP; // -25 BP
  const nextBp = Math.max(0, team.bp + deltaBp);

  const updatedTeams = state.teams.map((t, idx) =>
    idx === state.activeTeamIndex
      ? {
          ...t,
          bp: nextBp,
          questionsAnswered: t.questionsAnswered + 1,
          wrongAnswers: t.wrongAnswers + 1,
        }
      : t
  );

  const remainingDeck = state.questionDeckQueue.filter((n) => n !== questionNumber);
  const tileName = BOARD_TILES[team.position]?.name ?? 'İstanbul';

  return {
    ...state,
    teams: updatedTeams,
    questionDeckQueue: remainingDeck,
    answeredQuestions: [
      ...state.answeredQuestions,
      {
        questionNumber,
        teamId: team.id,
        teamName: team.name,
        selectedAnswer: null,
        correctAnswer: officialCorrect,
        isCorrect: false,
        timedOut: true,
        tileName,
      },
    ],
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    lastQuestionOutcome: {
      questionNumber,
      selectedAnswer: null,
      correctAnswer: officialCorrect,
      correct: false,
      timedOut: true,
      deltaBp,
      explanation: card.explanation,
    },
    financeLog: pushFinanceLog(
      state,
      `${team.name} Soru ${questionNumber} için ${QUESTION_TIME_LIMIT_SECONDS} saniye içinde yanıt veremedi (${WRONG_ANSWER_BP} BP).`
    ),
    bannerMessage: `Süre doldu (${QUESTION_TIME_LIMIT_SECONDS} sn)! ${WRONG_ANSWER_BP} BP kesildi. Doğru seçenek ${officialCorrect} şıkkıydı.`,
  };
}

/**
 * Optional "Direkt Geç" after a correct question answer:
 * Skips drawing the Bonus/İndirim/Ceza card and moves directly to Emlak Kartı (or turn_complete).
 */
export function skipBonusCardAfterQuestion(state: GameState): GameState {
  const team = getActiveTeam(state);
  const availableAssets = getAvailablePropertyAssets(state);
  const nextPhase: GameState['turnPhase'] =
    state.pendingPropertyDrawAfterBonus && availableAssets.length > 0
      ? 'ready_to_draw_property'
      : 'turn_complete';

  return {
    ...state,
    activeQuestionNumber: null,
    lastQuestionOutcome: null,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    turnPhase: nextPhase,
    bannerMessage:
      nextPhase === 'ready_to_draw_property'
        ? `${team.name} bonus/indirim kartını pas geçti. İsterseniz EMLAK KARTI çekebilir veya sırayı geçebilirsiniz.`
        : `${team.name} bonus/indirim kartını pas geçti. Sırayı sonraki takıma geçirebilirsiniz.`,
  };
}

export function drawPropertyCard(state: GameState, seed?: number): GameState {
  const available = getAvailablePropertyAssets(state);
  if (available.length === 0) {
    return {
      ...state,
      turnPhase: 'turn_complete',
      activePropertyAssetId: null,
      bannerMessage: 'İstanbul piyasasındaki tüm gayrimenkul ve araçlar satın alındı!',
    };
  }
  const idx =
    typeof seed === 'number'
      ? Math.abs(seed) % available.length
      : secureRandomInt(available.length);
  const chosen = available[idx];
  return {
    ...state,
    turnPhase: 'viewing_property_card',
    activePropertyAssetId: chosen.id,
    bannerMessage: `${chosen.name} kartı açıldı! BP puanınız yeterliyse satın alabilir veya Banka kredisi kullanabilirsiniz.`,
  };
}

export function purchaseActiveProperty(state: GameState): GameState {
  if (!state.activePropertyAssetId) return state;
  const asset = PROPERTY_ASSETS.find((p) => p.id === state.activePropertyAssetId);
  if (!asset) return state;

  if (getAssetOwnerTeam(state, asset.id)) {
    return {
      ...state,
      activePropertyAssetId: null,
      turnPhase: 'turn_complete',
      bannerMessage: `${asset.name} zaten başka bir takımın mülkiyetinde.`,
    };
  }

  const team = getActiveTeam(state);
  const price = computeEffectiveAssetPrice(team, asset);

  if (team.bp < price) {
    return {
      ...state,
      bannerMessage: `${team.name} bakiyesi (${team.bp} BP) ${asset.name} (${price} BP) için yetersiz. Banka kredisi veya takım borcu kullanabilirsiniz!`,
    };
  }

  const updatedTeams = state.teams.map((t, idx) =>
    idx === state.activeTeamIndex
      ? {
          ...t,
          bp: t.bp - price,
          ownedAssetIds: [...t.ownedAssetIds, asset.id],
          nextPropertyDiscount: 0,
        }
      : t
  );

  return {
    ...state,
    teams: updatedTeams,
    activePropertyAssetId: null,
    turnPhase: 'turn_complete',
    specialToast: {
      id: ++toastSeq,
      kind: 'purchase',
      title: `${asset.name} SATIN ALINDI!`,
      subtitle: `${team.name} ${price} BP ödeyerek tapuyu envanterine ekledi.`,
    },
    financeLog: pushFinanceLog(
      state,
      `${team.name}, ${asset.name} (${asset.kind === 'emlak' ? 'Gayrimenkul' : 'Araç'}) satın aldı (-${price} BP).`
    ),
    bannerMessage: `${team.name}, ${asset.name} varlığını ${price} BP ile satın aldı!`,
  };
}

export function skipActiveProperty(state: GameState): GameState {
  const team = getActiveTeam(state);
  return {
    ...state,
    activePropertyAssetId: null,
    turnPhase: 'turn_complete',
    bannerMessage: `${team.name} satın alma hakkını pas geçti.`,
  };
}

export function applyActiveChanceCard(state: GameState): GameState {
  if (!state.activeChanceCardId) return state;
  const card = CHANCE_CARDS.find((c) => c.id === state.activeChanceCardId);
  if (!card) return state;

  const team = getActiveTeam(state);
  let updatedTeams = [...state.teams];
  const availableAssets = getAvailablePropertyAssets(state);
  let nextPhase: GameState['turnPhase'] =
    state.pendingPropertyDrawAfterBonus && availableAssets.length > 0
      ? 'ready_to_draw_property'
      : 'turn_complete';
  let msg = '';

  switch (card.effectType) {
    case 'extra_roll': {
      updatedTeams = state.teams.map((t, idx) =>
        idx === state.activeTeamIndex ? { ...t, extraRollPending: true } : t
      );
      if (nextPhase !== 'ready_to_draw_property') {
        nextPhase = 'ready_to_roll';
      }
      msg = `Vapur Seferi! ${team.name} ekstra zar hakkı kazandı!`;
      break;
    }
    case 'skip_turn': {
      updatedTeams = state.teams.map((t, idx) =>
        idx === state.activeTeamIndex ? { ...t, jailTurnsRemaining: 1 } : t
      );
      msg = `Boğaz Trafiği! ${team.name} bir sonraki hareket turunda 1 el bekleyecek.`;
      break;
    }
    case 'gain_bp': {
      const bonus = card.value ?? 30;
      updatedTeams = state.teams.map((t, idx) =>
        idx === state.activeTeamIndex ? { ...t, bp: t.bp + bonus } : t
      );
      msg = `${card.title}: ${team.name} +${bonus} BP bonus kazandı!`;
      break;
    }
    case 'lose_bp': {
      const penalty = card.value ?? 25;
      updatedTeams = state.teams.map((t, idx) =>
        idx === state.activeTeamIndex ? { ...t, bp: Math.max(0, t.bp - penalty) } : t
      );
      msg = `${card.title}: ${team.name} kasasından -${penalty} BP ödendi.`;
      break;
    }
    case 'property_discount': {
      const disc = card.value ?? 0.25;
      updatedTeams = state.teams.map((t, idx) =>
        idx === state.activeTeamIndex ? { ...t, nextPropertyDiscount: disc } : t
      );
      msg = `${card.title}! ${team.name} bir sonraki emlak alımında %${Math.round(disc * 100)} indirim kazandı.`;
      break;
    }
    case 'bonus_property_draw': {
      if (availableAssets.length > 0) {
        nextPhase = 'ready_to_draw_property';
        msg = `${card.title}! ${team.name}, EMLAK KARTLARI destesinden hemen kart çekebilir!`;
      } else {
        updatedTeams = state.teams.map((t, idx) =>
          idx === state.activeTeamIndex ? { ...t, bp: t.bp + 30 } : t
        );
        msg = `${card.title}! Tüm mülkler alındığı için +30 BP bonus eklendi.`;
      }
      break;
    }
  }

  return {
    ...state,
    teams: updatedTeams,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    turnPhase: nextPhase,
    financeLog: pushFinanceLog(state, `${team.name} — ${msg}`),
    bannerMessage:
      nextPhase === 'ready_to_draw_property'
        ? `${msg} Şimdi EMLAK KARTLARI destesinden tapu kartı çekebilirsiniz!`
        : msg,
  };
}

// ============================================================
// BANKA, KREDİ (OYUN BOYUNCA SADECE 1 KEZ), TAKIM BORCU VE EMLAK SATIŞI
// ============================================================

/** 1. Bank Loan: 50 BP principal -> 60 BP repayment (STRICTLY ONCE per team per game!) */
export function takeBankLoan(state: GameState, teamIndex: number): GameState {
  const team = state.teams[teamIndex];
  if (!team || team.activeBankLoan || team.hasUsedBankLoan) return state;

  const updatedTeams = state.teams.map((t, idx) =>
    idx === teamIndex
      ? {
          ...t,
          bp: t.bp + BANK_LOAN_PRINCIPAL,
          hasUsedBankLoan: true,
          activeBankLoan: {
            principal: BANK_LOAN_PRINCIPAL,
            repaymentDue: BANK_LOAN_REPAYMENT,
            takenTurn: state.turnNumber,
          },
        }
      : t
  );

  return {
    ...state,
    teams: updatedTeams,
    specialToast: {
      id: ++toastSeq,
      kind: 'bank',
      title: 'BANKA KREDİSİ ONAYLANDI (+50 BP)',
      subtitle: `${team.name} tek seferlik 50 BP kredi hakkını kullandı (Geri ödeme: 60 BP).`,
    },
    financeLog: pushFinanceLog(
      state,
      `${team.name} Bankadan tek seferlik 50 BP kredi aldı (60 BP geri ödemeli).`
    ),
    bannerMessage: `${team.name} Bankadan tek seferlik +50 BP kredi aldı (60 BP geri ödemeli).`,
  };
}

/** 2. Repay Bank Loan: -60 BP */
export function repayBankLoan(state: GameState, teamIndex: number): GameState {
  const team = state.teams[teamIndex];
  if (!team || !team.activeBankLoan) return state;
  const due = team.activeBankLoan.repaymentDue;
  if (team.bp < due) return state;

  const updatedTeams = state.teams.map((t, idx) =>
    idx === teamIndex
      ? {
          ...t,
          bp: t.bp - due,
          activeBankLoan: null,
        }
      : t
  );

  return {
    ...state,
    teams: updatedTeams,
    specialToast: {
      id: ++toastSeq,
      kind: 'bank',
      title: 'BANKA KREDİSİ KAPATILDI (-60 BP)',
      subtitle: `${team.name} banka borcunu eksiksiz ödedi.`,
    },
    financeLog: pushFinanceLog(state, `${team.name} banka kredisini kapattı (-${due} BP).`),
    bannerMessage: `${team.name} 60 BP ödeyerek banka kredisini kapattı.`,
  };
}

/** 3. Inter-Team Peer Loan (repayment <= 120% of principal, principal <= lender.bp) */
export function executePeerLoan(
  state: GameState,
  lenderIdx: number,
  borrowerIdx: number,
  principal: number,
  repaymentAmount: number
): GameState {
  if (lenderIdx === borrowerIdx) return state;
  const lender = state.teams[lenderIdx];
  const borrower = state.teams[borrowerIdx];
  if (!lender || !borrower) return state;

  const cleanPrincipal = Math.floor(principal);
  const maxAllowedRepayment = Math.floor(cleanPrincipal * MAX_PEER_LOAN_RATIO);
  const cleanRepayment = Math.min(Math.max(cleanPrincipal, Math.floor(repaymentAmount)), maxAllowedRepayment);

  if (cleanPrincipal <= 0 || lender.bp < cleanPrincipal) return state;

  const updatedTeams = state.teams.map((t, idx) => {
    if (idx === lenderIdx) return { ...t, bp: t.bp - cleanPrincipal };
    if (idx === borrowerIdx) return { ...t, bp: t.bp + cleanPrincipal };
    return t;
  });

  const newLoan = {
    id: `peer-${Date.now()}-${state.peerLoans.length}`,
    lenderTeamId: lender.id,
    borrowerTeamId: borrower.id,
    principal: cleanPrincipal,
    repaymentAmount: cleanRepayment,
    paid: false,
  };

  return {
    ...state,
    teams: updatedTeams,
    peerLoans: [newLoan, ...state.peerLoans],
    specialToast: {
      id: ++toastSeq,
      kind: 'bank',
      title: 'TAKIMLAR ARASI BORÇ AKTARILDI',
      subtitle: `${lender.name} → ${borrower.name}: ${cleanPrincipal} BP (Geri ödeme: ${cleanRepayment} BP).`,
    },
    financeLog: pushFinanceLog(
      state,
      `${lender.name}, ${borrower.name} takımına ${cleanPrincipal} BP borç verdi (Geri ödeme: ${cleanRepayment} BP).`
    ),
    bannerMessage: `${lender.name}, ${borrower.name} takımına ${cleanPrincipal} BP borç verdi.`,
  };
}

export function repayPeerLoan(state: GameState, loanId: string): GameState {
  const loan = state.peerLoans.find((l) => l.id === loanId && !l.paid);
  if (!loan) return state;
  const borrower = state.teams[loan.borrowerTeamId];
  const lender = state.teams[loan.lenderTeamId];
  if (!borrower || !lender || borrower.bp < loan.repaymentAmount) return state;

  const updatedTeams = state.teams.map((t) => {
    if (t.id === borrower.id) return { ...t, bp: t.bp - loan.repaymentAmount };
    if (t.id === lender.id) return { ...t, bp: t.bp + loan.repaymentAmount };
    return t;
  });

  return {
    ...state,
    teams: updatedTeams,
    peerLoans: state.peerLoans.map((l) => (l.id === loanId ? { ...l, paid: true } : l)),
    financeLog: pushFinanceLog(
      state,
      `${borrower.name}, ${lender.name} takımına ${loan.repaymentAmount} BP borcunu ödedi.`
    ),
    bannerMessage: `${borrower.name}, ${lender.name} takımına olan ${loan.repaymentAmount} BP borcunu kapattı.`,
  };
}

/** 4. Sell Property/Vehicle Back to Bank at 70% of Original Price */
export function sellAssetToBank(
  state: GameState,
  sellerTeamIdx: number,
  assetId: string
): GameState {
  const seller = state.teams[sellerTeamIdx];
  const asset = PROPERTY_ASSETS.find((a) => a.id === assetId);
  if (!seller || !asset || !seller.ownedAssetIds.includes(assetId)) return state;

  const buybackBp = Math.round(asset.price * BANK_BUYBACK_RATIO);
  const updatedTeams = state.teams.map((t, idx) =>
    idx === sellerTeamIdx
      ? {
          ...t,
          bp: t.bp + buybackBp,
          ownedAssetIds: t.ownedAssetIds.filter((id) => id !== assetId),
        }
      : t
  );

  return {
    ...state,
    teams: updatedTeams,
    specialToast: {
      id: ++toastSeq,
      kind: 'bank',
      title: `BANKAYA SATIŞ (+${buybackBp} BP)`,
      subtitle: `${seller.name}, ${asset.name} varlığını %70 bedelle Bankaya sattı.`,
    },
    financeLog: pushFinanceLog(
      state,
      `${seller.name}, ${asset.name} varlığını Bankaya sattı (+${buybackBp} BP).`
    ),
    bannerMessage: `${seller.name}, ${asset.name} varlığını Bankaya satarak +${buybackBp} BP kazandı.`,
  };
}

/** 5. Trade / Sell Property or Vehicle to Another Team (mutually exclusive ownership) */
export function tradeAssetBetweenTeams(
  state: GameState,
  sellerTeamIdx: number,
  buyerTeamIdx: number,
  assetId: string,
  salePrice: number
): GameState {
  if (sellerTeamIdx === buyerTeamIdx) return state;
  const seller = state.teams[sellerTeamIdx];
  const buyer = state.teams[buyerTeamIdx];
  const asset = PROPERTY_ASSETS.find((a) => a.id === assetId);
  const cleanPrice = Math.max(1, Math.floor(salePrice));

  if (!seller || !buyer || !asset) return state;
  if (!seller.ownedAssetIds.includes(assetId)) return state;
  if (buyer.bp < cleanPrice) return state;

  const updatedTeams = state.teams.map((t, idx) => {
    if (idx === sellerTeamIdx) {
      return {
        ...t,
        bp: t.bp + cleanPrice,
        ownedAssetIds: t.ownedAssetIds.filter((id) => id !== assetId),
      };
    }
    if (idx === buyerTeamIdx) {
      return {
        ...t,
        bp: t.bp - cleanPrice,
        ownedAssetIds: [...t.ownedAssetIds, assetId],
      };
    }
    return t;
  });

  return {
    ...state,
    teams: updatedTeams,
    specialToast: {
      id: ++toastSeq,
      kind: 'purchase',
      title: 'MÜLKİYET DEVRİ TAMAMLANDI',
      subtitle: `${asset.name}: ${seller.name} → ${buyer.name} (${cleanPrice} BP).`,
    },
    financeLog: pushFinanceLog(
      state,
      `${seller.name}, ${asset.name} varlığını ${buyer.name} takımına ${cleanPrice} BP’ye sattı.`
    ),
    bannerMessage: `${asset.name} artık ${buyer.name} takımının mülkiyetinde!`,
  };
}

/**
 * Advance to next team cleanly.
 * If incoming team is jailed (jailTurnsRemaining > 0):
 * - Decrement jailTurnsRemaining to 0 (strictly 1 turn wait!)
 * - They DO NOT roll and DO NOT solve a question on this skipped turn ('turn_complete').
 */
export function advanceToNextTeam(state: GameState): GameState {
  const nextIdx = (state.activeTeamIndex + 1) % state.teams.length;
  const incoming = state.teams[nextIdx];

  if (incoming.jailTurnsRemaining > 0) {
    const updatedTeams = state.teams.map((t, idx) =>
      idx === nextIdx ? { ...t, jailTurnsRemaining: 0 } : t
    );

    return {
      ...state,
      teams: updatedTeams,
      activeTeamIndex: nextIdx,
      turnNumber: state.turnNumber + 1,
      turnPhase: 'turn_complete',
      activeQuestionNumber: null,
      activePropertyAssetId: null,
      activeChanceCardId: null,
      pendingPropertyDrawAfterBonus: false,
      lastQuestionOutcome: null,
      specialToast: {
        id: ++toastSeq,
        kind: 'jail',
        title: `${incoming.name} HAPİS CEZASI BEKLEME TURU`,
        subtitle:
          '50 BP ödenmediği için bu tur zar atılmaz ve soru çözülmez. Gelecek tur normale döner!',
      },
      bannerMessage: `${incoming.name} bekleme turunda (soru çözmeden 1 tur bekliyor). Sonraki takıma geçebilirsiniz.`,
    };
  }

  return {
    ...state,
    activeTeamIndex: nextIdx,
    turnNumber: state.turnNumber + 1,
    turnPhase: 'ready_to_roll',
    activeQuestionNumber: null,
    activePropertyAssetId: null,
    activeChanceCardId: null,
    pendingPropertyDrawAfterBonus: false,
    lastQuestionOutcome: null,
    bannerMessage: `Sıra ${incoming.name} takımında. Zar atarak İstanbul parkurunda ilerleyin!`,
  };
}

/**
 * OFFICIAL VICTORY RANKING (Section 18 — STRICT REAL ESTATE COUNT CRITERION):
 * 1. Most Real Estate (kind === 'emlak') — Vehicles are NOT counted!
 * 2. Tie-breaker 1: More Correct Answers
 * 3. Tie-breaker 2: Higher BP Balance
 */
export function getRankedTeams(teams: Team[]): (Team & {
  realEstateCount: number;
  vehicleCount: number;
  rank: number;
})[] {
  const enriched = teams.map((team) => ({
    ...team,
    realEstateCount: getTeamRealEstateCount(team),
    vehicleCount: getTeamVehicleCount(team),
  }));

  enriched.sort((a, b) => {
    if (b.realEstateCount !== a.realEstateCount) {
      return b.realEstateCount - a.realEstateCount;
    }
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return b.bp - a.bp;
  });

  return enriched.map((t, index) => ({
    ...t,
    rank: index + 1,
  }));
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
