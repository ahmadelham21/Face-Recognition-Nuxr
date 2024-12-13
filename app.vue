<template>
  <div>
    <button class="click-button" v-on:click="calibrate">Kalibrasi</button>

    <video ref="video" autoplay playsinline muted></video>
    <canvas ref="canvas"></canvas>

    <div class="status">
      <!-- <p>
        Senyum terdeteksi selama: {{ state.smileDuration.toFixed(2) }} detik
      </p> -->
      <!-- <p>Liveness: {{ Liveness ? "Terverifikasi" : "Belum Terverifikasi" }}</p> -->
      <Indicator text="kalibrasi" :expression="state.setNeutral"></Indicator>
      <Indicator
        text="posisi tengah"
        :expression="state.expression.posisiTengah"
      ></Indicator>
      <Indicator
        text="tersenyum"
        :expression="state.expression.tersenyum"
      ></Indicator>
      <Indicator
        text="berkedip"
        :expression="state.expression.berkedip"
      ></Indicator>
      <Indicator
        text="posisi kanan"
        :expression="state.expression.posisiKanan"
      ></Indicator>
      <Indicator
        text="posisi kiri"
        :expression="state.expression.posisiKiri"
      ></Indicator>
      <!-- <p>position: {{ state.position }}</p> -->
    </div>
    <!-- Garis Tengah -->
    <!-- <div class="center-line vertical"></div>
    <div class="center-line horizontal"></div> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import Indicator from "./components/indicator.vue";

const video = ref(null);
const canvas = ref(null);

const state = reactive({
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  expression: {
    posisiTengah: null,
    tersenyum: false,
    berkedip: false,
    posisiKanan: false,
    posisiKiri: false,
  },
  smileDuration: 0,
  isSmiling: false,
  smileStartTime: null,
  Liveness: false,
  faceMovement: "Tidak ada",
  previousNosePosition: null,
  blinkStartTime: null,
  isBlinking: false,
  neutralLandmarks: null,
  setNeutral: false,
  centerPositionStartTime: null,
});

const calibrate = async () => {
  try {
    const videoElement = video.value;
    const { $detector } = useNuxtApp();
    const detector = $detector;

    if (!detector || !videoElement) {
      console.error("Detector atau elemen video tidak ditemukan.");
      return;
    }

    const faces = await detector.estimateFaces(videoElement, {
      flipHorizontal: false,
    });

    state.neutralLandmarks = faces[0].keypoints[1];
    state.setNeutral = true;
    console.log(state.neutralLandmarks);
  } catch (e) {
    console.error("Error in detecting faces:", e);
  } // Reset kalibrasi
};

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
      face.keypoints
        // .filter(
        //   (keypoint, index) =>
        //     (keypoint.name === "lips" && (index === 61 || index === 308)) ||
        //     (keypoint.name === "rightEye" &&
        //       (index === 159 || index === 144)) ||
        //     (keypoint.name === "leftEye" && (index === 386 || index === 373)) ||
        //     index === 1
        //   // Hanya pilih indeks 61 dan 291
        // )
        .forEach((keypoint) => {
          const [x, y] = [keypoint.x, keypoint.y];
          context.beginPath();
          context.arc(x, y, 2, 0, 2 * Math.PI);
          context.fillStyle = "red";
          context.fill();
        });

      const keypoints = face.keypoints;

      const leftMouthCorner = keypoints[61];
      const rightMouthCorner = keypoints[308];
      const mouthWidth = Math.abs(rightMouthCorner.x - leftMouthCorner.x);

      const isCurrentlySmiling = mouthWidth > 90;
      if (isCurrentlySmiling) {
        state.expression.tersenyum = true;
      } else {
        state.expression.tersenyum = false;
      }
      // if (isCurrentlySmiling) {
      //   if (!state.isSmiling) {
      //     state.expression.tersenyum = true;
      //     state.smileStartTime = Date.now();
      //   } else {
      //     state.smileDuration = (Date.now() - state.smileStartTime) / 1000;
      //   }
      // } else {
      //   state.expression.tersenyum = false;
      //   state.smileStartTime = null;
      //   state.smileDuration = 0;
      //   state.faceMovement = "Tidak ada";
      // }

      const leftEyeBottom = keypoints[386];
      const leftEyeTop = keypoints[373];
      const leftEyeWidth = Math.abs(leftEyeBottom.y - leftEyeTop.y);

      const isBlinkingNow = leftEyeWidth < 8;
      console.log(leftEyeWidth);

      if (isBlinkingNow) {
        state.expression.berkedip = true;
      } else {
        state.expression.berkedip = false;
      }

      const nose = keypoints[1];

      state.position = nose;

      state.expression.posisiTengah = nose.z >= -64 && nose.z <= -52;

      if (state.neutralLandmarks) {
        if (state.neutralLandmarks.x - nose.x < -50) {
          state.expression.posisiKiri = true;
        } else {
          state.expression.posisiKiri = false;
        }

        if (state.neutralLandmarks.x - nose.x > 50) {
          state.expression.posisiKanan = true;
        } else {
          state.expression.posisiKanan = false;
        }
        // console.log(state.neutralLandmarks.x - nose.x);
      }

      // if (state.expression.posisiTengah) {
      //   if (!state.setNeutral) {
      //     calibrate();
      //   }
      // } else {
      //   state.setNeutral = false;
      //   state.neutralLandmarks = null;
      // }

      // console.log(keypoints.filter((keypoint) => keypoint.name === "lips"));

      // const rightEyeIndicate = [];
      // keypoints.forEach((keypoint, index) => {
      //   if (keypoint.name === "leftEye") {
      //     rightEyeIndicate.push(index); // Menambahkan indeks yang memenuhi kondisi
      //   }
      // });

      // console.log("mata kanan", keypoints[1]);
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
video,
canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px; /* Ukuran diameter lingkaran */
  height: 360px; /* Sama dengan width untuk bentuk bulat */
  transform: translate(-50%, -50%) scaleX(-1); /* Memusatkan dan membalik */
  border-radius: 50%; /* Membuat elemen menjadi bulat */
  object-fit: cover; /* Memastikan isi sesuai tanpa distorsi */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Opsional: Efek bayangan */
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
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

.click-button {
  position: absolute;
  top: 50px;
  left: 50px;
  z-index: 1000; /* Menambahkan z-index agar tombol berada di atas elemen lain */
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.click-button:hover {
  background-color: #45a049;
}
.center-line {
  position: absolute;
  background-color: red; /* Warna garis tengah */
  z-index: 999; /* Pastikan garis berada di atas elemen lain */
}

.center-line.vertical {
  top: 0;
  left: 50%;
  height: 100%;
  width: 2px; /* Ketebalan garis vertikal */
  transform: translateX(-50%); /* Agar garis pas di tengah secara horizontal */
}

.center-line.horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px; /* Ketebalan garis horizontal */
  transform: translateY(-50%); /* Agar garis pas di tengah secara vertikal */
}
.status-circle-green {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: green;
  display: inline-block;
  margin-left: 10px;
}

.status-circle-red {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: red;
  display: inline-block;
  margin-left: 10px;
}
</style>
