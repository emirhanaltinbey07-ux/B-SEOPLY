import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceToNextTeam,
  applyActiveChanceCard,
  areAllQuestionsCompleted,
  completeQuestionWithoutBonus,
  computeEffectiveAssetPrice,
  createFairDiceRoller,
  createInitialGameState,
  drawPropertyCard,
  executePeerLoan,
  formatCountdown,
  getRankedTeams,
  getTeamRealEstateCount,
  purchaseActiveProperty,
  repayBankLoan,
  repayPeerLoan,
  resolveDiceRoll,
  resolveJailDecision,
  sellAssetToBank,
  skipActiveProperty,
  skipBonusCardAfterQuestion,
  submitQuestionAnswer,
  takeBankLoan,
  timeoutQuestion,
  tradeAssetBetweenTeams,
} from './engine';
import {
  BOARD_TILES,
  CHANCE_CARDS,
  CHARACTER_OPTIONS,
  CORRECT_ANSWER_BP,
  DEFAULT_TEAMS_SETUP,
  INITIAL_TEAM_BP,
  JAIL_BAIL_BP,
  OFFICIAL_ANSWER_KEY,
  PROPERTY_ASSETS,
  QUESTION_CARDS,
  QUESTION_TIME_LIMIT_SECONDS,
  QUESTIONS_PER_TEAM,
} from './data';

test('24-tile track has exact composition: 1 start, 11 Istanbul locations (incl. Taksim), 5 questions, 4 rewards, 3 jails', () => {
  assert.equal(BOARD_TILES.length, 24);
  const counts = { start: 0, location: 0, question: 0, reward: 0, jail: 0 };
  for (const t of BOARD_TILES) counts[t.type]++;
  assert.deepEqual(counts, { start: 1, location: 11, question: 5, reward: 4, jail: 3 });

  const locNames = BOARD_TILES.filter((t) => t.type === 'location').map((t) => t.name);
  assert.deepEqual(locNames, [
    'Üsküdar',
    'Kız Kulesi',
    '15 Temmuz Şehitler Köprüsü',
    'Ortaköy',
    'Beşiktaş',
    'Taksim',
    'Galata Kulesi',
    'Karaköy',
    'Galata Köprüsü',
    'Sultanahmet',
    'Balat',
  ]);
});

test('all 20 Turkish Söz Sanatları questions match exact official answer key 1..20, 120s (2 min) timer, explanations, +50 TL reward, and vehicles removed', () => {
  assert.equal(QUESTION_CARDS.length, 20);
  assert.equal(QUESTIONS_PER_TEAM, 7);
  assert.equal(QUESTION_TIME_LIMIT_SECONDS, 120);
  assert.equal(CORRECT_ANSWER_BP, 50);
  const key = [
    'B', 'D', 'A', 'D', 'B', 'C', 'A', 'D', 'A', 'D',
    'D', 'A', 'D', 'B', 'A', 'C', 'C', 'D', 'D', 'C',
  ];
  assert.equal(Object.keys(OFFICIAL_ANSWER_KEY).length, 20);
  QUESTION_CARDS.forEach((q, idx) => {
    assert.equal(q.number, idx + 1);
    assert.equal(q.correctAnswer, key[idx]);
    assert.equal(OFFICIAL_ANSWER_KEY[q.number], key[idx]);
    assert.ok(q.explanation.trim().length > 20, `Question ${q.number} must have a clear explanation`);
  });

  // Zero vehicles in PROPERTY_ASSETS — strictly İstanbul districts ('emlak')!
  assert.ok(PROPERTY_ASSETS.length >= 8);
  assert.equal(PROPERTY_ASSETS.every((a) => a.kind === 'emlak'), true);
});

