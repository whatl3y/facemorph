import path from 'path'

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
import '@tensorflow/tfjs-node'

import * as canvas from 'canvas'
import * as faceapi from 'face-api.js'
// import * as faceapi from '@vladmandic/face-api'

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData }: any = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

export default {
  faceDetectionNet: faceapi.nets.ssdMobilenetv1,
  faceLandmarkNet: faceapi.nets.faceLandmark68Net,
  loadedNet: false,

  async init() {
    if (this.loadedNet) return

    await this.faceDetectionNet.loadFromDisk(
      path.join(__dirname, '..', '..', 'weights')
    )
    await this.faceLandmarkNet.loadFromDisk(
      path.join(__dirname, '..', '..', 'weights')
    )
    this.loadedNet = true
  },

  async drawFaceOutlines(imageInfo: Buffer | string) {
    await this.init()
    const img: canvas.Image = await canvas.loadImage(imageInfo)
    const detections = await faceapi
      .detectAllFaces(
        img as any,
        this.getFaceDetectorOptions(this.faceDetectionNet)
      )
      .withFaceLandmarks()

    const out = faceapi.createCanvasFromMedia(img as any)
    faceapi.draw.drawDetections(out, detections)

    return [detections, (out as any).toBuffer('image/jpeg')]
  },

  getFaceDetectorOptions(net?: faceapi.SsdMobilenetv1) {
    // SsdMobilenetv1Options
    const minConfidence = 0.5

    // TinyFaceDetectorOptions
    const inputSize = 408
    const scoreThreshold = 0.5

    return net === faceapi.nets.ssdMobilenetv1
      ? new faceapi.SsdMobilenetv1Options({ minConfidence })
      : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
  },
}
