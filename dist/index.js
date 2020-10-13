"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const canvas_1 = require("canvas");
const FacialRecognition_1 = __importDefault(require("./libs/FacialRecognition"));
const GifCreator_1 = __importDefault(require("./libs/GifCreator"));
const ImageProcessor_1 = __importDefault(require("./libs/ImageProcessor"));
// import ImgWarper from './libs/ImgWarper'
const ImgWarper = require('./libs/ImgWarper');
function Facemorph(frames = 20) {
    return {
        frames,
        setFrames(f) {
            return (this.frames = f);
        },
        async createGif(imgs, gifDelayMs = 100, repeat = 0 // -1: no repeat, 0: repeat
        ) {
            const allFrames = await this.createFrames(imgs);
            const frames = allFrames
                .map((buffers, i) => {
                if (i === 0)
                    return buffers.slice(0, buffers.length - 2);
                return buffers.slice(1);
            })
                .flat(1);
            const { width } = await ImageProcessor_1.default.sizeOf(frames[0]);
            assert_1.default(width, 'width should be retrievable');
            const gifer = GifCreator_1.default(width, width, gifDelayMs, repeat);
            return await gifer.create(...frames);
        },
        async createFrames(imgs) {
            const cleanedImgs = await this.makeImagesConsistent(imgs);
            const imagePairs = (await Promise.all(cleanedImgs.map(async (img) => {
                const { width, height } = await ImageProcessor_1.default.sizeOf(img);
                assert_1.default(width && height, 'width and height should be retrievable');
                const buffer = await ImageProcessor_1.default.imgToBuffer(img);
                return {
                    original: img,
                    buffer,
                    detections: (await FacialRecognition_1.default.drawFaceOutlines(buffer))[0],
                    width,
                    height,
                };
            }))).reduce((imgArrays, img, ind, ary) => {
                if (imgs[ind + 1])
                    imgArrays.push([img, ary[ind + 1]]);
                return imgArrays;
            }, []);
            assert_1.default(imagePairs.length > 0, 'should have at least one pair of images to morph');
            const gifImageDataFrames = await Promise.all(imagePairs.map(async ([img1, img2]) => {
                assert_1.default.strictEqual(1, img1.detections.length, 'image should only detect one face');
                assert_1.default.strictEqual(1, img2.detections.length, 'image should only detect one face');
                const [point1, point2] = await this.getPointDefiners(img1, img2);
                const animator = new ImgWarper.Animator(point1, point2);
                animator.generate(this.frames);
                return animator.frames;
            }));
            return await this.getBuffersFromFrames(gifImageDataFrames, imagePairs[0][0].width, imagePairs[0][0].height);
        },
        async makeImagesConsistent(imgs) {
            const [ref, ...rest] = imgs;
            const refSm = await ImageProcessor_1.default.resizeImage(ref, 500);
            const refSq = await ImageProcessor_1.default.toSquare(refSm);
            const reference = await ImageProcessor_1.default.putOnWhiteBg(refSq);
            const { width } = await ImageProcessor_1.default.sizeOf(reference);
            assert_1.default(width, 'width should be retrievable for img');
            const restBuffers = await Promise.all(rest.map(async (img) => {
                const smBuff = await ImageProcessor_1.default.resizeImage(img, 500);
                const sqBuff = await ImageProcessor_1.default.toSquare(smBuff);
                const whBuff = await ImageProcessor_1.default.putOnWhiteBg(sqBuff);
                return await ImageProcessor_1.default.resizeImage(whBuff, width);
            }));
            return [reference, ...restBuffers];
        },
        async getBuffersFromFrames(imageDataFrames, width = 400, height = 400) {
            return await Promise.all(imageDataFrames.map(async (frames) => {
                return await Promise.all(frames.map(async (frame) => {
                    const canv = canvas_1.createCanvas(width, height);
                    canv.getContext('2d').putImageData(frame, 0, 0);
                    return await new Promise((resolve, reject) => {
                        canv.toBuffer((err, buffer) => {
                            if (err)
                                return reject(err);
                            resolve(buffer);
                        });
                    });
                }));
            }));
        },
        async getPointDefiners(i1, i2) {
            const img1Points = i1.detections[0].landmarks._positions.map(({ _x, _y }) => new ImgWarper.Point(_x, _y));
            const img2Points = i2.detections[0].landmarks._positions.map(({ _x, _y }) => new ImgWarper.Point(_x, _y));
            // image 1 info
            const canv1 = canvas_1.createCanvas(i1.width, i2.height);
            const ctx1 = canv1.getContext('2d');
            const img1 = await canvas_1.loadImage(i1.buffer);
            ctx1.drawImage(img1, 0, 0);
            // image 2 info
            const canv2 = canvas_1.createCanvas(i2.width, i2.height);
            const ctx2 = canv2.getContext('2d');
            const img2 = await canvas_1.loadImage(i2.buffer);
            ctx2.drawImage(img2, 0, 0);
            const pointDefiner1 = {
                imgData: ctx1.getImageData(0, 0, i1.width, i1.height),
                oriPoints: img1Points,
            };
            const pointDefiner2 = {
                imgData: ctx2.getImageData(0, 0, i2.width, i2.height),
                oriPoints: img2Points,
            };
            return [pointDefiner1, pointDefiner2];
        },
    };
}
exports.default = Facemorph;