test('all 3 teams start at BAŞLANGIÇ (tile 0) with exact 100 BP, initial departure gives 0 BP, lap gives +50 BP, reward gives +10 BP', () => {
  let state = createInitialGameState(undefined, true, false);
  for (const team of state.teams) {
    assert.equal(team.bp, 100);
    assert.equal(INITIAL_TEAM_BP, 100);
    assert.equal(team.position, 0);
  }

  state = resolveDiceRoll(state, 4);
  assert.equal(state.teams[0].position, 4);
  assert.equal(state.teams[0].bp, 110);

  state = {
    ...state,
    teams: state.teams.map((t, i) => (i === 0 ? { ...t, position: 22, bp: 100, hasLeftStart: true } : t)),
    turnPhase: 'ready_to_roll',
  };
  state = resolveDiceRoll(state, 3);
  assert.equal(state.teams[0].position, 1);
  assert.equal(state.teams[0].bp, 150);
});

test('jail requires 10 TL bail to solve question immediately OR waiting 1 turn without solving a question', () => {
  assert.equal(JAIL_BAIL_BP, 10);

  // Branch 1: Pay 10 TL -> deducts 10 TL (100 -> 90) and proceeds to question!
  let payState = createInitialGameState(undefined, true, false);
  payState = resolveDiceRoll(payState, 6); // Tile 6 is HAPİS / BEKLEME
  assert.equal(payState.turnPhase, 'jail_decision');
  payState = resolveJailDecision(payState, 'pay');
  assert.equal(payState.teams[0].bp, 90);
  assert.equal(payState.teams[0].jailTurnsRemaining, 0);
  assert.equal(payState.turnPhase, 'ready_to_draw_question');

  // Branch 2: Don't pay -> 0 TL lost, skips question now AND waits 1 full turn with no question!
  let waitState = createInitialGameState(undefined, true, false);
  waitState = resolveDiceRoll(waitState, 6);
  waitState = resolveJailDecision(waitState, 'wait');
  assert.equal(waitState.teams[0].bp, 100);
  assert.equal(waitState.teams[0].jailTurnsRemaining, 1);
  assert.equal(waitState.turnPhase, 'turn_complete');
  assert.equal(waitState.activeQuestionNumber, null);
  assert.equal(waitState.specialToast?.subtitle.includes('10 TL'), true);

  waitState = advanceToNextTeam(waitState); // Team 1
  waitState = advanceToNextTeam(waitState); // Team 2
  waitState = advanceToNextTeam(waitState); // Back to Team 0 (serving 1-turn jail wait)
  assert.equal(waitState.activeTeamIndex, 0);
  assert.equal(waitState.teams[0].jailTurnsRemaining, 0);
  assert.equal(waitState.turnPhase, 'turn_complete'); // No roll, no question!
  assert.equal(waitState.activeQuestionNumber, null);
  assert.equal(waitState.specialToast?.subtitle.includes('10 TL'), true);
});

test('bank loan is strictly ONE-TIME per team per game even after repayment; peer loan & trade still work', () => {
  let state = createInitialGameState(undefined, true, false);

  // Take 50 BP bank loan -> 150 BP, hasUsedBankLoan = true
  state = takeBankLoan(state, 0);
  assert.equal(state.teams[0].bp, 150);
  assert.equal(state.teams[0].hasUsedBankLoan, true);
  assert.equal(state.teams[0].activeBankLoan?.repaymentDue, 60);

  // Repay bank loan (-60 BP) -> 90 BP left, activeBankLoan = null, hasUsedBankLoan STILL true!
  state = repayBankLoan(state, 0);
  assert.equal(state.teams[0].bp, 90);
  assert.equal(state.teams[0].activeBankLoan, null);
  assert.equal(state.teams[0].hasUsedBankLoan, true);

  // Second bank loan attempt MUST BE BLOCKED!
  const blocked = takeBankLoan(state, 0);
  assert.equal(blocked.teams[0].bp, 90);
  assert.equal(blocked.teams[0].activeBankLoan, null);

  // Buy Galata Dairesi (75 BP) -> 15 BP left
  state = { ...state, activePropertyAssetId: 'galata-dairesi', turnPhase: 'viewing_property_card' };
  state = purchaseActiveProperty(state);
  assert.equal(state.teams[0].bp, 15);
  assert.equal(state.teams[0].ownedAssetIds.includes('galata-dairesi'), true);

  // Peer loan & repay
  state = executePeerLoan(state, 1, 0, 40, 55); // capped at 48 BP (120%)
  assert.equal(state.peerLoans[0].repaymentAmount, 48);
  state = repayPeerLoan(state, state.peerLoans[0].id);
  assert.equal(state.teams[1].bp, 108);

  // Trade & 70% bank buyback
  state = tradeAssetBetweenTeams(state, 0, 2, 'galata-dairesi', 70);
  assert.equal(state.teams[2].ownedAssetIds.includes('galata-dairesi'), true);
  state = sellAssetToBank(state, 2, 'galata-dairesi');
  assert.equal(state.teams[2].ownedAssetIds.includes('galata-dairesi'), false);
});

