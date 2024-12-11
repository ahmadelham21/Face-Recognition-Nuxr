<template>
  <div>
    <video ref="video" autoplay playsinline muted></video>
    <canvas ref="canvas"></canvas>
    <div class="status">
      <p>
        Senyum terdeteksi selama: {{ state.smileDuration.toFixed(2) }} detik
      </p>
      <p>Liveness: {{ Liveness ? "Terverifikasi" : "Belum Terverifikasi" }}</p>
      <p>Gerakan wajah: {{ state.faceMovement }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

const video = ref(null);
const canvas = ref(null);

const state = reactive({
  smileDuration: 0,
  isSmiling: false,
  smileStartTime: null,
  Liveness: false,
  faceMovement: "Tidak ada",
  previousNosePosition: null,
  blinkStartTime: null,
  isBlinking: false,
});

const checkLiveness = () => {
  if (state.smileDuration > 2) {
    state.Liveness = true;
  }
};

const detectLandmarks = async (detector, videoElement, context) => {
  if (!detector) {
    console.error("Detector is not initialized.");
    return;
  }

  try {
    const faces = await detector.estimateFaces(videoElement, {
      flipHorizontal: false,
    });

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    faces.forEach((face) => {
      face.keypoints.forEach((keypoint) => {
        const [x, y] = [keypoint.x, keypoint.y];
        context.beginPath();
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fillStyle = "red";
        context.fill();
      });

      // Deteksi senyuman
      const mouthTop = face.keypoints[13];
      const mouthBottom = face.keypoints[14];
      const mouthDistance = Math.abs(mouthBottom.y - mouthTop.y);
      const isCurrentlySmiling = mouthDistance > 8;

      if (isCurrentlySmiling) {
        if (!state.isSmiling) {
          state.isSmiling = true;
          state.smileStartTime = Date.now();
        } else {
          state.smileDuration = (Date.now() - state.smileStartTime) / 1000;
        }
      } else {
        state.isSmiling = false;
        state.smileStartTime = null;
        state.smileDuration = 0;
      }

      // Deteksi mengangguk dan menoleh
      const nose = face.keypoints[1]; // Landmark hidung
      if (state.previousNosePosition) {
        const deltaY = nose.y - state.previousNosePosition.y;
        const deltaX = nose.x - state.previousNosePosition.x;

        if (deltaY > 5) {
          state.faceMovement = "Mengangguk";
        } else if (deltaX > 5) {
          state.faceMovement = "Menoleh ke kanan";
        } else if (deltaX < -5) {
          state.faceMovement = "Menoleh ke kiri";
        } else {
          state.faceMovement = "Tidak ada";
        }
      }
      state.previousNosePosition = nose;

      // Deteksi berkedip
      const leftEyeTop = face.keypoints[159];
      const leftEyeBottom = face.keypoints[145];
      const leftEyeDistance = Math.abs(leftEyeBottom.y - leftEyeTop.y);

      const isBlinkingNow = leftEyeDistance < 2;

      if (isBlinkingNow) {
        if (!state.isBlinking) {
          state.isBlinking = true;
          state.blinkStartTime = Date.now();
          state.faceMovement = "Berkedip";
        }
      } else {
        state.isBlinking = false;
      }
    });

    checkLiveness();
  } catch (error) {
    console.error("Error detecting landmarks:", error);
  }

  requestAnimationFrame(() => detectLandmarks(detector, videoElement, context));
};

onMounted(async () => {
  const videoElement = video.value;
  const canvasElement = canvas.value;
  const context = canvasElement.getContext("2d");

  const { $detector } = useNuxtApp();
  const detector = $detector;

  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    videoElement.srcObject = stream;

    videoElement.addEventListener("loadeddata", async () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      detectLandmarks(detector, videoElement, context);
    });
  });
});
</script>

<style scoped>
video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.status {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
}
</style>
