// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  plugins: [{ src: "~/plugins/faceLandmark.js", mode: "client" }],
  build: {
    transpile: [
      '@tensorflow-models/face-landmarks-detection', 
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-backend-webgl'
    ]
  },
  vite: {
    optimizeDeps: {
      include: [
        '@tensorflow-models/face-landmarks-detection',
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-backend-webgl'
      ],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    ssr: {
      noExternal: [
        '@tensorflow-models/face-landmarks-detection',
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-backend-webgl'
      ]
    }
  },
  webpack: {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
})