test('correct answer gives +50 BP + optional Bonus/Ceza card (or direct skip); wrong answer & 20s timeout deduct -25 BP with NO bonus card', () => {
  let state = createInitialGameState(undefined, true, false);

  // Correct answer -> +50 BP (100 -> 150) & queues optional bonus/ceza card + pendingPropertyDrawAfterBonus
  const q1 = state.questionDeckQueue[0];
  state = submitQuestionAnswer(state, q1, OFFICIAL_ANSWER_KEY[q1]);
  assert.equal(state.teams[0].bp, 150);
  assert.ok(state.activeChanceCardId !== null);
  assert.equal(state.pendingPropertyDrawAfterBonus, true);

  // Optional "Direkt Geç" skips bonus card and transitions directly to ready_to_draw_property
  const skipped = skipBonusCardAfterQuestion(state);
  assert.equal(skipped.activeChanceCardId, null);
  assert.equal(skipped.turnPhase, 'ready_to_draw_property');

  // Penalty chance card (-25 BP) deducts 25 BP cleanly!
  const penaltyCard = CHANCE_CARDS.find((c) => c.effectType === 'lose_bp' && c.value === 25);
  assert.ok(penaltyCard, 'Bonus deck must include -25 BP penalty cards');
  const penalized = applyActiveChanceCard({
    ...state,
    activeChanceCardId: penaltyCard.id,
  });
  assert.equal(penalized.teams[0].bp, 125);
  assert.equal(penalized.turnPhase, 'ready_to_draw_property');

  // Wrong answer on next team -> -25 BP (100 -> 75) & NO bonus card!
  state = advanceToNextTeam(skipped);
  const q2 = state.questionDeckQueue[0];
  const wrongLetter = OFFICIAL_ANSWER_KEY[q2] === 'A' ? 'B' : 'A';
  state = submitQuestionAnswer(state, q2, wrongLetter);
  assert.equal(state.teams[1].bp, 75);
  assert.equal(state.activeChanceCardId, null);
  assert.equal(state.pendingPropertyDrawAfterBonus, false);

  // 20-second timeout on Team 2 -> -25 BP (100 -> 75) & NO bonus card!
  state = advanceToNextTeam(state);
  const q3 = state.questionDeckQueue[0];
  state = timeoutQuestion(state, q3);
  assert.equal(state.teams[2].bp, 75);
  assert.equal(state.lastQuestionOutcome?.timedOut, true);
  assert.equal(state.lastQuestionOutcome?.deltaBp, -25);
  assert.equal(state.activeChanceCardId, null);
});

test('all 20 questions can be played cleanly across 3 teams (7+7+6) and victory ranking ranks strictly by İlçe count', () => {
  let state = createInitialGameState(undefined, true, false);
  for (let i = 0; i < 20; i++) {
    const qNum = state.questionDeckQueue[0];
    state = submitQuestionAnswer(state, qNum, OFFICIAL_ANSWER_KEY[qNum]);
    state = advanceToNextTeam(state);
  }
  assert.equal(state.questionDeckQueue.length, 0);
  assert.equal(state.answeredQuestions.length, 20);
  assert.equal(areAllQuestionsCompleted(state), true);
  assert.equal(state.screen, 'gameover');
  assert.deepEqual(
    state.teams.map((t) => t.questionsAnswered),
    [7, 7, 6]
  );

  const customTeams = state.teams.map((t, idx) => {
    if (idx === 0) return { ...t, bp: 500, ownedAssetIds: ['kucuk-arsa'] };
    if (idx === 1) return { ...t, bp: 40, ownedAssetIds: ['karakoy-dukkani', 'balat-tarihi-evi'] };
    return { ...t, bp: 10, ownedAssetIds: ['galata-dairesi', 'taksim-magazasi', 'uskudar-yalisi'] };
  });
  const ranked = getRankedTeams(customTeams);
  assert.equal(getTeamRealEstateCount(ranked[0]), 3);
  assert.equal(ranked[0].id, 2);
  assert.equal(QUESTION_TIME_LIMIT_SECONDS, 120);
  assert.equal(formatCountdown(QUESTION_TIME_LIMIT_SECONDS), '02:00');
});

