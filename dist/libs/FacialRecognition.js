"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
require("@tensorflow/tfjs-node");
const canvas = __importStar(require("canvas"));
const faceapi = __importStar(require("face-api.js"));
// import * as faceapi from '@vladmandic/face-api'
// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
exports.default = {
    faceDetectionNet: faceapi.nets.ssdMobilenetv1,
    faceLandmarkNet: faceapi.nets.faceLandmark68Net,
    loadedNet: false,
    async init() {
        if (this.loadedNet)
            return;
        await this.faceDetectionNet.loadFromDisk(path_1.default.join(__dirname, '..', '..', 'weights'));
        await this.faceLandmarkNet.loadFromDisk(path_1.default.join(__dirname, '..', '..', 'weights'));
        this.loadedNet = true;
    },
    async drawFaceOutlines(imageInfo) {
        await this.init();
        const img = await canvas.loadImage(imageInfo);
        const detections = await faceapi
            .detectAllFaces(img, this.getFaceDetectorOptions(this.faceDetectionNet))
            .withFaceLandmarks();
        const out = faceapi.createCanvasFromMedia(img);
        faceapi.draw.drawDetections(out, detections);
        return [detections, out.toBuffer('image/jpeg')];
    },
    getFaceDetectorOptions(net) {
        // SsdMobilenetv1Options
        const minConfidence = 0.5;
        // TinyFaceDetectorOptions
        const inputSize = 408;
        const scoreThreshold = 0.5;
        return net === faceapi.nets.ssdMobilenetv1
            ? new faceapi.SsdMobilenetv1Options({ minConfidence })
            : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
    },
};
