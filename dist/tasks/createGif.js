"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
const index_1 = __importDefault(require("../index"));
const argv = minimist_1.default(process.argv.slice(2));
const images = argv.i || argv.images;
const frames = argv.f || argv.frames || 20;
const delay = argv.d || argv.delay || 40;
assert_1.default(images, 'images should be provided');
(async function createGif() {
    try {
        const facemorph = index_1.default(frames);
        const gifBuffer = await facemorph.createGif(images instanceof Array ? images : [images], delay);
        const newFile = path_1.default.join(__dirname, `facemorph_${Date.now()}.gif`);
        await fs_1.default.promises.writeFile(newFile, gifBuffer);
        console.log(`Your new gif: ${newFile}`);
    }
    catch (err) {
        console.error(`Error creating facemorph gif`, err);
    }
    finally {
        process.exit();
    }
})();
