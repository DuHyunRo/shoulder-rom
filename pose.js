/**
 * MediaPipe pose detection — init and rAF loop.
 *
 * Landmark indices used:
 *   11 = left shoulder   12 = right shoulder
 *   13 = left elbow      14 = right elbow
 *   23 = left hip        24 = right hip
 *
 * Pinned to @mediapipe/tasks-vision@0.10.14 — do NOT use @latest
 * in case a breaking API change lands between build and demo day.
 */

import { PoseLandmarker, FilesetResolver } from
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

import { computeShoulderAngle } from './angles.js';
import { updateArc }            from './arc.js';
import { drawOverlay }          from './overlay.js';

const LM = { LS: 11, RS: 12, LE: 13, RE: 14, LH: 23, RH: 24 };
const MIN_VISIBILITY = 0.5;

let rafId = null;

/**
 * Initialize MediaPipe and start the detection loop.
 *
 * @param {HTMLVideoElement}    video
 * @param {HTMLCanvasElement}   canvas
 * @param {object}              callbacks
 * @param {function}            callbacks.onReady  — called when model is loaded
 * @param {function}            callbacks.onFrame  — (left, right) per frame
 * @param {function}            callbacks.onError  — (err) if init fails
 */
export async function initPose(video, canvas, { onReady, onFrame, onError }) {
  let landmarker;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses:    1,
    });
  } catch (err) {
    onError(err);
    return;
  }

  onReady();
  runLoop(video, canvas, landmarker, onFrame);
}

function runLoop(video, canvas, landmarker, onFrame) {
  const ctx = canvas.getContext('2d');
  let lastTs = -1;

  function tick(ts) {
    rafId = requestAnimationFrame(tick);

    // Video not ready yet
    if (video.readyState < 2) return;

    // Keep canvas in sync with video intrinsic resolution
    // (must use videoWidth/videoHeight, not offsetWidth — avoids HiDPI misalignment)
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width        = video.videoWidth;
      canvas.height       = video.videoHeight;
      canvas.style.width  = video.clientWidth  + 'px';
      canvas.style.height = video.clientHeight + 'px';
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // detectForVideo requires monotonically increasing timestamps
    if (ts <= lastTs) return;
    lastTs = ts;

    const results = landmarker.detectForVideo(video, ts);
    const lms     = results.landmarks;

    if (!lms || lms.length === 0) {
      drawOverlay(ctx, canvas, null, null);
      onFrame(null, null);
      return;
    }

    const lm    = lms[0];
    const left  = extractSide(lm, LM.LH, LM.LS, LM.LE);
    const right = extractSide(lm, LM.RH, LM.RS, LM.RE);

    if (left)  updateArc('left',  left.angle,  left.visibility);
    if (right) updateArc('right', right.angle, right.visibility);

    drawOverlay(ctx, canvas, left, right);
    onFrame(left, right);
  }

  rafId = requestAnimationFrame(tick);
}

function extractSide(lm, hipIdx, shoulderIdx, elbowIdx) {
  const hip      = lm[hipIdx];
  const shoulder = lm[shoulderIdx];
  const elbow    = lm[elbowIdx];

  if (!hip || !shoulder || !elbow) return null;

  const minVis = Math.min(
    hip.visibility      ?? 0,
    shoulder.visibility ?? 0,
    elbow.visibility    ?? 0,
  );
  if (minVis < MIN_VISIBILITY) return null;

  return {
    angle:      computeShoulderAngle(hip, shoulder, elbow),
    visibility: minVis,
    shoulder,
    elbow,
    hip,
  };
}

export function stopPose() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
