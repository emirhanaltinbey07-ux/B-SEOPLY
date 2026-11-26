import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDiceCameraTimings,
  getExpressionForAnimMode,
  getFacialExpressionPose,
} from './characterExpressions';

test('maps every character animation mode to its intended facial expression', () => {
  assert.equal(getExpressionForAnimMode('celebrate'), 'smile');
  assert.equal(getExpressionForAnimMode('sad'), 'sad');
  assert.equal(getExpressionForAnimMode('surprised'), 'surprised');
  assert.equal(getExpressionForAnimMode('idle'), 'neutral');
  assert.equal(getExpressionForAnimMode('run'), 'neutral');
  assert.equal(getExpressionForAnimMode('jail'), 'neutral');
});

test('produces clearly distinct facial geometry parameters for smile, sad, and surprised', () => {
  const neutral = getFacialExpressionPose('neutral', 1.0);
  const smile = getFacialExpressionPose('smile', 1.0);
  const sad = getFacialExpressionPose('sad', 1.0);
  const surprised = getFacialExpressionPose('surprised', 1.0);

  assert.equal(neutral.mouthShape, 'neutral');
  assert.equal(smile.mouthShape, 'smile');
  assert.equal(sad.mouthShape, 'sad');
  assert.equal(surprised.mouthShape, 'surprised');

  // Surprised opens eyes widest and lifts brows highest
  assert.ok(surprised.eyeScaleY > neutral.eyeScaleY);
  assert.ok(surprised.browOffsetY > smile.browOffsetY);
  assert.ok(surprised.pupilScale < neutral.pupilScale);

  // Sad lowers eyes & pupils and tilts brows inward (left negative, right positive)
  assert.ok(sad.eyeScaleY < neutral.eyeScaleY);
  assert.ok(sad.pupilOffsetY < 0);
  assert.ok(sad.leftBrowRotZ < 0 && sad.rightBrowRotZ > 0);
  assert.ok(sad.browOffsetY < 0);

  // Smile elevates brows & intensifies cheek blush
  assert.ok(smile.browOffsetY > 0);
  assert.ok(smile.blushOpacity > neutral.blushOpacity);
  assert.ok(smile.leftBrowRotZ > 0 && smile.rightBrowRotZ < 0);
});

test('neutral pose performs periodic natural blinking near end of 3.6s cycle', () => {
  const openPose = getFacialExpressionPose('neutral', 1.2);
  const blinkPose = getFacialExpressionPose('neutral', 3.51);
  assert.equal(openPose.eyeScaleY, 1.0);
  assert.ok(blinkPose.eyeScaleY < 0.35, `Expected blinked eyeScaleY < 0.35, got ${blinkPose.eyeScaleY}`);
});

test('dice camera timings define positive durations for all 3 camera stages on both GPU and software GL', () => {
  const gpu = getDiceCameraTimings(false);
  const sw = getDiceCameraTimings(true);

  for (const cfg of [gpu, sw]) {
    assert.ok(cfg.diceRollMs > 0);
    assert.ok(cfg.diceHoldMs > 0);
    assert.ok(cfg.boardOverviewMs > 0);
    assert.ok(cfg.fpsBlendMs > 0);
    assert.ok(cfg.stepDurationMs > 0);
  }
  assert.ok(sw.diceRollMs < gpu.diceRollMs);
  assert.ok(sw.boardOverviewMs < gpu.boardOverviewMs);
});