test('game automatically transitions to gameover when the 20th question completes (wrong/timeout, property purchase/skip, or extra-roll card)', () => {
  // Play first 19 questions cleanly
  let base = createInitialGameState(undefined, true, false);
  for (let i = 0; i < 19; i++) {
    const qNum = base.questionDeckQueue[0];
    base = submitQuestionAnswer(base, qNum, OFFICIAL_ANSWER_KEY[qNum]);
    base = advanceToNextTeam(base);
  }
  assert.equal(base.questionDeckQueue.length, 1);
  assert.equal(base.screen, 'playing');
  const lastQ = base.questionDeckQueue[0];

  // Branch A: 20th question answered wrong -> completeQuestionWithoutBonus ends game immediately
  const wrongLetter = OFFICIAL_ANSWER_KEY[lastQ] === 'A' ? 'B' : 'A';
  let wrongEnd = submitQuestionAnswer(base, lastQ, wrongLetter);
  assert.equal(areAllQuestionsCompleted(wrongEnd), true);
  wrongEnd = completeQuestionWithoutBonus(wrongEnd);
  assert.equal(wrongEnd.screen, 'gameover');

  // Branch B: 20th question times out -> completeQuestionWithoutBonus ends game immediately
  let timeoutEnd = timeoutQuestion(base, lastQ);
  timeoutEnd = completeQuestionWithoutBonus(timeoutEnd);
  assert.equal(timeoutEnd.screen, 'gameover');

  // Branch C: 20th question answered correctly -> skip bonus -> buy final property -> gameover!
  let correctBuyEnd = submitQuestionAnswer(base, lastQ, OFFICIAL_ANSWER_KEY[lastQ]);
  correctBuyEnd = skipBonusCardAfterQuestion(correctBuyEnd);
  assert.equal(correctBuyEnd.turnPhase, 'ready_to_draw_property');
  assert.equal(correctBuyEnd.screen, 'playing');
  correctBuyEnd = drawPropertyCard(correctBuyEnd, 0);
  correctBuyEnd = purchaseActiveProperty(correctBuyEnd);
  assert.equal(correctBuyEnd.screen, 'gameover');

  // Branch D: 20th question answered correctly -> skip bonus -> draw & skip property -> gameover!
  let correctSkipEnd = submitQuestionAnswer(base, lastQ, OFFICIAL_ANSWER_KEY[lastQ]);
  correctSkipEnd = skipBonusCardAfterQuestion(correctSkipEnd);
  correctSkipEnd = drawPropertyCard(correctSkipEnd, 0);
  correctSkipEnd = skipActiveProperty(correctSkipEnd);
  assert.equal(correctSkipEnd.screen, 'gameover');

  // Branch E: Extra-roll chance card after 20th question does NOT reopen dice rolling
  const extraRollCard = CHANCE_CARDS.find((c) => c.effectType === 'extra_roll')!;
  let extraRollEnd = submitQuestionAnswer(base, lastQ, OFFICIAL_ANSWER_KEY[lastQ]);
  extraRollEnd = applyActiveChanceCard({
    ...extraRollEnd,
    activeChanceCardId: extraRollCard.id,
    pendingPropertyDrawAfterBonus: false,
  });
  assert.equal(extraRollEnd.screen, 'gameover');

  // Guard: resolveDiceRoll refuses to continue after all 20 questions are completed
  const blockedRoll = resolveDiceRoll({ ...wrongEnd, screen: 'playing', turnPhase: 'ready_to_roll' }, 4);
  assert.equal(blockedRoll.screen, 'gameover');
});

