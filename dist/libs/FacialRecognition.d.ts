/// <reference types="node" />
import '@tensorflow/tfjs-node';
import * as faceapi from 'face-api.js';
declare const _default: {
    faceDetectionNet: faceapi.SsdMobilenetv1;
    faceLandmarkNet: faceapi.FaceLandmark68Net;
    loadedNet: boolean;
    init(): Promise<void>;
    drawFaceOutlines(imageInfo: Buffer | string): Promise<any[]>;
    getFaceDetectorOptions(net?: faceapi.SsdMobilenetv1 | undefined): faceapi.TinyFaceDetectorOptions | faceapi.SsdMobilenetv1Options;
};
export default _default;
