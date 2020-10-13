/// <reference types="node" />
import GIFEncoder from 'gifencoder';
export default function GifCreator(width: number, height: number, delay?: number, repeat?: number, quality?: number): {
    encoder: GIFEncoder;
    create(...buffers: Buffer[]): Promise<Buffer>;
};