test('team characters include 3 distinct mascots (Cesur Aslan, Neşeli Bulut, Bilge Baykuş) with unique team defaults', () => {
  assert.deepEqual(
    CHARACTER_OPTIONS.map((c) => ({ id: c.id, name: c.name, role: c.role })),
    [
      { id: 'etken', name: 'Benzetme', role: 'Cesur Aslan Maskotu' },
      { id: 'edilgen', name: 'Kişileştirme', role: 'Neşeli Bulut Maskotu' },
      { id: 'donuslu', name: 'Söz Ustası', role: 'Bilge Baykuş Maskotu' },
    ]
  );
  assert.deepEqual(
    DEFAULT_TEAMS_SETUP.map((t) => t.characterId),
    ['etken', 'edilgen', 'donuslu']
  );
});

test('fair cryptographic dice roller covers 1..6 uniformly without back-to-back repeats', () => {
  const roller = createFairDiceRoller();
  const rolls: number[] = [];
  for (let i = 0; i < 60; i++) {
    const v = roller.roll();
    assert.ok(Number.isInteger(v) && v >= 1 && v <= 6);
    if (i > 0) {
      assert.notEqual(v, rolls[i - 1], 'Consecutive dice rolls must never repeat identically');
    }
    rolls.push(v);
  }

  // Every 6-roll bag contains all 6 faces 1..6 exactly once
  for (let b = 0; b < 10; b++) {
    const slice = rolls.slice(b * 6, b * 6 + 6).sort((a, z) => a - z);
    assert.deepEqual(slice, [1, 2, 3, 4, 5, 6]);
  }

  // Independent games produce varied roll sequences
  const seqA = Array.from({ length: 12 }, () => createFairDiceRoller().roll()).join(',');
  const roller2 = createFairDiceRoller();
  const seqB = Array.from({ length: 12 }, () => roller2.roll()).join(',');
  const roller3 = createFairDiceRoller();
  const seqC = Array.from({ length: 12 }, () => roller3.roll()).join(',');
  assert.ok(new Set([seqA, seqB, seqC]).size >= 2);
});

test('discount cards use fixed TL amounts (25 TL / 35 TL) with zero percentage wording and subtract exact TL', () => {
  for (const card of CHANCE_CARDS) {
    assert.equal(card.title.includes('%'), false, `Card title should not contain %: ${card.title}`);
    assert.equal(card.description.includes('%'), false, `Card description should not contain %: ${card.description}`);
  }

  const card25 = CHANCE_CARDS.find((c) => c.id === 'emlak-indirimi-25');
  const card35 = CHANCE_CARDS.find((c) => c.id === 'super-emlak-indirimi-35');
  assert.ok(card25 && card25.value === 25);
  assert.ok(card35 && card35.value === 35);
  assert.ok(card25.description.includes('25 TL indirim kazandınız'));
  assert.ok(card35.description.includes('35 TL indirim kazandınız'));

  let state = createInitialGameState(undefined, true, false);
  state = applyActiveChanceCard({
    ...state,
    activeChanceCardId: card25.id,
    pendingPropertyDrawAfterBonus: true,
  });
  assert.equal(state.teams[0].nextPropertyDiscount, 25);
  assert.equal(state.bannerMessage.includes('%'), false);
  assert.equal(state.bannerMessage.includes('25 TL indirim'), true);

  const asset = PROPERTY_ASSETS.find((a) => a.id === 'galata-dairesi')!; // price 75
  assert.equal(computeEffectiveAssetPrice(state.teams[0], asset), asset.price - 25);

  // Applying 35 TL discount subtracts 35 TL cleanly
  const state35 = applyActiveChanceCard({
    ...createInitialGameState(undefined, true, false),
    activeChanceCardId: card35.id,
  });
  assert.equal(state35.teams[0].nextPropertyDiscount, 35);
  assert.equal(computeEffectiveAssetPrice(state35.teams[0], asset), asset.price - 35);
});


