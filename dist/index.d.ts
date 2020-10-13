/// <reference types="node" />
import { ImageData } from 'canvas';
import { MorfImage } from './libs/ImageProcessor';
interface IMorfee {
    original: MorfImage;
    buffer: Buffer;
    detections: any;
    width: number;
    height: number;
}
export default function Morf(frames?: number): {
    frames: number;
    setFrames(f: number): number;
    createGif(imgs: MorfImage[], gifDelayMs?: number): Promise<Buffer>;
    createFrames(imgs: MorfImage[]): Promise<Buffer[][]>;
    makeImagesConsistent(imgs: MorfImage[]): Promise<Buffer[]>;
    getBuffersFromFrames(imageDataFrames: ImageData[][], width?: number, height?: number): Promise<Buffer[][]>;
    getPointDefiners(i1: IMorfee, i2: IMorfee): Promise<{
        imgData: ImageData;
        oriPoints: any;
    }[]>;
};
export {};
