import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { ChanceCardModal } from './components/ChanceCardModal';
import { EvidenceVaultModal } from './components/EvidenceVaultModal';
import { LessonSection } from './components/LessonSection';
import {
  DiceResultBanner,
  FpsCameraHudBadge,
  JailDecisionModal,
  LandmarkInfoCard,
  PauseModal,
  SpecialEventToastBanner,
  TeamInventoryModal,
  VictoryModal,
} from './components/Overlays';
import { PropertyCardModal } from './components/PropertyCardModal';
import { QuestionCardModal } from './components/QuestionCardModal';
import { TeacherPanelModal } from './components/TeacherPanelModal';
import { TeamSetupScreen } from './components/TeamSetupScreen';
import { TopHud } from './components/TopHud';
import {
  BOARD_TILES,
  CHANCE_CARDS,
  CHARACTER_OPTIONS,
  DEFAULT_TEAMS_SETUP,
  PROPERTY_ASSETS,
  QUESTION_CARDS,
} from './game/data';
import {
  advanceToNextTeam,
  applyActiveChanceCard,
  areAllQuestionsCompleted,
  completeQuestionWithoutBonus,
  createFairDiceRoller,
  createInitialGameState,
  drawPropertyCard,
  getActiveTeam,
  getQuestionByNumber,
  getRankedTeams,
  purchaseActiveProperty,
  resolveDiceRoll,
  resolveJailDecision,
  skipActiveProperty,
  skipBonusCardAfterQuestion,
  submitQuestionAnswer,
  TeamSetupInput,
  timeoutQuestion,
} from './game/engine';
import { GameState, OptionLetter } from './game/types';
import { getDiceCameraTimings } from './scene/characterExpressions';
import { IstanbulSceneController } from './scene/IstanbulScene';
import { soundEngine } from './utils/sound';

function isAutostartEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [appSection, setAppSection] = useState<'lesson' | 'game'>(() =>
    isAutostartEnabled() ? 'game' : 'lesson'
  );
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(DEFAULT_TEAMS_SETUP, isAutostartEnabled(), false)
  );
  const [muted, setMuted] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [showFinalReview, setShowFinalReview] = useState(false);
  const [currentWalkStep, setCurrentWalkStep] = useState(0);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<IstanbulSceneController | null>(null);
  const diceRollerRef = useRef(createFairDiceRoller());
  const diceRevealTimerRef = useRef<number | null>(null);
  const boardOverviewTimerRef = useRef<number | null>(null);
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  const clearDiceTimers = useCallback(() => {
    if (diceRevealTimerRef.current !== null) {
      window.clearTimeout(diceRevealTimerRef.current);
      diceRevealTimerRef.current = null;
    }
    if (boardOverviewTimerRef.current !== null) {
      window.clearTimeout(boardOverviewTimerRef.current);
      boardOverviewTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearDiceTimers();
    };
  }, [clearDiceTimers]);

  // Keep <body data-state="..." data-section="..."> synchronized for clear state inspection
  useEffect(() => {
    document.body.dataset.state = gameState.screen;
    document.body.dataset.section = appSection;
  }, [gameState.screen, appSection]);

  // Ensure Three.js canvas updates dimensions cleanly when switching into Part 2 (3D Game)
  useEffect(() => {
    if (appSection !== 'game') return;
    const raf = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [appSection]);

  // Auto-dismiss special toast after 4.5s
  useEffect(() => {
    if (!gameState.specialToast) return;
    const timer = window.setTimeout(() => {
      setGameState((prev) =>
        prev.specialToast?.id === gameState.specialToast?.id
          ? { ...prev, specialToast: null }
          : prev
      );
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [gameState.specialToast]);

  const prevScreenRef = useRef<GameState['screen']>(gameState.screen);

  // Trigger Victory Fanfare & 3D Champion Airplane Celebration whenever game enters 'gameover'
  useEffect(() => {
    if (prevScreenRef.current !== 'gameover' && gameState.screen === 'gameover') {
      const champion = getRankedTeams(gameState.teams)[0];
      setShowFinalReview(false);
      setShowTeacherPanel(false);
      setShowInventoryModal(false);
      soundEngine.playVictoryFanfare();
      sceneRef.current?.triggerCelebrationFireworks(
        champion?.name ?? 'ŞAMPİYON',
        champion?.colorHex
      );
    }
    prevScreenRef.current = gameState.screen;
  }, [gameState.screen, gameState.teams]);

  // Action callbacks kept in refs for stable single-mount WebGL listener wiring
  const handleRollDice = useCallback(() => {
    const cur = stateRef.current;
    const activeTeam = getActiveTeam(cur);
    if (cur.screen !== 'playing' || cur.turnPhase !== 'ready_to_roll') return;
    if (areAllQuestionsCompleted(cur)) return;
    if (activeTeam.jailTurnsRemaining > 0) return;

    const urlDice =
      typeof window !== 'undefined'
        ? Number(new URLSearchParams(window.location.search).get('dice'))
        : NaN;
    const diceValue =
      Number.isInteger(urlDice) && urlDice >= 1 && urlDice <= 6
        ? urlDice
        : diceRollerRef.current.roll();
    const startTile = activeTeam.position;
    const charName =
      CHARACTER_OPTIONS.find((c) => c.id === activeTeam.characterId)?.name ?? 'Benzetme';
    soundEngine.playDiceRoll();

    clearDiceTimers();

    setCurrentWalkStep(0);
    setGameState((prev) => ({
      ...prev,
      turnPhase: 'rolling_dice',
      lastDiceValue: null,
      inspectedTileIndex: null,
      bannerMessage: `${activeTeam.name} (${charName}) zar atıyor...`,
    }));

    const startSlowFpsWalk = () => {
      setCurrentWalkStep(0);
      setGameState((prev) => ({
        ...prev,
        turnPhase: 'running_student',
        bannerMessage: `${charName} (${activeTeam.name}) FPS modunda ${diceValue} adım ilerliyor...`,
      }));

      const onArrival = () => {
        const latest = stateRef.current;
        const resolved = resolveDiceRoll(latest, diceValue);
        const landedTeam = resolved.teams[resolved.activeTeamIndex];
        const landedTile = BOARD_TILES[landedTeam.position];

        if (resolved.specialToast?.kind === 'start_bonus') {
          soundEngine.playStartLapBonus();
          sceneRef.current?.triggerBonusSparkle();
          sceneRef.current?.playCharacterReaction(landedTeam.id, 'celebrate', 4200, true);
        } else if (resolved.specialToast?.kind === 'reward') {
          soundEngine.playRewardChime();
          sceneRef.current?.triggerBonusSparkle();
          sceneRef.current?.playCharacterReaction(landedTeam.id, 'surprised', 4200, true);
        } else if (resolved.specialToast?.kind === 'jail') {
          soundEngine.playJailTone();
          sceneRef.current?.playCharacterReaction(landedTeam.id, 'surprised', 3600, false);
          sceneRef.current?.focusTile(landedTile.index);
        } else {
          sceneRef.current?.focusTile(landedTile.index);
        }

        setGameState(resolved);
      };

      if (sceneRef.current) {
        sceneRef.current.animateStudentRun(
          activeTeam.id,
          startTile,
          diceValue,
          (stepIdx) => {
            setCurrentWalkStep(stepIdx);
            soundEngine.playPawnHop(stepIdx);
          },
          onArrival
        );
      } else {
        onArrival();
      }
    };

    const revealDiceResultThenWalk = () => {
      const timings = getDiceCameraTimings(sceneRef.current?.isSoftwareGl ?? false);
      soundEngine.playRewardChime();
      setGameState((prev) => ({
        ...prev,
        turnPhase: 'showing_dice_result',
        lastDiceValue: diceValue,
        bannerMessage: `Zar sonucu: ${diceValue}! Oyun tahtası açılıyor...`,
      }));

      // Stage 1 -> Stage 2: Hold close-up zoom on landed die, then pull back to full board overview
      diceRevealTimerRef.current = window.setTimeout(() => {
        diceRevealTimerRef.current = null;
        sceneRef.current?.focusOverview(true);
        setGameState((prev) => ({
          ...prev,
          bannerMessage: `Tahta görünümü açıldı! ${charName} FPS moduna geçiyor (${diceValue} adım)...`,
        }));

        // Stage 2 -> Stage 3: Hold full board overview briefly, then swoop into FPS walking mode
        boardOverviewTimerRef.current = window.setTimeout(() => {
          boardOverviewTimerRef.current = null;
          startSlowFpsWalk();
        }, timings.boardOverviewMs);
      }, timings.diceHoldMs);
    };

    if (sceneRef.current) {
      sceneRef.current.animateDiceRoll(diceValue, revealDiceResultThenWalk);
    } else {
      revealDiceResultThenWalk();
    }
  }, [clearDiceTimers]);

  const handleDrawQuestionCard = useCallback(() => {
    const cur = stateRef.current;
    if (cur.screen !== 'playing' || cur.turnPhase !== 'ready_to_draw_question') return;
    if (!cur.activeQuestionNumber) return;

    const qNum = cur.activeQuestionNumber;
    soundEngine.playCardFlip();
    setGameState((prev) => ({
      ...prev,
      turnPhase: 'drawing_question_card',
      bannerMessage: `SORU KARTLARI destesinden Soru ${qNum} çekiliyor...`,
    }));

    const revealQuestion = () => {
      setGameState((prev) => ({
        ...prev,
        turnPhase: 'answering_question',
      }));
    };

    if (sceneRef.current) {
      sceneRef.current.animateCardDraw('question', `SORU ${qNum}`, revealQuestion);
    } else {
      revealQuestion();
    }
  }, []);

  const handleDrawPropertyCard = useCallback(() => {
    const cur = stateRef.current;
    if (cur.screen !== 'playing' || cur.turnPhase !== 'ready_to_draw_property') return;

    soundEngine.playCardFlip();
    setGameState((prev) => ({
      ...prev,
      turnPhase: 'drawing_property_card',
      bannerMessage: 'İLÇE KARTLARI destesinden yeni bir İstanbul ilçesi çekiliyor...',
    }));

    const revealProperty = () => {
      setGameState((prev) => drawPropertyCard(prev));
    };

    if (sceneRef.current) {
      sceneRef.current.animateCardDraw('property', 'İLÇE KARTI', revealProperty);
    } else {
      revealProperty();
    }
  }, []);

  const handleDrawChanceCard = useCallback(() => {
    const cur = stateRef.current;
    if (cur.screen !== 'playing' || cur.turnPhase !== 'ready_to_draw_chance') return;
    const chance = cur.activeChanceCardId
      ? CHANCE_CARDS.find((c) => c.id === cur.activeChanceCardId)
      : null;

    soundEngine.playCardFlip();
    setGameState((prev) => ({
      ...prev,
      turnPhase: 'drawing_chance_card',
      bannerMessage: `ÖDÜL YA DA CEZA destesinden kart çekiliyor: ${chance?.title ?? 'Sürpriz Kart'}...`,
    }));

    const revealChance = () => {
      setGameState((prev) => ({
        ...prev,
        turnPhase: 'viewing_chance_card',
      }));
    };

    if (sceneRef.current) {
      sceneRef.current.animateCardDraw('chance', 'ÖDÜL YA DA CEZA', revealChance);
    } else {
      revealChance();
    }
  }, []);

  const handleClickTile = useCallback((tileIndex: number) => {
    sceneRef.current?.focusTile(tileIndex);
    setGameState((prev) => ({ ...prev, inspectedTileIndex: tileIndex }));
  }, []);

  const sceneCallbacksRef = useRef({
    onClickTile: handleClickTile,
    onClickQuestionDeck: handleDrawQuestionCard,
    onClickPropertyDeck: handleDrawPropertyCard,
    onClickChanceDeck: handleDrawChanceCard,
    onClickDice: handleRollDice,
    onClickVaultChest: () => setShowFinalReview(true),
  });
  sceneCallbacksRef.current = {
    onClickTile: handleClickTile,
    onClickQuestionDeck: handleDrawQuestionCard,
    onClickPropertyDeck: handleDrawPropertyCard,
    onClickChanceDeck: handleDrawChanceCard,
    onClickDice: handleRollDice,
    onClickVaultChest: () => setShowFinalReview(true),
  };

  // Mount Three.js Istanbul Scene STRICTLY ONCE (never recreates WebGL context on HUD state updates)
  useEffect(() => {
    if (!canvasMountRef.current) return;
    const ctrl = new IstanbulSceneController(canvasMountRef.current, {
      onClickTile: (idx) => sceneCallbacksRef.current.onClickTile(idx),
      onClickQuestionDeck: () => sceneCallbacksRef.current.onClickQuestionDeck(),
      onClickPropertyDeck: () => sceneCallbacksRef.current.onClickPropertyDeck(),
      onClickChanceDeck: () => sceneCallbacksRef.current.onClickChanceDeck(),
      onClickDice: () => sceneCallbacksRef.current.onClickDice(),
      onClickVaultChest: () => sceneCallbacksRef.current.onClickVaultChest(),
    });
    sceneRef.current = ctrl;
    ctrl.setTitleOrbitMode(stateRef.current.screen === 'title');

    return () => {
      ctrl.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync 3D Scene whenever screen, teams, turnPhase, or owned assets update
  useEffect(() => {
    const ctrl = sceneRef.current;
    if (!ctrl) return;
    ctrl.setTitleOrbitMode(gameState.screen === 'title');
    ctrl.setDeckHighlights(
      gameState.turnPhase === 'ready_to_draw_question',
      gameState.turnPhase === 'ready_to_draw_property',
      gameState.turnPhase === 'ready_to_draw_chance'
    );
    ctrl.syncTeams(
      gameState.teams,
      gameState.turnPhase === 'running_student'
    );

    const ownedPairs: { assetId: string; teamColorHex: string; teamIndex: number }[] = [];
    gameState.teams.forEach((team, tIdx) => {
      team.ownedAssetIds.forEach((assetId) => {
        ownedPairs.push({ assetId, teamColorHex: team.colorHex, teamIndex: tIdx });
      });
    });
    ctrl.syncPurchasedAssets(ownedPairs);
  }, [gameState.screen, gameState.teams, gameState.turnPhase]);

  // Keyboard shortcuts (Escape closes overlays or pauses game when in Part 2)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (appSection !== 'game') return;
      if (e.key === 'Escape') {
        if (showInventoryModal) setShowInventoryModal(false);
        else if (showTeacherPanel) setShowTeacherPanel(false);
        else if (showFinalReview) setShowFinalReview(false);
        else if (gameState.screen === 'playing') {
          setGameState((p) => ({ ...p, screen: 'paused' }));
        } else if (gameState.screen === 'paused') {
          setGameState((p) => ({ ...p, screen: 'playing' }));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [appSection, showInventoryModal, showTeacherPanel, showFinalReview, gameState.screen]);

  const activeTeam = useMemo(() => getActiveTeam(gameState), [gameState]);
  const activeQuestion = useMemo(
    () =>
      gameState.activeQuestionNumber !== null
        ? getQuestionByNumber(gameState.activeQuestionNumber) ?? null
        : null,
    [gameState.activeQuestionNumber]
  );
  const activeProperty = useMemo(
    () =>
      gameState.activePropertyAssetId
        ? PROPERTY_ASSETS.find((a) => a.id === gameState.activePropertyAssetId) ?? null
        : null,
    [gameState.activePropertyAssetId]
  );
  const activeChance = useMemo(
    () =>
      gameState.activeChanceCardId
        ? CHANCE_CARDS.find((c) => c.id === gameState.activeChanceCardId) ?? null
        : null,
    [gameState.activeChanceCardId]
  );
  const inspectedTile =
    gameState.inspectedTileIndex !== null ? BOARD_TILES[gameState.inspectedTileIndex] ?? null : null;

  // Game Handlers
  const handleStartGame = (setup: TeamSetupInput[]) => {
    clearDiceTimers();
    diceRollerRef.current.reset();
    const fresh = createInitialGameState(setup, true, false);
    setGameState(fresh);
    setShowInventoryModal(false);
    setShowTeacherPanel(false);
    setShowFinalReview(false);
    sceneRef.current?.resetCelebration();
    sceneRef.current?.focusOverview();
  };

  const handleSubmitQuestion = (selected: OptionLetter) => {
    if (!gameState.activeQuestionNumber) return;
    const next = submitQuestionAnswer(gameState, gameState.activeQuestionNumber, selected);
    const wasCorrect = next.lastQuestionOutcome?.correct ?? false;
    if (wasCorrect) {
      soundEngine.playCorrect();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'celebrate', 5000, false);
    } else {
      soundEngine.playWrong();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'sad', 5000, false);
    }
    setGameState(next);
  };

  const handleTimeoutQuestion = useCallback(() => {
    const cur = stateRef.current;
    if (!cur.activeQuestionNumber || cur.lastQuestionOutcome !== null) return;
    const active = getActiveTeam(cur);
    const next = timeoutQuestion(cur, cur.activeQuestionNumber);
    soundEngine.playWrong();
    sceneRef.current?.playCharacterReaction(active.id, 'sad', 5000, false);
    setGameState(next);
  }, []);

  const handleContinueAfterQuestion = () => {
    const cur = stateRef.current;
    const active = getActiveTeam(cur);
    const wasCorrect = cur.lastQuestionOutcome?.correct ?? false;
    const queuedBonusId = cur.activeChanceCardId;

    if (queuedBonusId) {
      const bonusCard = CHANCE_CARDS.find((c) => c.id === queuedBonusId);
      soundEngine.playCardFlip();
      sceneRef.current?.playCharacterReaction(active.id, 'surprised', 4200, false);
      setGameState((prev) => ({
        ...prev,
        activeQuestionNumber: null,
        lastQuestionOutcome: null,
        turnPhase: 'drawing_chance_card',
        bannerMessage: `ÖDÜL YA DA CEZA kartı açılıyor: ${bonusCard?.title ?? 'Sürpriz Kart'}...`,
      }));
      const revealBonus = () => {
        setGameState((prev) => ({
          ...prev,
          turnPhase: 'viewing_chance_card',
        }));
      };
      if (sceneRef.current) {
        sceneRef.current.animateCardDraw('chance', 'ÖDÜL YA DA CEZA', revealBonus);
      } else {
        revealBonus();
      }
      return;
    }

    // Focus character's dynamic 3D smile or sad expression clearly on the open board after closing the card
    sceneRef.current?.playCharacterReaction(
      active.id,
      wasCorrect ? 'celebrate' : 'sad',
      4200,
      true
    );
    setGameState((prev) => completeQuestionWithoutBonus(prev));
  };

  const handleSkipBonusCard = () => {
    sceneRef.current?.playCharacterReaction(activeTeam.id, 'celebrate', 3400, true);
    setGameState((prev) => skipBonusCardAfterQuestion(prev));
  };

  const handleResolveJail = (choice: 'pay' | 'wait') => {
    if (choice === 'pay') {
      soundEngine.playBankTransfer();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'surprised', 3400, true);
    } else {
      soundEngine.playJailTone();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'sad', 3800, true);
    }
    setGameState((prev) => resolveJailDecision(prev, choice));
  };

  const handlePurchaseProperty = () => {
    const next = purchaseActiveProperty(gameState);
    if (next.activePropertyAssetId === null) {
      soundEngine.playPurchase();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'celebrate', 4200, true);
    }
    setGameState(next);
  };

  const handleSkipProperty = () => {
    setGameState((prev) => skipActiveProperty(prev));
  };

  const handleApplyChance = () => {
    if (activeChance?.effectType === 'lose_bp' || activeChance?.kind === 'ceza') {
      soundEngine.playWrong();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'sad', 4400, true);
    } else if (activeChance?.effectType === 'gain_bp') {
      soundEngine.playRewardChime();
      sceneRef.current?.triggerBonusSparkle();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'celebrate', 4400, true);
    } else {
      soundEngine.playRewardChime();
      sceneRef.current?.triggerBonusSparkle();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'surprised', 4400, true);
    }
    setGameState((prev) => applyActiveChanceCard(prev));
  };

  const handleNextTeam = () => {
    const next = advanceToNextTeam(gameState);
    if (next.specialToast?.kind === 'jail') {
      soundEngine.playJailTone();
    }
    setGameState(next);
    sceneRef.current?.focusOverview();
  };

  const handleAnnounceWinner = () => {
    setGameState((prev) => ({ ...prev, screen: 'gameover' }));
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  // Teacher Panel Actions
  const handleTeacherSkipQuestion = () => {
    setGameState((prev) => {
      if (prev.questionDeckQueue.length <= 1) return prev;
      const [first, ...rest] = prev.questionDeckQueue;
      const rotated = [...rest, first];
      return {
        ...prev,
        questionDeckQueue: rotated,
        activeQuestionNumber:
          prev.activeQuestionNumber !== null ? rotated[0] : prev.activeQuestionNumber,
        bannerMessage: `Öğretmen soruyu atladı. Sıradaki kart: Soru ${rotated[0]}.`,
      };
    });
  };

  const handleTeacherPrevQuestion = () => {
    setGameState((prev) => {
      if (prev.questionDeckQueue.length <= 1) return prev;
      const last = prev.questionDeckQueue[prev.questionDeckQueue.length - 1];
      const rotated = [last, ...prev.questionDeckQueue.slice(0, -1)];
      return {
        ...prev,
        questionDeckQueue: rotated,
        activeQuestionNumber:
          prev.activeQuestionNumber !== null ? rotated[0] : prev.activeQuestionNumber,
        bannerMessage: `Öğretmen önceki soruya döndü: Soru ${rotated[0]}.`,
      };
    });
  };

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* Live Full-Viewport 3D Istanbul Diorama WebGL Canvas */}
      <div
        ref={canvasMountRef}
        data-testid="istanbul-3d-canvas"
        aria-label="SÖZOPLY 3D İstanbul Oyun Tahtası"
        className="fixed inset-0 w-full h-full"
      />

      {/* Part 1: 5. Sınıf Türkçe · Söz Sanatları Konu Anlatımı */}
      {appSection === 'lesson' && (
        <LessonSection onStartGameSection={() => setAppSection('game')} />
      )}

      {/* Part 2: SÖZOPLY 3D İstanbul Oyunu */}
      {appSection === 'game' && (
        <>
          {/* Part 2 — Screen 1: Title & 3-Team Setup */}
          {gameState.screen === 'title' && (
            <TeamSetupScreen
              onStartGame={handleStartGame}
              onOpenLesson={() => setAppSection('lesson')}
            />
          )}

          {/* Part 2 — Screen 2: Active Playing HUD */}
          {gameState.screen !== 'title' && (
            <TopHud
              teams={gameState.teams}
              activeTeamIndex={gameState.activeTeamIndex}
              questionsSolved={gameState.answeredQuestions.length}
              totalQuestions={QUESTION_CARDS.length}
              muted={muted}
              onToggleMute={handleToggleMute}
              onPause={() =>
                setGameState((p) => ({ ...p, screen: p.screen === 'paused' ? 'playing' : 'paused' }))
              }
              onResetCamera={() => sceneRef.current?.focusOverview()}
              onOpenLesson={() => setAppSection('lesson')}
            />
          )}

          {gameState.screen === 'playing' && (
        <BottomDock
          activeTeam={activeTeam}
          turnPhase={gameState.turnPhase}
          lastDiceValue={gameState.lastDiceValue}
          bannerMessage={gameState.bannerMessage}
          allQuestionsCompleted={areAllQuestionsCompleted(gameState)}
          onRollDice={handleRollDice}
          onDrawQuestionCard={handleDrawQuestionCard}
          onDrawPropertyCard={handleDrawPropertyCard}
          onDrawChanceCard={handleDrawChanceCard}
          onNextTeam={handleNextTeam}
          onOpenInventory={() => setShowInventoryModal(true)}
          onOpenTeacherPanel={() => setShowTeacherPanel(true)}
          onOpenFinalReview={() => setShowFinalReview(true)}
        />
      )}

      {/* Dice Result Reveal Banner (shown clearly BEFORE character starts slow FPS walk) */}
      {gameState.screen === 'playing' &&
        gameState.turnPhase === 'showing_dice_result' &&
        gameState.lastDiceValue !== null && (
          <DiceResultBanner diceValue={gameState.lastDiceValue} team={activeTeam} />
        )}

      {/* Minimal First-Person (FPS) Camera Indicator while character walks slowly along Istanbul track */}
      {gameState.screen === 'playing' &&
        gameState.turnPhase === 'running_student' &&
        gameState.lastDiceValue !== null && (
          <FpsCameraHudBadge
            team={activeTeam}
            currentStep={currentWalkStep}
            totalSteps={gameState.lastDiceValue}
          />
        )}

      {/* Floating Special Event Toast (+50 BP, +10 BP, HAPİS, BANKA) — hidden during active card modals */}
      {gameState.screen === 'playing' &&
        gameState.specialToast &&
        gameState.turnPhase !== 'jail_decision' &&
        !activeQuestion &&
        !activeProperty &&
        !activeChance && (
          <SpecialEventToastBanner
            toast={gameState.specialToast}
            onDismiss={() => setGameState((p) => ({ ...p, specialToast: null }))}
          />
        )}

      {/* Bekleme Karesi (50 TL Öde veya 1 Tur Bekle) */}
      {gameState.screen === 'playing' && gameState.turnPhase === 'jail_decision' && (
        <JailDecisionModal
          team={activeTeam}
          tileName={BOARD_TILES[activeTeam.position]?.name ?? 'Bekleme Karesi'}
          onPayBail={() => handleResolveJail('pay')}
          onWaitTurn={() => handleResolveJail('wait')}
        />
      )}

      {/* Inspected Istanbul Tile Info Card */}
      {gameState.screen === 'playing' && inspectedTile && (
        <LandmarkInfoCard
          tile={inspectedTile}
          onClose={() => setGameState((p) => ({ ...p, inspectedTileIndex: null }))}
        />
      )}

      {/* Interactive 20-Question Fiilde Çatı Card Modal with 20s Timer */}
      {gameState.screen === 'playing' &&
        (gameState.turnPhase === 'answering_question' || gameState.lastQuestionOutcome !== null) &&
        activeQuestion && (
          <QuestionCardModal
            question={activeQuestion}
            team={activeTeam}
            tileName={BOARD_TILES[activeTeam.position]?.name ?? 'İstanbul'}
            outcome={gameState.lastQuestionOutcome}
            onSubmitAnswer={handleSubmitQuestion}
            onTimeout={handleTimeoutQuestion}
            onContinue={handleContinueAfterQuestion}
            onSkipBonusCard={handleSkipBonusCard}
            isLastQuestion={areAllQuestionsCompleted(gameState)}
          />
        )}

      {/* Istanbul District Purchase Card Modal */}
      {gameState.screen === 'playing' &&
        gameState.turnPhase === 'viewing_property_card' &&
        activeProperty && (
          <PropertyCardModal
            asset={activeProperty}
            team={activeTeam}
            onPurchase={handlePurchaseProperty}
            onSkip={handleSkipProperty}
          />
        )}

      {/* Ödül ya da Ceza Card Modal */}
      {gameState.screen === 'playing' &&
        gameState.turnPhase === 'viewing_chance_card' &&
        activeChance && (
          <ChanceCardModal
            card={activeChance}
            team={activeTeam}
            onApply={handleApplyChance}
            onSkipDiscount={
              activeChance.effectType === 'property_discount' ? handleSkipBonusCard : undefined
            }
          />
        )}

      {/* Team Districts & Balance Modal */}
      {showInventoryModal && (
        <TeamInventoryModal
          teams={gameState.teams}
          onClose={() => setShowInventoryModal(false)}
        />
      )}

      {/* Teacher Control Panel */}
      {showTeacherPanel && (
        <TeacherPanelModal
          gameState={gameState}
          onOpenFinalReview={() => {
            setShowTeacherPanel(false);
            setShowFinalReview(true);
          }}
          onSwitchActiveTeam={(idx) =>
            setGameState((p) => ({
              ...p,
              activeTeamIndex: idx,
              turnPhase: 'ready_to_roll',
              activeQuestionNumber: null,
              activePropertyAssetId: null,
              lastQuestionOutcome: null,
              bannerMessage: `Öğretmen sırayı ${p.teams[idx].name} takımına verdi.`,
            }))
          }
          onAdjustBp={(idx, delta) => {
            soundEngine.playBankTransfer();
            setGameState((p) => ({
              ...p,
              teams: p.teams.map((t, i) =>
                i === idx ? { ...t, bp: Math.max(0, t.bp + delta) } : t
              ),
              bannerMessage: `Öğretmen ${p.teams[idx].name} kasasını ${delta > 0 ? '+' : ''}${delta} TL güncelledi.`,
            }));
          }}
          onClearJail={(idx) =>
            setGameState((p) => ({
              ...p,
              teams: p.teams.map((t, i) => (i === idx ? { ...t, jailTurnsRemaining: 0 } : t)),
              bannerMessage: `Öğretmen ${p.teams[idx].name} takımının bekleme turunu kaldırdı.`,
            }))
          }
          onSkipQuestion={handleTeacherSkipQuestion}
          onPrevQuestion={handleTeacherPrevQuestion}
          onRestartGame={() => {
            clearDiceTimers();
            setShowTeacherPanel(false);
            diceRollerRef.current.reset();
            sceneRef.current?.resetCelebration();
            setGameState(createInitialGameState(DEFAULT_TEAMS_SETUP, false, false));
          }}
          onClose={() => setShowTeacherPanel(false)}
        />
      )}

      {/* Son 5 Dakika: Söz Sanatları Değerlendirme Paneli */}
      {showFinalReview && (
        <EvidenceVaultModal
          answeredQuestions={gameState.answeredQuestions}
          teams={gameState.teams}
          onClose={() => setShowFinalReview(false)}
          onAnnounceWinner={handleAnnounceWinner}
        />
      )}

      {/* Pause Modal */}
      {gameState.screen === 'paused' && (
        <PauseModal
          onResume={() => setGameState((p) => ({ ...p, screen: 'playing' }))}
          onReturnToSetup={() => {
            clearDiceTimers();
            diceRollerRef.current.reset();
            sceneRef.current?.resetCelebration();
            setGameState(createInitialGameState(DEFAULT_TEAMS_SETUP, false, false));
          }}
        />
      )}

      {/* Official Victory Modal */}
      {gameState.screen === 'gameover' && (
        <VictoryModal
          teams={gameState.teams}
          allQuestionsCompleted={areAllQuestionsCompleted(gameState)}
          onRestart={() => {
            clearDiceTimers();
            diceRollerRef.current.reset();
            sceneRef.current?.resetCelebration();
            setGameState(createInitialGameState(DEFAULT_TEAMS_SETUP, false, false));
          }}
          onInspectBoard={() => setGameState((p) => ({ ...p, screen: 'playing' }))}
        />
      )}
        </>
      )}
    </main>
  );
}
