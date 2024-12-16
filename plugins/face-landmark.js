import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import { FaceMesh } from "@mediapipe/face_mesh";

export default defineNuxtPlugin(async () => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "mediapipe", // Pilih 'mediapipe' atau 'tfjs'
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh", // Path solusi
  };

  const detector = await faceLandmarksDetection.createDetector(
    model,
    detectorConfig
  );

  return {
    provide: {
      detector: detector,
    },
  };
});
