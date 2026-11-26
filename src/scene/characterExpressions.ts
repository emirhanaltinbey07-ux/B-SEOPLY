export type CharacterExpression = 'neutral' | 'smile' | 'sad' | 'surprised';

export type CharacterAnimMode = 'idle' | 'run' | 'celebrate' | 'sad' | 'surprised' | 'jail';

export type CharacterReactionMode = 'celebrate' | 'sad' | 'surprised';

export interface FacialExpressionPose {
  expression: CharacterExpression;
  eyeScaleX: number;
  eyeScaleY: number;
  pupilScale: number;
  pupilOffsetY: number;
  browOffsetY: number;
  leftBrowRotZ: number;
  rightBrowRotZ: number;
  blushScale: number;
  blushOpacity: number;
  mouthShape: CharacterExpression;
  mouthScaleX: number;
  mouthScaleY: number;
}

export interface DiceCameraTimings {
  diceRollMs: number;
  diceHoldMs: number;
  boardOverviewMs: number;
  fpsBlendMs: number;
  stepDurationMs: number;
}

export function getExpressionForAnimMode(mode: CharacterAnimMode): CharacterExpression {
  if (mode === 'celebrate') return 'smile';
  if (mode === 'sad') return 'sad';
  if (mode === 'surprised') return 'surprised';
  return 'neutral';
}

export function getDiceCameraTimings(isSoftwareGl: boolean): DiceCameraTimings {
  if (isSoftwareGl) {
    return {
      diceRollMs: 520,
      diceHoldMs: 560,
      boardOverviewMs: 720,
      fpsBlendMs: 280,
      stepDurationMs: 420,
    };
  }
  return {
    diceRollMs: 920,
    diceHoldMs: 880,
    boardOverviewMs: 1150,
    fpsBlendMs: 550,
    stepDurationMs: 1050,
  };
}

/**
 * Pure procedural facial pose evaluator for dynamic 3D expressions:
 * - smile (gülümseme): joyful eyes, raised brows, bright cheeks, open cheering smile
 * - sad (üzülme): downcast eyes, worried inward-tilted brows, deep inverted frown
 * - surprised (şaşırma): wide-open eyes, high arched brows, round 'O' gasp mouth
 * - neutral: calm resting expression with periodic natural eye blinking
 */
export function getFacialExpressionPose(
  expression: CharacterExpression,
  phase: number
): FacialExpressionPose {
  const safePhase = Number.isFinite(phase) ? phase : 0;

  if (expression === 'smile') {
    const cheerPulse = 0.5 + 0.5 * Math.sin(safePhase * 9.5);
    return {
      expression: 'smile',
      eyeScaleX: 1.08,
      eyeScaleY: 0.78 + cheerPulse * 0.14,
      pupilScale: 1.06,
      pupilOffsetY: 0.008,
      browOffsetY: 0.026 + cheerPulse * 0.012,
      leftBrowRotZ: 0.16,
      rightBrowRotZ: -0.16,
      blushScale: 1.32,
      blushOpacity: 0.85,
      mouthShape: 'smile',
      mouthScaleX: 1.02 + cheerPulse * 0.14,
      mouthScaleY: 0.96 + cheerPulse * 0.18,
    };
  }

  if (expression === 'sad') {
    const sighWave = 0.5 + 0.5 * Math.sin(safePhase * 4.2);
    return {
      expression: 'sad',
      eyeScaleX: 0.94,
      eyeScaleY: 0.64 + sighWave * 0.08,
      pupilScale: 0.92,
      pupilOffsetY: -0.016,
      browOffsetY: -0.014 - sighWave * 0.008,
      leftBrowRotZ: -0.34,
      rightBrowRotZ: 0.34,
      blushScale: 0.75,
      blushOpacity: 0.18,
      mouthShape: 'sad',
      mouthScaleX: 0.98 + sighWave * 0.08,
      mouthScaleY: 1.0 + sighWave * 0.12,
    };
  }

  if (expression === 'surprised') {
    const gaspPulse = 0.5 + 0.5 * Math.sin(safePhase * 10.5);
    return {
      expression: 'surprised',
      eyeScaleX: 1.24,
      eyeScaleY: 1.32 + gaspPulse * 0.08,
      pupilScale: 0.78,
      pupilOffsetY: 0.004,
      browOffsetY: 0.052 + gaspPulse * 0.012,
      leftBrowRotZ: 0.24,
      rightBrowRotZ: -0.24,
      blushScale: 1.15,
      blushOpacity: 0.62,
      mouthShape: 'surprised',
      mouthScaleX: 0.95 + gaspPulse * 0.16,
      mouthScaleY: 1.02 + gaspPulse * 0.22,
    };
  }

  // Neutral expression with periodic natural blinking (~every 3.6 seconds)
  const blinkCycle = ((safePhase % 3.6) + 3.6) % 3.6;
  let blinkFactor = 1;
  if (blinkCycle > 3.42) {
    const t = (blinkCycle - 3.42) / 0.18; // 0..1
    blinkFactor = Math.max(0.12, Math.abs(Math.cos(t * Math.PI)));
  }

  return {
    expression: 'neutral',
    eyeScaleX: 1.0,
    eyeScaleY: 1.0 * blinkFactor,
    pupilScale: 1.0,
    pupilOffsetY: 0,
    browOffsetY: 0,
    leftBrowRotZ: 0.08,
    rightBrowRotZ: -0.08,
    blushScale: 1.0,
    blushOpacity: 0.42,
    mouthShape: 'neutral',
    mouthScaleX: 1.0,
    mouthScaleY: 1.0,
  };
}
