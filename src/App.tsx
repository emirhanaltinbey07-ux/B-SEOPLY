import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BankFinanceModal } from './components/BankFinanceModal';
import { BottomDock } from './components/BottomDock';
import { ChanceCardModal } from './components/ChanceCardModal';
import { EvidenceVaultModal } from './components/EvidenceVaultModal';
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
  FINAL_PHASE_THRESHOLD_SECONDS,
  PROPERTY_ASSETS,
  QUESTION_CARDS,
  TOTAL_GAME_SECONDS,
} from './game/data';
import {
  advanceToNextTeam,
  applyActiveChanceCard,
  createFairDiceRoller,
  createInitialGameState,
  drawPropertyCard,
  executePeerLoan,
  getActiveTeam,
  getQuestionByNumber,
  getRankedTeams,
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
  TeamSetupInput,
  timeoutQuestion,
  tradeAssetBetweenTeams,
} from './game/engine';
import { GameState, OptionLetter } from './game/types';
import { IstanbulSceneController } from './scene/IstanbulScene';
import { soundEngine } from './utils/sound';

function isAutostartEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(DEFAULT_TEAMS_SETUP, isAutostartEnabled(), false)
  );
  const [muted, setMuted] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [showFinalReview, setShowFinalReview] = useState(false);
  const [currentWalkStep, setCurrentWalkStep] = useState(0);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<IstanbulSceneController | null>(null);
  const diceRollerRef = useRef(createFairDiceRoller());
  const diceRevealTimerRef = useRef<number | null>(null);
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  useEffect(() => {
    return () => {
      if (diceRevealTimerRef.current !== null) {
        window.clearTimeout(diceRevealTimerRef.current);
      }
    };
  }, []);

  // Keep <body data-state="..."> synchronized for clear state inspection
  useEffect(() => {
    document.body.dataset.state = gameState.screen;
  }, [gameState.screen]);

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

  // 15:00 Lesson Countdown Timer
  useEffect(() => {
    if (gameState.screen !== 'playing' || gameState.timerPaused) return;
    const interval = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.screen !== 'playing' || prev.timerPaused) return prev;
        if (prev.remainingSeconds <= 1) {
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameState.screen, gameState.timerPaused]);

  // Trigger Final Evaluation when 15:00 timer hits 00:00
  useEffect(() => {
    if (gameState.screen === 'playing' && gameState.remainingSeconds === 0) {
      setShowFinalReview(true);
    }
  }, [gameState.screen, gameState.remainingSeconds]);

  // Action callbacks kept in refs for stable single-mount WebGL listener wiring
  const handleRollDice = useCallback(() => {
    const cur = stateRef.current;
    const activeTeam = getActiveTeam(cur);
    if (cur.screen !== 'playing' || cur.turnPhase !== 'ready_to_roll') return;
    if (activeTeam.jailTurnsRemaining > 0) return;

    const diceValue = diceRollerRef.current.roll();
    const startTile = activeTeam.position;
    const charName =
      CHARACTER_OPTIONS.find((c) => c.id === activeTeam.characterId)?.name ?? 'Etken';
    soundEngine.playDiceRoll();

    if (diceRevealTimerRef.current !== null) {
      window.clearTimeout(diceRevealTimerRef.current);
      diceRevealTimerRef.current = null;
    }

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
        bannerMessage: `${charName} (${activeTeam.name}) FPS kamerayla ${diceValue} adım yavaşça ilerliyor...`,
      }));

      const onArrival = () => {
        const latest = stateRef.current;
        const resolved = resolveDiceRoll(latest, diceValue);
        const landedTile = BOARD_TILES[resolved.teams[resolved.activeTeamIndex].position];

        if (resolved.specialToast?.kind === 'start_bonus') {
          soundEngine.playStartLapBonus();
          sceneRef.current?.triggerBonusSparkle();
        } else if (resolved.specialToast?.kind === 'reward') {
          soundEngine.playRewardChime();
          sceneRef.current?.triggerBonusSparkle();
        } else if (resolved.specialToast?.kind === 'jail') {
          soundEngine.playJailTone();
        }

        sceneRef.current?.focusTile(landedTile.index);
        setGameState(resolved);

        // If all 5 questions were already completed for this team and chance card triggered
        if (resolved.turnPhase === 'drawing_chance_card' && resolved.activeChanceCardId) {
          const chance = CHANCE_CARDS.find((c) => c.id === resolved.activeChanceCardId);
          soundEngine.playCardFlip();
          const showChanceModal = () => {
            setGameState((p) => ({ ...p, turnPhase: 'viewing_chance_card' }));
          };
          if (sceneRef.current) {
            sceneRef.current.animateCardDraw(
              'chance',
              chance?.title ?? 'ŞANS KARTI',
              showChanceModal
            );
          } else {
            showChanceModal();
          }
        }
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
      soundEngine.playRewardChime();
      setGameState((prev) => ({
        ...prev,
        turnPhase: 'showing_dice_result',
        lastDiceValue: diceValue,
        bannerMessage: `Zar sonucu: ${diceValue}! ${charName} birazdan FPS görünümüyle ${diceValue} adım ilerleyecek...`,
      }));

      const pauseMs = sceneRef.current?.isSoftwareGl ? 750 : 1400;
      diceRevealTimerRef.current = window.setTimeout(() => {
        diceRevealTimerRef.current = null;
        startSlowFpsWalk();
      }, pauseMs);
    };

    if (sceneRef.current) {
      sceneRef.current.animateDiceRoll(diceValue, revealDiceResultThenWalk);
    } else {
      revealDiceResultThenWalk();
    }
  }, []);

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
      bannerMessage: 'EMLAK KARTLARI destesinden gayrimenkul tapusu çekiliyor...',
    }));

    const revealProperty = () => {
      setGameState((prev) => drawPropertyCard(prev));
    };

    if (sceneRef.current) {
      sceneRef.current.animateCardDraw('property', 'EMLAK KARTI', revealProperty);
    } else {
      revealProperty();
    }
  }, []);

  const handleClickTile = useCallback((tileIndex: number) => {
    sceneRef.current?.focusTile(tileIndex);
    setGameState((prev) => ({ ...prev, inspectedTileIndex: tileIndex }));
  }, []);

  const handleOpenBank = useCallback(() => {
    sceneRef.current?.focusBank();
    setShowBankModal(true);
  }, []);

  const sceneCallbacksRef = useRef({
    onClickTile: handleClickTile,
    onClickQuestionDeck: handleDrawQuestionCard,
    onClickPropertyDeck: handleDrawPropertyCard,
    onClickDice: handleRollDice,
    onClickBank: handleOpenBank,
    onClickVaultChest: () => setShowFinalReview(true),
  });
  sceneCallbacksRef.current = {
    onClickTile: handleClickTile,
    onClickQuestionDeck: handleDrawQuestionCard,
    onClickPropertyDeck: handleDrawPropertyCard,
    onClickDice: handleRollDice,
    onClickBank: handleOpenBank,
    onClickVaultChest: () => setShowFinalReview(true),
  };

  // Mount Three.js Istanbul Scene STRICTLY ONCE (never recreates WebGL context on HUD state updates)
  useEffect(() => {
    if (!canvasMountRef.current) return;
    const ctrl = new IstanbulSceneController(canvasMountRef.current, {
      onClickTile: (idx) => sceneCallbacksRef.current.onClickTile(idx),
      onClickQuestionDeck: () => sceneCallbacksRef.current.onClickQuestionDeck(),
      onClickPropertyDeck: () => sceneCallbacksRef.current.onClickPropertyDeck(),
      onClickDice: () => sceneCallbacksRef.current.onClickDice(),
      onClickBank: () => sceneCallbacksRef.current.onClickBank(),
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
      gameState.turnPhase === 'ready_to_draw_property'
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

  // Keyboard shortcuts (Escape closes overlays or pauses game)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBankModal) setShowBankModal(false);
        else if (showInventoryModal) setShowInventoryModal(false);
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
  }, [showBankModal, showInventoryModal, showTeacherPanel, showFinalReview, gameState.screen]);

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
    diceRollerRef.current.reset();
    const fresh = createInitialGameState(setup, true, false);
    setGameState(fresh);
    setShowBankModal(false);
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
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'celebrate');
    } else {
      soundEngine.playWrong();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'sad');
    }
    setGameState(next);
  };

  const handleTimeoutQuestion = useCallback(() => {
    const cur = stateRef.current;
    if (!cur.activeQuestionNumber || cur.lastQuestionOutcome !== null) return;
    const active = getActiveTeam(cur);
    const next = timeoutQuestion(cur, cur.activeQuestionNumber);
    soundEngine.playWrong();
    sceneRef.current?.playCharacterReaction(active.id, 'sad');
    setGameState(next);
  }, []);

  const handleContinueAfterQuestion = () => {
    const cur = stateRef.current;
    const queuedBonusId = cur.activeChanceCardId;

    if (queuedBonusId) {
      const bonusCard = CHANCE_CARDS.find((c) => c.id === queuedBonusId);
      soundEngine.playCardFlip();
      setGameState((prev) => ({
        ...prev,
        activeQuestionNumber: null,
        lastQuestionOutcome: null,
        turnPhase: 'drawing_chance_card',
        bannerMessage: `Bonus / İndirim / Ceza Kartı açılıyor: ${bonusCard?.title ?? 'Sürpriz Kart'}...`,
      }));
      const revealBonus = () => {
        setGameState((prev) => ({
          ...prev,
          turnPhase: 'viewing_chance_card',
        }));
      };
      if (sceneRef.current) {
        sceneRef.current.animateCardDraw('chance', 'BONUS & İNDİRİM', revealBonus);
      } else {
        revealBonus();
      }
      return;
    }

    // Wrong answer or timeout: NO bonus card, finish turn cleanly!
    setGameState((prev) => ({
      ...prev,
      activeQuestionNumber: null,
      lastQuestionOutcome: null,
      activeChanceCardId: null,
      pendingPropertyDrawAfterBonus: false,
      turnPhase: 'turn_complete',
    }));
  };

  const handleSkipBonusCard = () => {
    setGameState((prev) => skipBonusCardAfterQuestion(prev));
  };

  const handleResolveJail = (choice: 'pay' | 'wait') => {
    if (choice === 'pay') {
      soundEngine.playBankTransfer();
    } else {
      soundEngine.playJailTone();
    }
    setGameState((prev) => resolveJailDecision(prev, choice));
  };

  const handlePurchaseProperty = () => {
    const next = purchaseActiveProperty(gameState);
    if (next.activePropertyAssetId === null) {
      soundEngine.playPurchase();
    }
    setGameState(next);
  };

  const handleSkipProperty = () => {
    setGameState((prev) => skipActiveProperty(prev));
  };

  const handleApplyChance = () => {
    if (activeChance?.effectType === 'lose_bp' || activeChance?.kind === 'ceza') {
      soundEngine.playWrong();
      sceneRef.current?.playCharacterReaction(activeTeam.id, 'sad');
    } else {
      soundEngine.playRewardChime();
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
    const champion = getRankedTeams(gameState.teams)[0];
    setShowFinalReview(false);
    setShowTeacherPanel(false);
    setShowBankModal(false);
    setShowInventoryModal(false);
    soundEngine.playVictoryFanfare();
    sceneRef.current?.triggerCelebrationFireworks(champion?.name ?? 'ŞAMPİYON', champion?.colorHex);
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
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* Live Full-Viewport 3D Istanbul Diorama WebGL Canvas */}
      <div
        ref={canvasMountRef}
        data-testid="istanbul-3d-canvas"
        aria-label="BİSEOPLY 3D İstanbul Oyun Tahtası"
        className="fixed inset-0 w-full h-full"
      />

      {/* Screen 1: Title & 3-Team Setup */}
      {gameState.screen === 'title' && <TeamSetupScreen onStartGame={handleStartGame} />}

      {/* Screen 2: Active Playing HUD */}
      {gameState.screen !== 'title' && (
        <TopHud
          teams={gameState.teams}
          activeTeamIndex={gameState.activeTeamIndex}
          remainingSeconds={gameState.remainingSeconds}
          questionsSolved={gameState.answeredQuestions.length}
          totalQuestions={QUESTION_CARDS.length}
          muted={muted}
          onToggleMute={handleToggleMute}
          onPause={() =>
            setGameState((p) => ({ ...p, screen: p.screen === 'paused' ? 'playing' : 'paused' }))
          }
          onResetCamera={() => sceneRef.current?.focusOverview()}
        />
      )}

      {gameState.screen === 'playing' && (
        <BottomDock
          activeTeam={activeTeam}
          turnPhase={gameState.turnPhase}
          lastDiceValue={gameState.lastDiceValue}
          bannerMessage={gameState.bannerMessage}
          isFinalPhase={gameState.remainingSeconds <= FINAL_PHASE_THRESHOLD_SECONDS}
          onRollDice={handleRollDice}
          onDrawQuestionCard={handleDrawQuestionCard}
          onDrawPropertyCard={handleDrawPropertyCard}
          onNextTeam={handleNextTeam}
          onOpenBank={handleOpenBank}
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

      {/* Jail Bail (50 BP) vs 1-Turn Wait Decision Modal */}
      {gameState.screen === 'playing' && gameState.turnPhase === 'jail_decision' && (
        <JailDecisionModal
          team={activeTeam}
          tileName={BOARD_TILES[activeTeam.position]?.name ?? 'Hapis Karesi'}
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
          />
        )}

      {/* Real Estate Purchase Card Modal (Vehicles Removed) */}
      {gameState.screen === 'playing' &&
        gameState.turnPhase === 'viewing_property_card' &&
        activeProperty &&
        !showBankModal && (
          <PropertyCardModal
            asset={activeProperty}
            team={activeTeam}
            onPurchase={handlePurchaseProperty}
            onSkip={handleSkipProperty}
            onOpenBankForFunds={handleOpenBank}
          />
        )}

      {/* Post-Question Bonus, Discount & Penalty Card Modal (Only on correct answers) */}
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

      {/* Bank, Loans & Real Estate Trade Modal */}
      {showBankModal && (
        <BankFinanceModal
          teams={gameState.teams}
          activeTeamIndex={gameState.activeTeamIndex}
          peerLoans={gameState.peerLoans}
          financeLog={gameState.financeLog}
          onTakeBankLoan={(idx) => {
            soundEngine.playBankTransfer();
            setGameState((p) => takeBankLoan(p, idx));
          }}
          onRepayBankLoan={(idx) => {
            soundEngine.playBankTransfer();
            setGameState((p) => repayBankLoan(p, idx));
          }}
          onExecutePeerLoan={(lender, borrower, principal, repay) => {
            soundEngine.playBankTransfer();
            setGameState((p) => executePeerLoan(p, lender, borrower, principal, repay));
          }}
          onRepayPeerLoan={(loanId) => {
            soundEngine.playBankTransfer();
            setGameState((p) => repayPeerLoan(p, loanId));
          }}
          onSellToBank={(sellerIdx, assetId) => {
            soundEngine.playBankTransfer();
            setGameState((p) => sellAssetToBank(p, sellerIdx, assetId));
          }}
          onTradeBetweenTeams={(sellerIdx, buyerIdx, assetId, price) => {
            soundEngine.playPurchase();
            setGameState((p) => tradeAssetBetweenTeams(p, sellerIdx, buyerIdx, assetId, price));
          }}
          onClose={() => setShowBankModal(false)}
        />
      )}

      {/* Team Inventory Modal */}
      {showInventoryModal && (
        <TeamInventoryModal
          teams={gameState.teams}
          peerLoans={gameState.peerLoans}
          onClose={() => setShowInventoryModal(false)}
        />
      )}

      {/* Teacher Control Panel */}
      {showTeacherPanel && (
        <TeacherPanelModal
          gameState={gameState}
          onToggleTimerPause={() =>
            setGameState((p) => ({ ...p, timerPaused: !p.timerPaused }))
          }
          onResetTimer={() =>
            setGameState((p) => ({ ...p, remainingSeconds: TOTAL_GAME_SECONDS, timerPaused: false }))
          }
          onJumpToFinal5Min={() => {
            setGameState((p) => ({ ...p, remainingSeconds: FINAL_PHASE_THRESHOLD_SECONDS }));
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
              bannerMessage: `Öğretmen ${p.teams[idx].name} bakiyesini ${delta > 0 ? '+' : ''}${delta} BP güncelledi.`,
            }));
          }}
          onClearJail={(idx) =>
            setGameState((p) => ({
              ...p,
              teams: p.teams.map((t, i) => (i === idx ? { ...t, jailTurnsRemaining: 0 } : t)),
              bannerMessage: `Öğretmen ${p.teams[idx].name} takımının hapis cezasını kaldırdı.`,
            }))
          }
          onSkipQuestion={handleTeacherSkipQuestion}
          onPrevQuestion={handleTeacherPrevQuestion}
          onRestartGame={() => {
            setShowTeacherPanel(false);
            diceRollerRef.current.reset();
            sceneRef.current?.resetCelebration();
            setGameState(createInitialGameState(DEFAULT_TEAMS_SETUP, false, false));
          }}
          onClose={() => setShowTeacherPanel(false)}
        />
      )}

      {/* Son 5 Dakika: Fiilde Çatı Değerlendirme Paneli */}
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
          onRestart={() => {
            diceRollerRef.current.reset();
            sceneRef.current?.resetCelebration();
            setGameState(createInitialGameState(DEFAULT_TEAMS_SETUP, false, false));
          }}
          onInspectBoard={() => setGameState((p) => ({ ...p, screen: 'playing' }))}
        />
      )}
    </main>
  );
}
