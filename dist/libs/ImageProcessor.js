"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
exports.default = {
    // async removeBg(apiKey: string, file: Buffer | Readable): Promise<Buffer> {
    //   const form = new FormData()
    //   form.append(`image_file`, file)
    //   form.append('size', 'auto')
    //   const { data } = await axios.post(
    //     `https://api.remove.bg/v1.0/removebg`,
    //     form,
    //     {
    //       headers: {
    //         'X-API-Key': apiKey,
    //         ...form.getHeaders(),
    //       },
    //       responseType: 'arraybuffer',
    //     }
    //   )
    //   return data
    // },
    async resizeImage(img, size, grayScale) {
        const imgBuffer = await this.imgToBuffer(img);
        let sharpImg = sharp_1.default(imgBuffer)
            .rotate()
            .resize(parseInt(size.toString()));
        if (grayScale) {
            sharpImg = sharpImg.grayscale();
        }
        return await sharpImg.toBuffer();
    },
    async toSquare(img) {
        const imgBuffer = await this.imgToBuffer(img);
        const shImg = sharp_1.default(imgBuffer);
        const { width, height } = await shImg.metadata();
        assert_1.default(width && height, 'width and height need to be available for squaring an image');
        const length = Math.min(width, height);
        const left = Math.max(0, (width || length) / 2 - length / 2);
        const top = Math.max(0, (height || length) / 2 - length / 2);
        return await shImg
            .extract({
            left: Math.floor(left),
            top: Math.floor(top),
            width: length,
            height: length,
        })
            .png()
            .toBuffer();
    },
    async imgToBuffer(img) {
        if (typeof img === 'string')
            return await fs_1.default.promises.readFile(img);
        if (img instanceof stream_1.Readable)
            return await this.streamToBuffer(img);
        return img;
    },
    bufferToStream(buf) {
        const readable = new stream_1.Readable();
        readable._read = () => { }; // _read is required but NOOPing it
        readable.push(buf);
        readable.push(null);
        return readable;
    },
    async streamToBuffer(str) {
        return await new Promise((resolve, reject) => {
            let data = [];
            str
                .on('error', reject)
                .on('data', (chunk) => data.push(chunk))
                .on('end', () => resolve(Buffer.concat(data)));
        });
    },
};
