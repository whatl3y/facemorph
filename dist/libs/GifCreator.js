"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const gifencoder_1 = __importDefault(require("gifencoder"));
const ImageProcessor_1 = __importDefault(require("./ImageProcessor"));
// import pngFileStream from 'png-file-stream'
const pngFileStream = require('png-file-stream');
const repoTmpDir = path_1.default.join(__dirname, '..', '..', 'tmp');
function GifCreator(width, height, delay = 100, repeat = -1, quality = 10) {
    return {
        encoder: new gifencoder_1.default(width, height),
        async create(...buffers) {
            const instTmpDir = path_1.default.join(repoTmpDir, Date.now().toString());
            // create dir
            await createDirIgnoreErrors(repoTmpDir);
            await createDirIgnoreErrors(instTmpDir);
            await Promise.all(buffers.map(async (buf, ind) => {
                await fs_1.default.promises.writeFile(path_1.default.join(instTmpDir, `img${(ind + 1).toString().padStart(5, '0')}.png`), buf);
            }));
            const writeStream = this.encoder.createWriteStream({
                repeat,
                delay,
                quality,
            });
            pngFileStream(path_1.default.join(instTmpDir, '*.png')).pipe(writeStream);
            const finalGifBuffer = await ImageProcessor_1.default.streamToBuffer(writeStream);
            await rmDirIgnoreErrors(instTmpDir);
            return finalGifBuffer;
        },
    };
}
exports.default = GifCreator;
async function createDirIgnoreErrors(dir) {
    try {
        await fs_1.default.promises.mkdir(dir);
    }
    catch (err) { }
}
async function rmDirIgnoreErrors(dir) {
    try {
        await fs_1.default.promises.rmdir(dir, { recursive: true });
    }
    catch (err) { }
}
