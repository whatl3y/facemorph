/// <reference types="node" />
import { ImageData } from 'canvas';
import { FacemorphImage } from './libs/ImageProcessor';
interface IFacemorphee {
    original: FacemorphImage;
    buffer: Buffer;
    detections: any;
    width: number;
    height: number;
}
export default function Facemorph(frames?: number): {
    frames: number;
    setFrames(f: number): number;
    createGif(imgs: FacemorphImage[], gifDelayMs?: number, repeat?: number): Promise<Buffer>;
    createFrames(imgs: FacemorphImage[]): Promise<Buffer[][]>;
    makeImagesConsistent(imgs: FacemorphImage[]): Promise<Buffer[]>;
    getBuffersFromFrames(imageDataFrames: ImageData[][], width?: number, height?: number): Promise<Buffer[][]>;
    getPointDefiners(i1: IFacemorphee, i2: IFacemorphee): Promise<{
        imgData: ImageData;
        oriPoints: any;
    }[]>;
};
export {};
