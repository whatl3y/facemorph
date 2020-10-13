/// <reference types="node" />
import { Readable } from 'stream';
import sharp from 'sharp';
/**
 * @FacemorphImage
 * "string": local filepath to the image
 * "Buffer": raw buffer of the image
 * "Readable": readable stream of image that can be piped to writable stream
 **/
export declare type FacemorphImage = string | Buffer | Readable;
declare const _default: {
    sizeOf(img: FacemorphImage): Promise<sharp.Metadata>;
    resizeImage(img: FacemorphImage, size: number, grayScale?: boolean | undefined): Promise<Buffer>;
    toSquare(img: FacemorphImage): Promise<Buffer>;
    putOnWhiteBg(img: FacemorphImage): Promise<Buffer>;
    imgToBuffer(img: FacemorphImage): Promise<Buffer>;
    bufferToStream(buf: Buffer): Readable;
    streamToBuffer(str: Readable): Promise<Buffer>;
};
export default _default;
