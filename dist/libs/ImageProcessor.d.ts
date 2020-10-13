/// <reference types="node" />
import { Readable } from 'stream';
/**
 * @MorfImage
 * "string": local filepath to the image
 * "Buffer": raw buffer of the image
 * "Readable": readable stream of image that can be piped to writable stream
 **/
export declare type MorfImage = string | Buffer | Readable;
declare const _default: {
    resizeImage(img: MorfImage, size: number | string, grayScale?: boolean | undefined): Promise<Buffer>;
    toSquare(img: MorfImage): Promise<Buffer>;
    imgToBuffer(img: MorfImage): Promise<Buffer>;
    bufferToStream(buf: Buffer): Readable;
    streamToBuffer(str: Readable): Promise<Buffer>;
};
export default _default;
