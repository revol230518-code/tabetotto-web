
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let isInitializing = false;

// 現在の動作モードを保持する変数
let currentRunningMode: "IMAGE" | "VIDEO" = "IMAGE";

export const initPoseLandmarker = async () => {
  if (poseLandmarker) return poseLandmarker;
  if (isInitializing) {
    // Wait for existing initialization to finish
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
      if (poseLandmarker) return poseLandmarker;
    }
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU"
      },
      runningMode: "IMAGE",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    return poseLandmarker;
  } catch (error) {
    console.error("Failed to load PoseLandmarker:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const detectPose = async (image: HTMLImageElement | HTMLVideoElement, runningMode: "IMAGE" | "VIDEO" = "IMAGE") => {
  try {
    const landmarker = await initPoseLandmarker();
    if (!landmarker) throw new Error("Landmarker not ready");
    
    // 現在のモードと異なる場合のみオプションを更新
    if (currentRunningMode !== runningMode) {
      await landmarker.setOptions({ runningMode: runningMode });
      currentRunningMode = runningMode;
    }

    if (runningMode === "VIDEO") {
      const startTimeMs = performance.now();
      return landmarker.detectForVideo(image as HTMLVideoElement, startTimeMs);
    } else {
      return landmarker.detect(image as HTMLImageElement);
    }
  } catch (e) {
    console.warn("Pose detection skipped due to error:", e);
    return null;
  }
};

export const drawPoseOnCanvas = (
  ctx: CanvasRenderingContext2D, 
  landmarks: any[], 
  width: number, 
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks || landmarks.length === 0) return;

  const points = landmarks[0];
  const connections = [
    [11, 12], [11, 23], [12, 24], [23, 24],
    [11, 13], [13, 15], [12, 14], [14, 16],
    [23, 25], [25, 27], [24, 26], [26, 28],
    [0, 11], [0, 12],
  ];

  const getCoord = (index: number) => ({
    x: points[index].x * width,
    y: points[index].y * height,
    visibility: points[index].visibility
  });

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"; 

  connections.forEach(([start, end]) => {
    const p1 = getCoord(start);
    const p2 = getCoord(end);
    if ((p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });

  const importantIndices = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  importantIndices.forEach(idx => {
    const p = getCoord(idx);
    if ((p.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = idx === 0 ? "#FFAD60" : idx >= 23 ? "#88D8B0" : "#FF9F9F";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  });
};
