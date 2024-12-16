export default defineNuxtPlugin(async () => {
  if (process.client) {
    const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
    const tf = await import('@tensorflow/tfjs-core');
    await import('@tensorflow/tfjs-backend-webgl');

    try {
      await tf.setBackend('webgl');
      await tf.ready();

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh"
      };

      const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);

      return {
        provide: {
          detector: detector,
        },
      };
    } catch (error) {
      console.error('Face detection model loading error:', error);
    }
  }
});
