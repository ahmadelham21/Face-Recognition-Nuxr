// import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// // Register one of the TF.js backends.
// import "@tensorflow/tfjs-backend-webgl";
// // import '@tensorflow/tfjs-backend-wasm';
// export default defineNuxtPlugin(async () => {
//   const model = poseDetection.SupportedModels.MoveNet;
//   const detectorConfig = {
//     runtime: "tfjs", // Pilih 'mediapipe' atau 'tfjs'
//     // Path solusi
//   };
//   const poseDetector = await poseDetection.createDetector(
//     model,
//     detectorConfig
//   );

//   return {
//     provide: {
//       poseDetector: poseDetector,
//     },
//   };
// });
